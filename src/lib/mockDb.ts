// ─────────────────────────────────────────────────────────────────────────────
// Mock database for First Unity Bank PLC (fictional Nigerian tier-1 bank)
// All monetary values: NGN billions (₦bn) unless explicitly noted.
// Architecture: swap `initialState` in DbContext for real API/SQLite calls.
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Financial Performance ─────────────────────────────────────────────────
export interface FinancialPerformanceRow {
  id: number;
  period: string;
  revenue: number;            // ₦bn total (NII + Non-Int)
  net_interest_income: number; // ₦bn
  non_interest_income: number; // ₦bn
  pbt: number;                // ₦bn profit before tax
  pat: number;                // ₦bn profit after tax
  roe: number;                // % return on equity
  roa: number;                // % return on assets
  eps: number;                // ₦ earnings per share
  nim: number;                // % net interest margin
}

export const financial_performance: FinancialPerformanceRow[] = [
  { id: 1,  period: "Jan 2025", revenue: 117.7, net_interest_income: 76.2, non_interest_income: 41.5, pbt: 55.2, pat: 38.6, roe: 29.2, roa: 3.4, eps: 12.9, nim: 9.2 },
  { id: 2,  period: "Feb 2025", revenue: 114.0, net_interest_income: 74.8, non_interest_income: 39.2, pbt: 53.4, pat: 37.4, roe: 28.7, roa: 3.3, eps: 12.5, nim: 9.1 },
  { id: 3,  period: "Mar 2025", revenue: 122.3, net_interest_income: 78.5, non_interest_income: 43.8, pbt: 58.6, pat: 41.0, roe: 30.5, roa: 3.5, eps: 13.7, nim: 9.3 },
  { id: 4,  period: "Apr 2025", revenue: 119.6, net_interest_income: 77.1, non_interest_income: 42.5, pbt: 56.8, pat: 39.8, roe: 29.8, roa: 3.4, eps: 13.3, nim: 9.2 },
  { id: 5,  period: "May 2025", revenue: 125.6, net_interest_income: 80.4, non_interest_income: 45.2, pbt: 60.2, pat: 42.1, roe: 31.2, roa: 3.6, eps: 14.0, nim: 9.5 },
  { id: 6,  period: "Jun 2025", revenue: 129.4, net_interest_income: 82.6, non_interest_income: 46.8, pbt: 62.5, pat: 43.8, roe: 32.1, roa: 3.7, eps: 14.6, nim: 9.6 },
  { id: 7,  period: "Jul 2025", revenue: 125.7, net_interest_income: 81.2, non_interest_income: 44.5, pbt: 59.8, pat: 41.9, roe: 30.8, roa: 3.5, eps: 14.0, nim: 9.4 },
  { id: 8,  period: "Aug 2025", revenue: 132.5, net_interest_income: 85.3, non_interest_income: 47.2, pbt: 64.8, pat: 45.4, roe: 33.0, roa: 3.8, eps: 15.1, nim: 9.7 },
  { id: 9,  period: "Sep 2025", revenue: 138.8, net_interest_income: 88.7, non_interest_income: 50.1, pbt: 68.2, pat: 47.7, roe: 34.5, roa: 3.9, eps: 15.9, nim: 9.9 },
  { id: 10, period: "Oct 2025", revenue: 135.0, net_interest_income: 86.4, non_interest_income: 48.6, pbt: 65.5, pat: 45.9, roe: 33.2, roa: 3.8, eps: 15.3, nim: 9.8 },
  { id: 11, period: "Nov 2025", revenue: 142.5, net_interest_income: 90.2, non_interest_income: 52.3, pbt: 70.8, pat: 49.6, roe: 35.8, roa: 4.0, eps: 16.5, nim: 10.1 },
  { id: 12, period: "Dec 2025", revenue: 150.3, net_interest_income: 94.5, non_interest_income: 55.8, pbt: 75.2, pat: 52.6, roe: 37.2, roa: 4.2, eps: 17.5, nim: 10.4 },
];

// ── 2. Balance Sheet ─────────────────────────────────────────────────────────
export interface BalanceSheetRow {
  id: number;
  date: string;
  total_assets: number;       // ₦bn
  total_liabilities: number;  // ₦bn
  equity: number;             // ₦bn
  loan_book: number;          // ₦bn
  deposit_base: number;       // ₦bn
  growth_rate_vs_prior: number; // % QoQ growth in total assets
}

export const balance_sheet: BalanceSheetRow[] = [
  { id: 1, date: "Q4 2024", total_assets: 8175, total_liabilities: 7045, equity: 1130, loan_book: 2720, deposit_base: 4480, growth_rate_vs_prior: 0.0 },
  { id: 2, date: "Q1 2025", total_assets: 8850, total_liabilities: 7620, equity: 1230, loan_book: 2940, deposit_base: 4850, growth_rate_vs_prior: 8.3 },
  { id: 3, date: "Q2 2025", total_assets: 9240, total_liabilities: 7980, equity: 1260, loan_book: 3150, deposit_base: 5120, growth_rate_vs_prior: 4.4 },
  { id: 4, date: "Q3 2025", total_assets: 9680, total_liabilities: 8340, equity: 1340, loan_book: 3380, deposit_base: 5450, growth_rate_vs_prior: 4.8 },
  { id: 5, date: "Q4 2025", total_assets: 10250, total_liabilities: 8820, equity: 1430, loan_book: 3620, deposit_base: 5820, growth_rate_vs_prior: 5.9 },
];

// ── 3. Risk & Asset Quality Indicators ──────────────────────────────────────
export interface RiskIndicatorRow {
  id: number;
  date: string;
  npl_ratio: number;         // %
  npl_coverage: number;      // %
  cost_of_risk: number;      // %
  provisions: number;        // ₦bn
  stage1_exposure: number;   // ₦bn (performing loans)
  stage2_exposure: number;   // ₦bn (under-performing)
  stage3_exposure: number;   // ₦bn (non-performing)
  watchlist_exposure: number; // ₦bn
}

export const risk_indicators: RiskIndicatorRow[] = [
  { id: 1, date: "Q4 2024", npl_ratio: 7.2, npl_coverage: 74.2, cost_of_risk: 2.6, provisions: 92.5, stage1_exposure: 2420, stage2_exposure: 580, stage3_exposure: 320, watchlist_exposure: 415 },
  { id: 2, date: "Q1 2025", npl_ratio: 6.8, npl_coverage: 78.5, cost_of_risk: 2.4, provisions: 85.2, stage1_exposure: 2640, stage2_exposure: 520, stage3_exposure: 280, watchlist_exposure: 380 },
  { id: 3, date: "Q2 2025", npl_ratio: 6.5, npl_coverage: 80.2, cost_of_risk: 2.2, provisions: 80.5, stage1_exposure: 2850, stage2_exposure: 490, stage3_exposure: 260, watchlist_exposure: 355 },
  { id: 4, date: "Q3 2025", npl_ratio: 6.1, npl_coverage: 82.8, cost_of_risk: 2.0, provisions: 74.8, stage1_exposure: 3080, stage2_exposure: 455, stage3_exposure: 240, watchlist_exposure: 325 },
  { id: 5, date: "Q4 2025", npl_ratio: 5.8, npl_coverage: 85.4, cost_of_risk: 1.8, provisions: 68.2, stage1_exposure: 3280, stage2_exposure: 420, stage3_exposure: 220, watchlist_exposure: 295 },
];

// ── 4. Liquidity & Funding Metrics ───────────────────────────────────────────
export interface LiquidityMetricRow {
  id: number;
  date: string;
  lcr: number;                  // % Liquidity Coverage Ratio (min 100%)
  nsfr: number;                 // % Net Stable Funding Ratio (min 100%)
  loan_to_deposit_ratio: number; // %
  retail_funding_pct: number;   // %
  wholesale_funding_pct: number; // %
  interbank_borrowings: number; // ₦bn
  maturity_bucket: string;
}

export const liquidity_metrics: LiquidityMetricRow[] = [
  { id: 1,  date: "Jan 2025", lcr: 155, nsfr: 122, loan_to_deposit_ratio: 60.7, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 285, maturity_bucket: "0–30d dominant" },
  { id: 2,  date: "Feb 2025", lcr: 158, nsfr: 124, loan_to_deposit_ratio: 60.1, retail_funding_pct: 67, wholesale_funding_pct: 33, interbank_borrowings: 312, maturity_bucket: "0–30d dominant" },
  { id: 3,  date: "Mar 2025", lcr: 162, nsfr: 128, loan_to_deposit_ratio: 60.6, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 268, maturity_bucket: "30–90d growing" },
  { id: 4,  date: "Apr 2025", lcr: 148, nsfr: 118, loan_to_deposit_ratio: 61.5, retail_funding_pct: 67, wholesale_funding_pct: 33, interbank_borrowings: 345, maturity_bucket: "0–30d dominant" },
  { id: 5,  date: "May 2025", lcr: 152, nsfr: 120, loan_to_deposit_ratio: 61.5, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 298, maturity_bucket: "0–30d dominant" },
  { id: 6,  date: "Jun 2025", lcr: 168, nsfr: 132, loan_to_deposit_ratio: 61.5, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 252, maturity_bucket: "30–90d growing" },
  { id: 7,  date: "Jul 2025", lcr: 145, nsfr: 116, loan_to_deposit_ratio: 62.0, retail_funding_pct: 66, wholesale_funding_pct: 34, interbank_borrowings: 380, maturity_bucket: "0–30d dominant" },
  { id: 8,  date: "Aug 2025", lcr: 172, nsfr: 135, loan_to_deposit_ratio: 62.0, retail_funding_pct: 67, wholesale_funding_pct: 33, interbank_borrowings: 265, maturity_bucket: "30–90d growing" },
  { id: 9,  date: "Sep 2025", lcr: 178, nsfr: 138, loan_to_deposit_ratio: 62.0, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 242, maturity_bucket: ">90d lengthening" },
  { id: 10, date: "Oct 2025", lcr: 165, nsfr: 128, loan_to_deposit_ratio: 62.2, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 275, maturity_bucket: "30–90d growing" },
  { id: 11, date: "Nov 2025", lcr: 171, nsfr: 133, loan_to_deposit_ratio: 62.2, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 258, maturity_bucket: ">90d lengthening" },
  { id: 12, date: "Dec 2025", lcr: 174, nsfr: 136, loan_to_deposit_ratio: 62.2, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 235, maturity_bucket: ">90d lengthening" },
];

// ── 5. Treasury & Market Risk ────────────────────────────────────────────────
export interface TreasuryMarketRow {
  id: number;
  date: string;
  portfolio_value: number;       // ₦bn total securities
  yield_on_securities: number;   // % annualised
  fx_usd_exposure: number;       // USD millions net long position
  fx_gbp_exposure: number;       // GBP millions
  fx_eur_exposure: number;       // EUR millions
  open_position_vs_limit: number; // % of regulatory FX open position limit used
  dv01: number;                  // ₦mn (₦ value of 1bp move)
  nii_at_risk: number;           // ₦bn
}

export const treasury_market: TreasuryMarketRow[] = [
  { id: 1,  date: "Jan 2025", portfolio_value: 1850, yield_on_securities: 19.2, fx_usd_exposure: 285, fx_gbp_exposure: 52, fx_eur_exposure: 68,  open_position_vs_limit: 42, dv01: 95,  nii_at_risk: 15.2 },
  { id: 2,  date: "Feb 2025", portfolio_value: 1920, yield_on_securities: 19.8, fx_usd_exposure: 310, fx_gbp_exposure: 58, fx_eur_exposure: 75,  open_position_vs_limit: 46, dv01: 102, nii_at_risk: 16.4 },
  { id: 3,  date: "Mar 2025", portfolio_value: 2010, yield_on_securities: 20.5, fx_usd_exposure: 342, fx_gbp_exposure: 65, fx_eur_exposure: 88,  open_position_vs_limit: 51, dv01: 112, nii_at_risk: 17.8 },
  { id: 4,  date: "Apr 2025", portfolio_value: 2080, yield_on_securities: 21.2, fx_usd_exposure: 368, fx_gbp_exposure: 72, fx_eur_exposure: 96,  open_position_vs_limit: 55, dv01: 120, nii_at_risk: 19.2 },
  { id: 5,  date: "May 2025", portfolio_value: 2145, yield_on_securities: 21.8, fx_usd_exposure: 395, fx_gbp_exposure: 78, fx_eur_exposure: 104, open_position_vs_limit: 59, dv01: 130, nii_at_risk: 20.5 },
  { id: 6,  date: "Jun 2025", portfolio_value: 2220, yield_on_securities: 22.4, fx_usd_exposure: 418, fx_gbp_exposure: 82, fx_eur_exposure: 110, open_position_vs_limit: 63, dv01: 142, nii_at_risk: 22.1 },
  { id: 7,  date: "Jul 2025", portfolio_value: 2180, yield_on_securities: 22.0, fx_usd_exposure: 402, fx_gbp_exposure: 79, fx_eur_exposure: 106, open_position_vs_limit: 60, dv01: 138, nii_at_risk: 21.3 },
  { id: 8,  date: "Aug 2025", portfolio_value: 2265, yield_on_securities: 22.8, fx_usd_exposure: 425, fx_gbp_exposure: 85, fx_eur_exposure: 112, open_position_vs_limit: 64, dv01: 148, nii_at_risk: 23.0 },
  { id: 9,  date: "Sep 2025", portfolio_value: 2340, yield_on_securities: 23.4, fx_usd_exposure: 440, fx_gbp_exposure: 90, fx_eur_exposure: 118, open_position_vs_limit: 66, dv01: 158, nii_at_risk: 24.5 },
  { id: 10, date: "Oct 2025", portfolio_value: 2295, yield_on_securities: 23.0, fx_usd_exposure: 432, fx_gbp_exposure: 88, fx_eur_exposure: 115, open_position_vs_limit: 65, dv01: 152, nii_at_risk: 23.8 },
  { id: 11, date: "Nov 2025", portfolio_value: 2380, yield_on_securities: 23.8, fx_usd_exposure: 441, fx_gbp_exposure: 92, fx_eur_exposure: 121, open_position_vs_limit: 66, dv01: 165, nii_at_risk: 25.8 },
  { id: 12, date: "Dec 2025", portfolio_value: 2420, yield_on_securities: 24.6, fx_usd_exposure: 445, fx_gbp_exposure: 95, fx_eur_exposure: 125, open_position_vs_limit: 67, dv01: 175, nii_at_risk: 28.5 },
];

// ── 6. Budget vs Actual Variance ─────────────────────────────────────────────
export interface BudgetVsActualRow {
  id: number;
  line_item: string;
  budget_amount: number;  // ₦bn (full year)
  actual_amount: number;  // ₦bn (full year)
  variance_ngn: number;   // ₦bn (positive = favourable)
  variance_pct: number;   // % (positive = favourable)
  rag_status: "Green" | "Amber" | "Red";
}

export const budget_vs_actual: BudgetVsActualRow[] = [
  { id: 1,  line_item: "Total Revenue",         budget_amount: 1520.0, actual_amount: 1553.4, variance_ngn: 33.4,  variance_pct: 2.2,  rag_status: "Green" },
  { id: 2,  line_item: "Net Interest Income",   budget_amount: 940.0,  actual_amount: 975.9,  variance_ngn: 35.9,  variance_pct: 3.8,  rag_status: "Green" },
  { id: 3,  line_item: "Non-Interest Income",   budget_amount: 580.0,  actual_amount: 577.5,  variance_ngn: -2.5,  variance_pct: -0.4, rag_status: "Green" },
  { id: 4,  line_item: "Total Operating Expenses", budget_amount: 595.0, actual_amount: 621.4, variance_ngn: -26.4, variance_pct: -4.4, rag_status: "Red"   },
  { id: 5,  line_item: "Staff Costs",           budget_amount: 248.0,  actual_amount: 262.8,  variance_ngn: -14.8, variance_pct: -6.0, rag_status: "Red"   },
  { id: 6,  line_item: "IT & Digital",          budget_amount: 72.0,   actual_amount: 75.4,   variance_ngn: -3.4,  variance_pct: -4.7, rag_status: "Amber" },
  { id: 7,  line_item: "Admin & Overhead",      budget_amount: 115.0,  actual_amount: 118.6,  variance_ngn: -3.6,  variance_pct: -3.1, rag_status: "Amber" },
  { id: 8,  line_item: "Provisions for Losses", budget_amount: 890.0,  actual_amount: 858.2,  variance_ngn: 31.8,  variance_pct: 3.6,  rag_status: "Green" },
  { id: 9,  line_item: "Profit Before Tax",     budget_amount: 720.0,  actual_amount: 751.8,  variance_ngn: 31.8,  variance_pct: 4.4,  rag_status: "Green" },
  { id: 10, line_item: "Profit After Tax",      budget_amount: 504.0,  actual_amount: 525.8,  variance_ngn: 21.8,  variance_pct: 4.3,  rag_status: "Green" },
];

// ── 7. Cost & Operational Metrics ────────────────────────────────────────────
export interface CostMetricRow {
  id: number;
  date: string;
  cost_to_income_ratio: number; // %
  total_opex: number;           // ₦bn
  staff_cost: number;           // ₦bn
  it_cost: number;              // ₦bn
  admin_cost: number;           // ₦bn
  operational_losses: number;   // ₦mn
  headcount: number;
}

export const cost_metrics: CostMetricRow[] = [
  { id: 1,  date: "Jan 2025", cost_to_income_ratio: 48.2, total_opex: 56.8, staff_cost: 24.2, it_cost: 5.8, admin_cost: 10.8, operational_losses: 185, headcount: 13245 },
  { id: 2,  date: "Feb 2025", cost_to_income_ratio: 49.5, total_opex: 56.4, staff_cost: 23.8, it_cost: 5.5, admin_cost: 10.5, operational_losses: 210, headcount: 13310 },
  { id: 3,  date: "Mar 2025", cost_to_income_ratio: 47.8, total_opex: 58.5, staff_cost: 24.5, it_cost: 6.2, admin_cost: 11.2, operational_losses: 168, headcount: 13420 },
  { id: 4,  date: "Apr 2025", cost_to_income_ratio: 50.2, total_opex: 59.8, staff_cost: 25.0, it_cost: 6.5, admin_cost: 11.8, operational_losses: 245, headcount: 13485 },
  { id: 5,  date: "May 2025", cost_to_income_ratio: 48.8, total_opex: 61.2, staff_cost: 25.8, it_cost: 6.8, admin_cost: 12.2, operational_losses: 228, headcount: 13520 },
  { id: 6,  date: "Jun 2025", cost_to_income_ratio: 47.5, total_opex: 61.4, staff_cost: 25.5, it_cost: 7.0, admin_cost: 12.5, operational_losses: 195, headcount: 13558 },
  { id: 7,  date: "Jul 2025", cost_to_income_ratio: 51.2, total_opex: 64.5, staff_cost: 27.2, it_cost: 7.5, admin_cost: 13.0, operational_losses: 312, headcount: 13610 },
  { id: 8,  date: "Aug 2025", cost_to_income_ratio: 47.2, total_opex: 62.5, staff_cost: 26.5, it_cost: 7.0, admin_cost: 12.5, operational_losses: 185, headcount: 13645 },
  { id: 9,  date: "Sep 2025", cost_to_income_ratio: 46.8, total_opex: 65.0, staff_cost: 27.5, it_cost: 7.2, admin_cost: 13.2, operational_losses: 165, headcount: 13720 },
  { id: 10, date: "Oct 2025", cost_to_income_ratio: 48.5, total_opex: 65.4, staff_cost: 27.8, it_cost: 7.5, admin_cost: 13.5, operational_losses: 220, headcount: 13785 },
  { id: 11, date: "Nov 2025", cost_to_income_ratio: 47.8, total_opex: 68.2, staff_cost: 29.0, it_cost: 7.8, admin_cost: 14.2, operational_losses: 198, headcount: 13840 },
  { id: 12, date: "Dec 2025", cost_to_income_ratio: 46.2, total_opex: 72.2, staff_cost: 30.8, it_cost: 8.6, admin_cost: 15.7, operational_losses: 245, headcount: 13892 },
];

// ── 8. Customer & Business Segment Insights ──────────────────────────────────
export interface SegmentInsightRow {
  id: number;
  date: string;
  total_active_customers: number; // millions
  new_customers: number;          // thousands
  retail_revenue: number;         // ₦bn
  sme_revenue: number;            // ₦bn
  corporate_revenue: number;      // ₦bn
  treasury_revenue: number;       // ₦bn
  product_penetration_rate: number; // avg products per customer
}

export const segment_insights: SegmentInsightRow[] = [
  { id: 1,  date: "Jan 2025", total_active_customers: 8.42, new_customers: 95,  retail_revenue: 38.5, sme_revenue: 28.5, corporate_revenue: 42.5, treasury_revenue: 8.2,  product_penetration_rate: 3.2 },
  { id: 2,  date: "Feb 2025", total_active_customers: 8.51, new_customers: 102, retail_revenue: 37.2, sme_revenue: 27.4, corporate_revenue: 41.2, treasury_revenue: 8.2,  product_penetration_rate: 3.3 },
  { id: 3,  date: "Mar 2025", total_active_customers: 8.62, new_customers: 118, retail_revenue: 40.5, sme_revenue: 29.8, corporate_revenue: 44.2, treasury_revenue: 7.8,  product_penetration_rate: 3.4 },
  { id: 4,  date: "Apr 2025", total_active_customers: 8.75, new_customers: 128, retail_revenue: 39.5, sme_revenue: 29.2, corporate_revenue: 43.2, treasury_revenue: 7.7,  product_penetration_rate: 3.5 },
  { id: 5,  date: "May 2025", total_active_customers: 8.88, new_customers: 132, retail_revenue: 42.2, sme_revenue: 31.2, corporate_revenue: 45.5, treasury_revenue: 6.7,  product_penetration_rate: 3.5 },
  { id: 6,  date: "Jun 2025", total_active_customers: 9.02, new_customers: 145, retail_revenue: 44.2, sme_revenue: 33.5, corporate_revenue: 47.2, treasury_revenue: 4.5,  product_penetration_rate: 3.6 },
  { id: 7,  date: "Jul 2025", total_active_customers: 9.18, new_customers: 165, retail_revenue: 43.2, sme_revenue: 32.5, corporate_revenue: 46.2, treasury_revenue: 3.8,  product_penetration_rate: 3.7 },
  { id: 8,  date: "Aug 2025", total_active_customers: 9.35, new_customers: 178, retail_revenue: 46.2, sme_revenue: 35.5, corporate_revenue: 48.2, treasury_revenue: 2.6,  product_penetration_rate: 3.8 },
  { id: 9,  date: "Sep 2025", total_active_customers: 9.52, new_customers: 172, retail_revenue: 48.5, sme_revenue: 38.5, corporate_revenue: 50.2, treasury_revenue: 1.6,  product_penetration_rate: 3.9 },
  { id: 10, date: "Oct 2025", total_active_customers: 9.68, new_customers: 158, retail_revenue: 46.8, sme_revenue: 36.8, corporate_revenue: 49.5, treasury_revenue: 1.9,  product_penetration_rate: 4.0 },
  { id: 11, date: "Nov 2025", total_active_customers: 9.82, new_customers: 142, retail_revenue: 50.5, sme_revenue: 40.5, corporate_revenue: 52.5, treasury_revenue: -0.8, product_penetration_rate: 4.1 },
  { id: 12, date: "Dec 2025", total_active_customers: 9.95, new_customers: 135, retail_revenue: 54.2, sme_revenue: 43.8, corporate_revenue: 54.8, treasury_revenue: -2.7, product_penetration_rate: 4.2 },
];
