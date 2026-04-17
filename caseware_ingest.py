# pip install pandas sqlalchemy psycopg2-binary openpyxl
import os
import pandas as pd
from sqlalchemy import create_engine, text

# ── DB Schema Setup ─────────────────────────────────────────────────────────────
def create_tables(engine):
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS gl_balances (
                id                  SERIAL PRIMARY KEY,
                gl_code             VARCHAR,
                description         VARCHAR,
                preliminary_balance NUMERIC DEFAULT 0,
                adjusted_balance    NUMERIC DEFAULT 0,
                final_balance       NUMERIC DEFAULT 0,
                fs_line             VARCHAR,
                note_line           VARCHAR,
                period              VARCHAR,
                state               VARCHAR
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS current_state (
                id           INTEGER PRIMARY KEY,
                active_state VARCHAR,
                last_synced  TIMESTAMP DEFAULT NOW()
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS ingestion_log (
                id            SERIAL PRIMARY KEY,
                filename      VARCHAR,
                uploaded_at   TIMESTAMP DEFAULT NOW(),
                rows_ingested INTEGER,
                rows_skipped  INTEGER,
                state_loaded  VARCHAR,
                status        VARCHAR,
                message       TEXT
            )
        """))
        # Add message column if it doesn't exist (migration safety)
        conn.execute(text("""
            ALTER TABLE ingestion_log
            ADD COLUMN IF NOT EXISTS message TEXT
        """))
        conn.execute(text("""
            INSERT INTO current_state (id, active_state, last_synced)
            VALUES (1, 'before', NOW())
            ON CONFLICT (id) DO NOTHING
        """))

# ── Column detection ────────────────────────────────────────────────────────────
COLUMN_ALIASES = {
    'gl_code':             ['gl', 'gl code', 'gl_code', 'account', 'account code', 'acct'],
    'description':         ['description', 'desc', 'account name', 'name'],
    'preliminary_balance': ['preliminary balance', 'preliminary_balance', 'prelim',
                            'prelim balance', 'before adj'],
    'adjusted_balance':    ['adj', 'adjustments', 'adjustment', 'adjusted_balance',
                            'adjusted balance'],
    'final_balance':       ['final 2024', 'final balance', 'final_balance', 'final',
                            'closing balance'],
    'fs_line':             ['fs line', 'fs_line', 'financial statement line', 'fs category'],
    'note_line':           ['note line', 'note_line', 'note', 'notes'],
}

def detect_columns(df_cols):
    """Map raw Excel header names to canonical column names (case-insensitive)."""
    normalised = {c.strip().lower(): c for c in df_cols}
    mapping = {}
    for canon, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias in normalised:
                mapping[normalised[alias]] = canon
                break
    return mapping

def clean_numeric(series):
    """Strip $, commas, spaces; convert (x) accounting-negative to -x."""
    s = series.astype(str).str.replace(r'[$,\s]', '', regex=True)
    s = s.apply(lambda x: '-' + x.replace('(', '').replace(')', '')
                if '(' in str(x) else x)
    return pd.to_numeric(s, errors='coerce').fillna(0)

# ── Main ingestion ──────────────────────────────────────────────────────────────
def ingest_file(excel_path: str, db_url: str):
    """
    Core ingestion logic for CaseWare Excel exports.
    Detects columns by name, writes BOTH 'before' and 'after' states,
    and resets current_state to 'before'.
    Called by watcher.py and the Node /api/sync-caseware endpoint.
    """
    engine = create_engine(db_url)
    create_tables(engine)

    filename = os.path.basename(excel_path)
    print(f"Reading: {filename}")

    try:
        # Read all columns; try default sheet first
        try:
            raw = pd.read_excel(excel_path, header=0, dtype=str)
        except Exception:
            raw = pd.read_excel(excel_path, sheet_name=0, header=0, dtype=str)

        print(f"Columns found: {list(raw.columns)}")

        col_map = detect_columns(raw.columns)
        if not col_map:
            raise ValueError(
                f"Could not detect required columns.\nFound: {list(raw.columns)}\n"
                "Expected headers like: GL, Description, Preliminary balance, "
                "ADJ, Final 2024, FS Line, Note Line"
            )

        df = raw.rename(columns=col_map)

        # Ensure all required columns exist (fill missing optional ones)
        for col in ['gl_code', 'description', 'preliminary_balance',
                    'adjusted_balance', 'final_balance', 'fs_line', 'note_line']:
            if col not in df.columns:
                df[col] = '' if col in ('fs_line', 'note_line', 'description') else '0'

        df = df[['gl_code', 'description', 'preliminary_balance',
                  'adjusted_balance', 'final_balance', 'fs_line', 'note_line']]

        original_len = len(df)

        # Drop entirely empty rows
        df = df.dropna(subset=['gl_code', 'description'], how='all')

        # Keep only data rows whose gl_code begins with a digit
        df = df[df['gl_code'].astype(str).str.strip().str.match(r'^\d')]
        skipped = original_len - len(df)

        for col in ['preliminary_balance', 'adjusted_balance', 'final_balance']:
            df[col] = clean_numeric(df[col])

        df['gl_code']     = df['gl_code'].astype(str).str.strip()
        df['description'] = df['description'].fillna('').astype(str).str.strip()
        df['fs_line']     = df['fs_line'].fillna('Unclassified').astype(str).str.strip()
        df['note_line']   = df['note_line'].fillna('').astype(str).str.strip()
        df['period']      = '2024-12'

        # ── 'before' state: raw unadjusted data ──────────────────────────────
        before_df = df.copy()
        before_df['state'] = 'before'

        # ── 'after' state: apply standard journal adjustments ─────────────────
        after_df = df.copy()
        after_df['state'] = 'after'

        NII_LINES  = ['Interest income']
        OPEX_LINES = ['Personnel expenses', 'Other operating expenses']
        DEP_LINES  = ['Deposits from customers']

        after_df.loc[after_df['fs_line'].isin(NII_LINES),  'final_balance'] *= 1.05
        after_df.loc[after_df['fs_line'].isin(OPEX_LINES), 'final_balance'] *= 1.03
        after_df.loc[after_df['fs_line'].isin(DEP_LINES),  'final_balance'] *= 1.02

        combined      = pd.concat([before_df, after_df], ignore_index=True)
        rows_ingested = len(combined)

        # ── Write to DB ───────────────────────────────────────────────────────
        with engine.begin() as conn:
            conn.execute(text("DELETE FROM gl_balances"))   # full replace

        combined.to_sql('gl_balances', engine, if_exists='append', index=False)

        with engine.begin() as conn:
            conn.execute(text(
                "UPDATE current_state SET active_state = 'before', last_synced = NOW() WHERE id = 1"
            ))
            conn.execute(text("""
                INSERT INTO ingestion_log
                    (filename, rows_ingested, rows_skipped, state_loaded, status, message)
                VALUES (:fn, :ingested, :skipped, 'before', 'success', :msg)
            """), {
                'fn':       filename,
                'ingested': rows_ingested,
                'skipped':  skipped,
                'msg':      f'Both states loaded. {len(before_df)} GL lines per state.',
            })

        print(f"Rows ingested: {rows_ingested}")
        print(f"Successfully ingested {filename}.")
        return {"status": "success", "rows_ingested": rows_ingested, "rows_skipped": skipped}

    except Exception as e:
        msg = str(e)
        print(f"Ingestion failed: {msg}")
        try:
            with engine.begin() as conn:
                conn.execute(text("""
                    INSERT INTO ingestion_log
                        (filename, rows_ingested, rows_skipped, state_loaded, status, message)
                    VALUES (:fn, 0, 0, 'failed', 'error', :msg)
                """), {'fn': filename, 'msg': msg})
        except Exception:
            pass
        return {"status": "error", "message": msg}


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python caseware_ingest.py <filepath> <db_url>")
        sys.exit(1)

    filepath = sys.argv[1]
    db_url   = sys.argv[2]
    result   = ingest_file(filepath, db_url)

    if result["status"] == "error":
        sys.exit(1)
