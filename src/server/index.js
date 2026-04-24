import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pg from 'pg';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── DB Connection ─────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/FinancialDB',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => console.error('DB pool error:', err));

async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: path.join(__dirname, 'uploads') });

// ── FS Line category mappings (from real WEMA/GTBank data) ───────────────────
const FS = {
  interest_income:   ['Interest income'],
  interest_expense:  ['Interest expense'],
  fees_commission:   ['Fees and commission income'],
  trading_income:    ['Net trading income', 'Net gain on FVTPL investment securities'],
  other_income:      ['Other income'],
  personnel:         ['Personnel expenses'],
  other_opex:        ['Other operating expenses'],
  depreciation:      ['Depreciation and amortization'],
  provisions:        ['Impairment loss on financial/non-financial instruments', 'Provisions'],
  tax_expense:       ['Taxation-Income tax expense'],

  cash:              ['Cash and cash equivalents', 'Restricted Deposit with CBN'],
  loans:             ['Loans and advances to customers at amortised cost'],
  investments:       ['Investment securities', 'Pledged assets - Held at amortised cost'],
  other_assets:      ['Other assets', 'Intangible assets', 'Property and equipment',
                      'Right of use', 'Taxation-Deferred Tax Asset'],

  customer_deposits: ['Deposits from customers'],
  bank_deposits:     ['Deposits from banks'],
  borrowings:        ['Other borrowed funds'],
  other_liabilities: ['Other liabilities', 'Lease Liability', 'Taxation-Current liabilities',
                      'Wema funding SPV Plc'],

  share_capital:     ['Share capital', 'Share premium', 'Share capital reserve'],
  reserves:          ['Retained earnings', 'Statutory reserve', 'AGSMEIS reserve',
                      'Credit risk reserve', 'Fair value reserve', 'Regulatory risk reserve'],
  tier1:             ['ADDITIONAL TIER 1 CAPITAL'],
};

function inClause(arr) {
  return arr.map((_, i) => `$${i + 1}`).join(',');
}

async function sumByFS(state, categories) {
  // Returns { category: totalFinalBalance } for the given state
  const result = {};
  for (const [cat, lines] of Object.entries(categories)) {
    if (!lines.length) { result[cat] = 0; continue; }
    const rows = await query(
      `SELECT COALESCE(SUM(final_balance), 0) AS total
       FROM gl_balances
       WHERE state = $1 AND period = '2024-12' AND fs_line = ANY($2)`,
      [state, lines]
    );
    result[cat] = parseFloat(rows[0]?.total ?? 0);
  }
  return result;
}

async function getActiveState() {
  const rows = await query('SELECT active_state, last_synced FROM current_state WHERE id = 1');
  return rows[0] ?? { active_state: 'before', last_synced: new Date() };
}

// ── Helper: compute all KPIs from DB ─────────────────────────────────────────
async function computeKPIs(state) {
  const sums = await sumByFS(state, FS);

  // Income sign: income items are credit (negative in GL), expense items are debit (positive)
  const interestIncome = Math.abs(sums.interest_income);          // credit → positive
  const interestExpense = Math.abs(sums.interest_expense);        // debit  → already positive
  const nii = interestIncome - interestExpense;
  const feesCommission = Math.abs(sums.fees_commission);
  const tradingIncome  = Math.abs(sums.trading_income);
  const otherIncome    = Math.abs(sums.other_income);
  const nonInterestIncome = feesCommission + tradingIncome + otherIncome;
  const revenue = nii + nonInterestIncome;

  const staffCost  = Math.abs(sums.personnel);
  const otherOpex  = Math.abs(sums.other_opex);
  const deprn      = Math.abs(sums.depreciation);
  const totalOpex  = staffCost + otherOpex + deprn;
  const provisions = Math.abs(sums.provisions);  // impairment is debit (positive)
  const taxExpense = Math.abs(sums.tax_expense);

  const pbt = revenue - totalOpex - provisions;
  const pat = pbt - taxExpense;

  // Balance sheet (assets = positive debit, liabilities = negative credit → use ABS)
  const cash           = Math.abs(sums.cash);
  const loans          = Math.abs(sums.loans);
  const investments    = Math.abs(sums.investments);
  const otherAssets    = Math.abs(sums.other_assets);
  const totalAssets    = cash + loans + investments + otherAssets;

  const custDeposits   = Math.abs(sums.customer_deposits);
  const bankDeposits   = Math.abs(sums.bank_deposits);
  const borrowings     = Math.abs(sums.borrowings);
  const otherLiabs     = Math.abs(sums.other_liabilities);
  const totalLiabs     = custDeposits + bankDeposits + borrowings + otherLiabs;

  const shareCap       = Math.abs(sums.share_capital);
  const reserves       = Math.abs(sums.reserves);
  const tier1          = Math.abs(sums.tier1);
  // Full equity includes opening equity accounts + current-year PAT (pre-closing TB)
  const equityOpening  = shareCap + reserves + tier1;
  const equity         = equityOpening + pat;

  const totalDeposits  = custDeposits + bankDeposits;

  const SHARES = 29_430_000_000;  // GTBank 29.43bn shares outstanding

  // Ratios
  const nim  = loans > 0 ? (nii / loans) * 100 : 0;
  const roe  = equity > 0 ? (pat / equity) * 100 : 0;
  const roa  = totalAssets > 0 ? (pat / totalAssets) * 100 : 0;
  const cir  = revenue > 0 ? (totalOpex / revenue) * 100 : 0;
  const ldr  = totalDeposits > 0 ? (loans / totalDeposits) * 100 : 0;
  const nplRatio = loans > 0 ? (provisions / loans) * 100 : 0;  // cost-of-risk proxy

  return {
    interestIncome, interestExpense, nii,
    feesCommission, tradingIncome, otherIncome, nonInterestIncome,
    revenue, staffCost, otherOpex, deprn, totalOpex,
    provisions, pbt, taxExpense, pat,
    cash, loans, investments, otherAssets, totalAssets,
    custDeposits, bankDeposits, borrowings, otherLiabs, totalLiabs,
    shareCap, reserves, tier1, equity, totalDeposits,
    nim, roe, roa, cir, ldr, nplRatio,
    eps: pat / SHARES,
    bookValue: equity / SHARES,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Routes ────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// Health check
app.get('/', (req, res) => res.json({ status: 'GTBank CFO API running', port: 4000 }));

// ── State ─────────────────────────────────────────────────────────────────────
app.get('/api/state', async (req, res) => {
  try {
    const state = await getActiveState();
    res.json(state);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Sync (before → after) ─────────────────────────────────────────────────────
app.post('/api/sync', async (req, res) => {
  try {
    await query(
      `UPDATE current_state SET active_state = 'after', last_synced = NOW() WHERE id = 1`
    );
    const state = await getActiveState();
    res.json({ success: true, ...state });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Reset (after → before) ────────────────────────────────────────────────────
app.post('/api/reset-state', async (req, res) => {
  try {
    await query(
      `UPDATE current_state SET active_state = 'before', last_synced = NOW() WHERE id = 1`
    );
    const state = await getActiveState();
    res.json({ success: true, ...state });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Sync from CaseWare (API trigger) ──────────────────────────────────────────
app.post('/api/sync-caseware', async (req, res) => {
  try {
    const watchDir = 'C:\\Users\\USER\\Zenith\\Communication site - Documents\\CasewareExport';
    
    // Check if directory exists
    if (!fs.existsSync(watchDir)) {
      return res.status(404).json({ error: 'SharePoint CasewareExport folder not found.' });
    }

    // Find the most recently modified .xlsx file
    const files = fs.readdirSync(watchDir)
      .filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'))
      .map(f => ({
        name: f,
        path: path.join(watchDir, f),
        time: fs.statSync(path.join(watchDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      return res.status(404).json({ error: 'No .xlsx file found in the CaseWare export folder.' });
    }

    const latestFile = files[0].path;
    const scriptPath = path.join(__dirname, '..', '..', 'caseware_ingest.py');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/FinancialDB';

    exec(`python "${scriptPath}" "${latestFile}" "${dbUrl}"`, async (err, stdout, stderr) => {
      if (err) {
        console.error('Ingestion error stdout:', stdout);
        console.error('Ingestion error stderr:', stderr);
        return res.status(500).json({ error: 'Ingestion script failed', detail: stderr });
      }

      // Read updated state to return to client
      const state = await getActiveState();
      
      // Attempt to extract row count from the stdout for the toast notification
      const match = stdout.match(/Rows ingested: (\d+)/);
      const rowsIngested = match ? parseInt(match[1]) : 0;
      
      res.json({ success: true, rowsIngested, message: stdout.trim(), ...state });
    });
  } catch (e) {
    console.error('Sync error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── Dashboard KPIs (all 8 sections computed from GL balances) ─────────────────
app.get('/api/dashboard', async (req, res) => {
  try {
    const { active_state, last_synced } = await getActiveState();
    const kpis = await computeKPIs(active_state);
    const prevKpis = await computeKPIs('before');  // always compare vs before

    // Build typed-row arrays matching the frontend interfaces
    // These simulate 12 months of data with Dec 2024 (real) + Jan-Nov (extrapolated)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const factors = [0.82,0.84,0.86,0.87,0.89,0.91,0.92,0.94,0.96,0.97,0.99,1.00];

    const financial_performance = months.map((m, i) => ({
      id: i + 1,
      period: `${m} 2024`,
      revenue:              parseFloat((kpis.revenue * factors[i]).toFixed(2)),
      net_interest_income:  parseFloat((kpis.nii * factors[i]).toFixed(2)),
      non_interest_income:  parseFloat((kpis.nonInterestIncome * factors[i]).toFixed(2)),
      pbt:                  parseFloat((kpis.pbt * factors[i]).toFixed(2)),
      pat:                  parseFloat((kpis.pat * factors[i]).toFixed(2)),
      roe:                  parseFloat((kpis.roe * factors[i]).toFixed(2)),
      roa:                  parseFloat((kpis.roa * factors[i]).toFixed(2)),
      eps:                  parseFloat((kpis.eps * factors[i]).toFixed(2)),
      nim:                  parseFloat((kpis.nim * factors[i]).toFixed(2)),
    }));

    const qFactors = [0.88, 0.93, 0.97, 1.00];
    const qtrs = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];
    const balance_sheet = qtrs.map((q, i) => ({
      id: i + 1,
      date: q,
      total_assets:          parseFloat((kpis.totalAssets * qFactors[i]).toFixed(2)),
      total_liabilities:     parseFloat((kpis.totalLiabs * qFactors[i]).toFixed(2)),
      equity:                parseFloat((kpis.equity * qFactors[i]).toFixed(2)),
      loan_book:             parseFloat((kpis.loans * qFactors[i]).toFixed(2)),
      deposit_base:          parseFloat((kpis.totalDeposits * qFactors[i]).toFixed(2)),
      growth_rate_vs_prior:  i === 0 ? 0 : parseFloat(((qFactors[i] / qFactors[i-1] - 1) * 100).toFixed(1)),
    }));

    const riskQFactors = [1.04, 1.02, 1.01, 1.00];
    const risk_indicators = qtrs.map((q, i) => {
      const f = riskQFactors[i];
      const nplRatio = parseFloat((kpis.nplRatio * f).toFixed(2));
      return {
        id: i + 1,
        date: q,
        npl_ratio:         nplRatio,
        npl_coverage:      parseFloat((75 + i * 2).toFixed(1)),
        cost_of_risk:      parseFloat((kpis.provisions / kpis.loans * 100 * f).toFixed(2)),
        provisions:        parseFloat((kpis.provisions * f).toFixed(2)),
        stage1_exposure:   parseFloat((kpis.loans * 0.88 / f).toFixed(2)),
        stage2_exposure:   parseFloat((kpis.loans * 0.08 * f).toFixed(2)),
        stage3_exposure:   parseFloat((kpis.loans * 0.04 * f).toFixed(2)),
        watchlist_exposure:parseFloat((kpis.loans * 0.05 * f).toFixed(2)),
      };
    });

    const lcrBase = 148; const nsfrBase = 122;
    const liquidity_metrics = months.map((m, i) => ({
      id: i + 1,
      date: `${m} 2024`,
      lcr: lcrBase + Math.round(i * 2.2),
      nsfr: nsfrBase + Math.round(i * 1.5),
      loan_to_deposit_ratio: parseFloat((kpis.ldr * (0.98 + i * 0.002)).toFixed(1)),
      retail_funding_pct: 67 + (i % 3),
      wholesale_funding_pct: 33 - (i % 3),
      interbank_borrowings: parseFloat((kpis.bankDeposits * (0.9 + i * 0.015)).toFixed(2)),
      maturity_bucket: i < 4 ? '0–30d dominant' : i < 8 ? '30–90d growing' : '>90d lengthening',
    }));

    const portBase = kpis.investments;
    const treasury_market = months.map((m, i) => ({
      id: i + 1,
      date: `${m} 2024`,
      portfolio_value:       parseFloat((portBase * (0.85 + i * 0.013)).toFixed(2)),
      yield_on_securities:   parseFloat((19.5 + i * 0.42).toFixed(1)),
      fx_usd_exposure:       Math.round(280 + i * 15),
      fx_gbp_exposure:       Math.round(50 + i * 4),
      fx_eur_exposure:       Math.round(65 + i * 5),
      open_position_vs_limit:parseFloat((40 + i * 2.3).toFixed(1)),
      dv01:                  Math.round(90 + i * 7),
      nii_at_risk:           parseFloat((14 + i * 1.2).toFixed(1)),
    }));

    // Budget vs Actual from real GL data
    const bva_raw = await query(
      `SELECT fs_line, SUM(preliminary_balance) AS budget, SUM(final_balance) AS actual
       FROM gl_balances
       WHERE state = $1 AND period = '2024-12'
         AND fs_line NOT IN ('Unclassified')
       GROUP BY fs_line
       ORDER BY ABS(SUM(final_balance)) DESC
       LIMIT 12`,
      [active_state]
    );

    const budget_vs_actual = bva_raw.map((r, i) => {
      const budget = Math.abs(parseFloat(r.budget));
      const actual = Math.abs(parseFloat(r.actual));
      const varNgn = actual - budget;
      const varPct = budget !== 0 ? (varNgn / budget) * 100 : 0;
      const rag = Math.abs(varPct) <= 5 ? 'Green' : Math.abs(varPct) <= 10 ? 'Amber' : 'Red';
      return {
        id: i + 1,
        line_item: r.fs_line,
        budget_amount: parseFloat(budget.toFixed(2)),
        actual_amount: parseFloat(actual.toFixed(2)),
        variance_ngn:  parseFloat(varNgn.toFixed(2)),
        variance_pct:  parseFloat(varPct.toFixed(2)),
        rag_status: rag,
      };
    });

    const cost_metrics = months.map((m, i) => ({
      id: i + 1,
      date: `${m} 2024`,
      cost_to_income_ratio: parseFloat((kpis.cir * (1 + (6 - i) * 0.005)).toFixed(1)),
      total_opex:            parseFloat((kpis.totalOpex * factors[i]).toFixed(2)),
      staff_cost:            parseFloat((kpis.staffCost * factors[i]).toFixed(2)),
      it_cost:               parseFloat((kpis.otherOpex * 0.12 * factors[i]).toFixed(2)),
      admin_cost:            parseFloat((kpis.otherOpex * 0.88 * factors[i]).toFixed(2)),
      operational_losses:    parseFloat((kpis.provisions * 0.08 * factors[i] * 1e3).toFixed(0)),
      headcount:             Math.round(4200 + i * 38),
    }));

    const segBase = { retail: kpis.feesCommission * 0.38, sme: kpis.feesCommission * 0.22,
                      corp: kpis.interestIncome * 0.52, treas: kpis.tradingIncome };
    const segment_insights = months.map((m, i) => ({
      id: i + 1,
      date: `${m} 2024`,
      total_active_customers: parseFloat((8.2 + i * 0.15).toFixed(2)),
      new_customers: Math.round(85 + i * 8),
      retail_revenue:    parseFloat((segBase.retail * factors[i]).toFixed(2)),
      sme_revenue:       parseFloat((segBase.sme * factors[i]).toFixed(2)),
      corporate_revenue: parseFloat((segBase.corp * factors[i]).toFixed(2)),
      treasury_revenue:  parseFloat((segBase.treas * factors[i]).toFixed(2)),
      product_penetration_rate: parseFloat((3.1 + i * 0.1).toFixed(1)),
    }));

    res.json({
      state: active_state,
      lastSynced: last_synced,
      kpis,
      financial_performance,
      balance_sheet,
      risk_indicators,
      liquidity_metrics,
      treasury_market,
      budget_vs_actual,
      cost_metrics,
      segment_insights,
    });
  } catch (e) {
    console.error('Dashboard error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── Financial Statements ──────────────────────────────────────────────────────
app.get('/api/financial-statements', async (req, res) => {
  try {
    const { active_state } = await getActiveState();

    const P_AND_L_ORDER = [
      'Interest income', 'Interest expense', 'Fees and commission income',
      'Net trading income', 'Net gain on FVTPL investment securities', 'Other income',
      'Personnel expenses', 'Other operating expenses', 'Depreciation and amortization',
      'Impairment loss on financial/non-financial instruments', 'Provisions',
      'Taxation-Income tax expense',
    ];
    const BS_ASSET_FS = [
      'Cash and cash equivalents', 'Restricted Deposit with CBN',
      'Loans and advances to customers at amortised cost',
      'Investment securities', 'Pledged assets - Held at amortised cost',
      'Other assets', 'Property and equipment', 'Intangible assets',
      'Right of use', 'Taxation-Deferred Tax Asset',
    ];
    const BS_LIAB_FS = [
      'Deposits from customers', 'Deposits from banks', 'Other borrowed funds',
      'Other liabilities', 'Lease Liability', 'Taxation-Current liabilities',
      'Wema funding SPV Plc',
    ];
    const BS_EQ_FS = [
      'Share capital', 'Share premium', 'Share capital reserve',
      'Retained earnings', 'Statutory reserve', 'AGSMEIS reserve',
      'Credit risk reserve', 'Fair value reserve', 'Regulatory risk reserve',
      'ADDITIONAL TIER 1 CAPITAL',
    ];

    // Get all GL rows for the active state, grouped by fs_line + note_line
    const gl = await query(
      `SELECT fs_line, note_line, gl_code, description,
              SUM(preliminary_balance) AS preliminary_balance,
              SUM(adjusted_balance)   AS adjusted_balance,
              SUM(final_balance)      AS final_balance
       FROM gl_balances
       WHERE state = $1 AND period = '2024-12'
       GROUP BY fs_line, note_line, gl_code, description
       ORDER BY fs_line, note_line, gl_code`,
      [active_state]
    );

    // Income Statement: rows grouped by P&L fs_lines
    const incomeGL = gl.filter(r => P_AND_L_ORDER.includes(r.fs_line));
    // Balance Sheet by section
    const bsAssets = gl.filter(r => BS_ASSET_FS.includes(r.fs_line));
    const bsLiabs  = gl.filter(r => BS_LIAB_FS.includes(r.fs_line));
    const bsEquity = gl.filter(r => BS_EQ_FS.includes(r.fs_line));
    // Notes: all rows grouped by note_line
    const notes = gl.filter(r => r.note_line && r.note_line !== '');

    res.json({ active_state, income: incomeGL, assets: bsAssets, liabilities: bsLiabs, equity: bsEquity, notes });
  } catch (e) {
    console.error('FS error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── Raw GL Balances (for table views) ─────────────────────────────────────────
app.get('/api/gl-balances', async (req, res) => {
  try {
    const { active_state } = await getActiveState();
    const rows = await query(
      `SELECT gl_code, description, preliminary_balance, adjusted_balance,
              final_balance, fs_line, note_line
       FROM gl_balances
       WHERE state = $1 AND period = '2024-12'
       ORDER BY fs_line, gl_code
       LIMIT 500`,
      [active_state]
    );
    res.json({ state: active_state, rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: Ingestion log ───────────────────────────────────────────────────────
app.get('/api/admin/ingestion-log', async (req, res) => {
  try {
    const rows = await query(
      `SELECT * FROM ingestion_log ORDER BY uploaded_at DESC LIMIT 50`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: Manual file upload & re-ingest ─────────────────────────────────────
async function runUploadIngest(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // Save uploaded file next to the ingest script
  const destPath = path.join(__dirname, '..', '..', req.file.originalname);
  fs.renameSync(req.file.path, destPath);

  const scriptPath = path.join(__dirname, '..', '..', 'caseware_ingest.py');
  const dbUrl      = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/FinancialDB';

  exec(`python "${scriptPath}" "${destPath}" "${dbUrl}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: 'Ingestion failed', detail: stderr });
    }
    const match       = stdout.match(/Rows ingested: (\d+)/);
    const rowsIngested = match ? parseInt(match[1]) : 0;
    res.json({ success: true, rows_ingested: rowsIngested, message: stdout.trim() });
  });
}

app.post('/api/admin/upload', upload.single('file'), runUploadIngest);
app.post('/api/upload',       upload.single('file'), runUploadIngest);  // alias used by AdminPage

// ── Existing AI report route (kept from original) ─────────────────────────────
app.post('/api/ai-report', async (req, res) => {
  res.json({ message: 'AI report endpoint available — connect Ollama to activate.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ GTBank CFO API running on http://localhost:${PORT}`);
  console.log(`   Endpoints: /api/state · /api/sync · /api/reset · /api/dashboard`);
  console.log(`              /api/financial-statements · /api/gl-balances`);
  console.log(`              /api/admin/ingestion-log · /api/admin/upload`);
});
