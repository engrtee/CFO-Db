import pandas as pd
from sqlalchemy import create_engine, text
import os

# --- CONFIG ---
EXCEL_FILE = r"C:\Users\USER\Zenith\Communication site - Documents\CasewareExport\test.xlsx"
DB_URL = "postgresql://postgres:Password@localhost:5432/FinancialDB"

def clean_numeric(series):
    return pd.to_numeric(
        series.astype(str)
            .str.replace(',', '')
            .str.replace('₦', '')
            .str.replace('(', '-')
            .str.replace(')', '')
            .str.strip(),
        errors='coerce'
    ).fillna(0)

def ingest_file(filepath, state):
    print(f"📂 Loading {filepath} as state='{state}'...")
    
    df = pd.read_excel(filepath)
    
    # Rename columns to match exact headers
    df.columns = ['gl_code', 'description', 'preliminary_balance', 
                  'adjusted_balance', 'final_balance', 'fs_line', 'note_line']
    
    # Drop completely empty rows
    df = df.dropna(subset=['gl_code', 'description'], how='all')
    
    # Clean numeric columns
    df['preliminary_balance'] = clean_numeric(df['preliminary_balance'])
    df['adjusted_balance']    = clean_numeric(df['adjusted_balance'])
    df['final_balance']       = clean_numeric(df['final_balance'])
    
    # Fill empty fs_line and note_line
    df['fs_line']   = df['fs_line'].fillna('Unclassified')
    df['note_line'] = df['note_line'].fillna('Unclassified')
    
    # Add required columns
    df['period'] = '2024-12'
    df['state']  = state
    
    return df

def create_after_state(df):
    """Simulate a journal posting by adjusting key lines"""
    after = df.copy()
    after['state'] = 'after'
    
    # Adjust key lines to make dashboard changes visible
    mask_ni  = after['fs_line'].str.contains('Interest Income', case=False, na=False)
    mask_exp = after['fs_line'].str.contains('Operating Expenses|Opex|Staff', case=False, na=False)
    mask_prov = after['note_line'].str.contains('Provision|Loan Loss', case=False, na=False)
    mask_dep = after['fs_line'].str.contains('Deposit', case=False, na=False)

    after.loc[mask_ni,   'final_balance'] *= 1.05  # +5% interest income
    after.loc[mask_exp,  'final_balance'] *= 1.03  # +3% operating expenses
    after.loc[mask_prov, 'final_balance'] *= 1.08  # +8% provisions
    after.loc[mask_dep,  'final_balance'] *= 1.02  # +2% deposits
    
    return after

def main():
    engine = create_engine(DB_URL)
    
    # Create tables if they don't exist
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS gl_balances (
                gl_code             VARCHAR,
                description         VARCHAR,
                preliminary_balance NUMERIC,
                adjusted_balance    NUMERIC,
                final_balance       NUMERIC,
                fs_line             VARCHAR,
                note_line           VARCHAR

            )
        """))
        
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS current_state (
                id           INTEGER PRIMARY KEY,
                active_state VARCHAR,
                last_synced  TIMESTAMP
            )
        """))
        
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS ingestion_log (
                id             SERIAL PRIMARY KEY,
                filename       VARCHAR,
                uploaded_at    TIMESTAMP DEFAULT NOW(),
                rows_ingested  INTEGER,
                rows_skipped   INTEGER,
                state_loaded   VARCHAR,
                status         VARCHAR
            )
        """))
        
        # Clear existing data
        conn.execute(text("DELETE FROM gl_balances"))
        
        # Seed current_state
        conn.execute(text("""
            INSERT INTO current_state (id, active_state, last_synced)
            VALUES (1, 'before', NOW())
            ON CONFLICT (id) DO UPDATE 
            SET active_state = 'before', last_synced = NOW()
        """))
        
        conn.commit()
    
    # Load before state from real data
    before_df = ingest_file(EXCEL_FILE, 'before')
    
    # Generate after state with journal adjustments
    after_df = create_after_state(before_df)
    
    # Push both to DB
    before_df.to_sql('gl_balances', engine, if_exists='append', index=False)
    after_df.to_sql('gl_balances', engine, if_exists='append', index=False)
    
    # Log it
    with engine.connect() as conn:
        conn.execute(text("""
            INSERT INTO ingestion_log (filename, rows_ingested, rows_skipped, state_loaded, status)
            VALUES (:fn, :rows, 0, 'before+after', 'success')
        """), {"fn": os.path.basename(EXCEL_FILE), "rows": len(before_df) * 2})
        conn.commit()
    
    print(f"✅ Before state: {len(before_df)} rows loaded.")
    print(f"✅ After state:  {len(after_df)} rows loaded.")
    print(f"✅ FinancialDB ready. Run your web app now.")

if __name__ == "__main__":
    main()