#!/usr/bin/env python3
"""
ingest_data.py — GTBank CFO Dashboard: Excel → PostgreSQL ingestion
Reads test.xlsx, pushes 'before' and 'after' GL balance states into FinancialDB.

Usage:
    python ingest_data.py
"""

import subprocess, sys

# ── Auto-install dependencies ─────────────────────────────────────────────────
REQUIRED = ['pandas', 'sqlalchemy', 'psycopg2-binary', 'openpyxl']
try:
    import pandas as pd
    from sqlalchemy import create_engine, text
except ImportError:
    print("📦 Installing required packages...")
    subprocess.run([sys.executable, '-m', 'pip', 'install'] + REQUIRED,
                   check=True, capture_output=False)
    import pandas as pd
    from sqlalchemy import create_engine, text

# ── Configuration ─────────────────────────────────────────────────────────────
EXCEL_PATH = r'C:\Users\USER\Desktop\Development Project\Gtbank\test.xlsx'
DB_URL     = 'postgresql://postgres:password@localhost:5432/FinancialDB'
PERIOD     = '2024-12'

# ── "After" adjustment rules ──────────────────────────────────────────────────
# Mapped from user's logical names to actual fs_line values found in the Excel.
# Each rule multiplies both adjusted_balance and final_balance.
FS_LINE_ADJUSTMENTS = {
    # User: "Net Interest Income +5%" → actual fs_line: Interest income
    'Interest income':              1.05,
    # User: "Operating Expenses +3%" → actual fs_lines below
    'Personnel expenses':           1.03,
    'Other operating expenses':     1.03,
    'Depreciation and amortization':1.03,
    # User: "Customer Deposits +2%" → actual fs_line: Deposits from customers
    'Deposits from customers':      1.02,
}

# Provision note_line patterns → +8% on final_balance + adjusted_balance
PROVISION_PATTERNS = ['provision', 'loan loss', 'impair']


# ── DB Schema ─────────────────────────────────────────────────────────────────
def create_tables(engine):
    print("🗄️  Creating / verifying database tables...")
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
                period              VARCHAR DEFAULT '2024-12',
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
                status        VARCHAR
            )
        """))
        # Seed current_state (one row, always id=1)
        conn.execute(text("""
            INSERT INTO current_state (id, active_state, last_synced)
            VALUES (1, 'before', NOW())
            ON CONFLICT (id) DO NOTHING
        """))
    print("   ✅ Tables ready")


# ── Excel Loader ──────────────────────────────────────────────────────────────
def load_excel():
    print(f"\n📖 Reading: {EXCEL_PATH}")
    # Column indices (0-based): 2=GL, 3=Desc, 4=Prelim, 5=ADJ, 9=FS Line, 10=Note Line
    df = pd.read_excel(
        EXCEL_PATH,
        header=0,
        usecols=[2, 3, 4, 5, 9, 10],
        names=['gl_code', 'description', 'preliminary_balance',
               'adjusted_balance', 'fs_line', 'note_line'],
    )
    original = len(df)
    df = df.dropna(subset=['gl_code'])          # drop rows with no GL code
    skipped = original - len(df)

    # Numeric cleanup
    for col in ['preliminary_balance', 'adjusted_balance']:
        df[col] = pd.to_numeric(
            df[col].astype(str).str.replace(r'[,₦$\s]', '', regex=True),
            errors='coerce'
        ).fillna(0)

    # Final balance = Preliminary + ADJ (mirrors the =E+F formula in Excel)
    df['final_balance'] = df['preliminary_balance'] + df['adjusted_balance']

    # String cleanup
    df['gl_code']     = df['gl_code'].astype(str).str.strip()
    df['description'] = df['description'].fillna('').astype(str).str.strip()
    df['fs_line']     = df['fs_line'].fillna('Unclassified').astype(str).str.strip()
    df['note_line']   = df['note_line'].fillna('').astype(str).str.strip()
    df['period']      = PERIOD

    print(f"   ✅ {len(df)} GL rows loaded  |  {skipped} rows skipped (no GL code)")
    return df, skipped


# ── "After" state builder ─────────────────────────────────────────────────────
def build_after(df):
    print("\n⚙️  Building 'after' state with journal adjustments...")
    after = df.copy()
    total_modified = 0

    # FS Line adjustments
    for fs, factor in FS_LINE_ADJUSTMENTS.items():
        mask = after['fs_line'] == fs
        if mask.any():
            after.loc[mask, 'adjusted_balance'] *= factor
            after.loc[mask, 'final_balance']    *= factor
            total_modified += int(mask.sum())
            print(f"   ✏️  '{fs}': ×{factor} — {int(mask.sum())} rows")
        else:
            print(f"   ⚠️  Warning: fs_line '{fs}' not found — skipped")

    # Provision note_line adjustments (+8%)
    prov_mask = after['note_line'].str.lower().str.contains(
        '|'.join(PROVISION_PATTERNS), na=False
    )
    if prov_mask.any():
        after.loc[prov_mask, 'adjusted_balance'] *= 1.08
        after.loc[prov_mask, 'final_balance']    *= 1.08
        total_modified += int(prov_mask.sum())
        print(f"   ✏️  Provision/Impairment note_lines: ×1.08 — {int(prov_mask.sum())} rows")

    print(f"   ✅ {total_modified} rows modified for 'after' state")
    return after


# ── Push to DB ────────────────────────────────────────────────────────────────
COLS = ['gl_code', 'description', 'preliminary_balance', 'adjusted_balance',
        'final_balance', 'fs_line', 'note_line', 'period', 'state']

def push_state(df, engine, state):
    with engine.begin() as conn:
        conn.execute(text(
            "DELETE FROM gl_balances WHERE state = :s AND period = :p"
        ), {'s': state, 'p': PERIOD})
    out = df.copy()
    out['state'] = state
    out[COLS].to_sql('gl_balances', engine, if_exists='append', index=False)
    return len(out)


# ── Ingestion Log ─────────────────────────────────────────────────────────────
def log_run(engine, filename, total_rows, skipped):
    with engine.begin() as conn:
        conn.execute(text("""
            INSERT INTO ingestion_log
                (filename, uploaded_at, rows_ingested, rows_skipped, state_loaded, status)
            VALUES (:fn, NOW(), :ri, :rs, 'before+after', 'success')
        """), {'fn': filename, 'ri': total_rows, 'rs': skipped})


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  GTBank CFO Dashboard — Data Ingestion Script")
    print("=" * 60)

    try:
        engine = create_engine(DB_URL)
        # Test connection
        with engine.connect() as c:
            c.execute(text("SELECT 1"))
        print(f"✅ Connected to PostgreSQL: {DB_URL}")
    except Exception as e:
        print(f"\n❌ Cannot connect to database: {e}")
        print("   Check that PostgreSQL is running and credentials are correct.")
        sys.exit(1)

    create_tables(engine)
    before_df, skipped = load_excel()
    after_df = build_after(before_df)

    print("\n💾 Writing to PostgreSQL...")
    n_before = push_state(before_df, engine, 'before')
    n_after  = push_state(after_df,  engine, 'after')

    log_run(engine, EXCEL_PATH, n_before + n_after, skipped)

    print(f"\n{'='*60}")
    print(f"✅ Before state: {n_before} rows loaded.")
    print(f"✅ After state:  {n_after} rows loaded.")
    print(f"✅ Database ready — run the dashboard server to visualise.")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
