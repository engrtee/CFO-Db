// ─────────────────────────────────────────────────────────────────────────────
// Mock database — Guaranty Trust Bank Plc (GTBank) FY 2024
// All monetary values are in RAW NAIRA (not billions).
// Numbers are derived from the FY 2024 trial balance (test.xlsx).
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Financial Performance ─────────────────────────────────────────────────
export interface FinancialPerformanceRow {
  id: number;
  period: string;
  revenue: number;             // ₦ raw naira (YTD monthly)
  net_interest_income: number; // ₦ raw naira
  non_interest_income: number; // ₦ raw naira
  pbt: number;                 // ₦ raw naira
  pat: number;                 // ₦ raw naira
  roe: number;                 // % return on equity (annualised)
  roa: number;                 // % return on assets (annualised)
  eps: number;                 // ₦ per share (monthly PAT / 29.43bn shares)
  nim: number;                 // % net interest margin (annualised)
}

// Monthly figures derived from FY 2024 TB: Annual ÷ 10.97 × monthly factor
// Revenue ₦255.84bn | NII ₦177.04bn | NOII ₦78.80bn | PBT ₦105.66bn | PAT ₦89.44bn
export const financial_performance: FinancialPerformanceRow[] = [
  { id:  1, period: "Jan 2024", revenue: 19_123_964_113, net_interest_income: 13_233_650_484, non_interest_income: 5_890_313_629, pbt: 7_897_958_735, pat: 6_685_332_430, roe: 28.3, roa: 2.05, eps: 0.2272, nim: 12.09 },
  { id:  2, period: "Feb 2024", revenue: 19_590_402_262, net_interest_income: 13_556_422_447, non_interest_income: 6_033_979_815, pbt: 8_090_591_875, pat: 6_848_389_319, roe: 28.9, roa: 2.10, eps: 0.2327, nim: 12.38 },
  { id:  3, period: "Mar 2024", revenue: 20_056_840_411, net_interest_income: 13_879_194_410, non_interest_income: 6_177_646_001, pbt: 8_283_225_014, pat: 7_011_446_207, roe: 29.6, roa: 2.15, eps: 0.2382, nim: 12.68 },
  { id:  4, period: "Apr 2024", revenue: 20_290_059_486, net_interest_income: 14_040_580_391, non_interest_income: 6_249_479_094, pbt: 8_379_541_584, pat: 7_092_974_652, roe: 30.0, roa: 2.17, eps: 0.2410, nim: 12.82 },
  { id:  5, period: "May 2024", revenue: 20_756_497_635, net_interest_income: 14_363_352_354, non_interest_income: 6_393_145_280, pbt: 8_572_174_724, pat: 7_256_031_540, roe: 30.7, roa: 2.22, eps: 0.2466, nim: 13.12 },
  { id:  6, period: "Jun 2024", revenue: 21_222_935_784, net_interest_income: 14_686_124_317, non_interest_income: 6_536_811_466, pbt: 8_764_807_864, pat: 7_419_088_429, roe: 31.4, roa: 2.27, eps: 0.2521, nim: 13.41 },
  { id:  7, period: "Jul 2024", revenue: 21_456_154_858, net_interest_income: 14_847_510_299, non_interest_income: 6_608_644_560, pbt: 8_861_124_434, pat: 7_500_616_873, roe: 31.7, roa: 2.30, eps: 0.2549, nim: 13.56 },
  { id:  8, period: "Aug 2024", revenue: 21_922_593_007, net_interest_income: 15_170_282_262, non_interest_income: 6_752_310_746, pbt: 9_053_757_574, pat: 7_663_673_761, roe: 32.4, roa: 2.35, eps: 0.2604, nim: 13.85 },
  { id:  9, period: "Sep 2024", revenue: 22_389_031_157, net_interest_income: 15_493_054_225, non_interest_income: 6_895_976_932, pbt: 9_246_390_714, pat: 7_826_730_650, roe: 33.1, roa: 2.39, eps: 0.2659, nim: 14.15 },
  { id: 10, period: "Oct 2024", revenue: 22_622_250_231, net_interest_income: 15_654_440_206, non_interest_income: 6_967_810_025, pbt: 9_342_707_284, pat: 7_908_259_094, roe: 33.4, roa: 2.42, eps: 0.2687, nim: 14.30 },
  { id: 11, period: "Nov 2024", revenue: 23_088_688_380, net_interest_income: 15_977_212_169, non_interest_income: 7_111_476_211, pbt: 9_535_340_424, pat: 8_071_315_983, roe: 34.1, roa: 2.47, eps: 0.2743, nim: 14.59 },
  { id: 12, period: "Dec 2024", revenue: 23_321_907_455, net_interest_income: 16_138_598_151, non_interest_income: 7_183_309_304, pbt: 9_631_656_994, pat: 8_152_844_427, roe: 34.5, roa: 2.49, eps: 0.2770, nim: 14.74 },
];

// ── 2. Balance Sheet ─────────────────────────────────────────────────────────
export interface BalanceSheetRow {
  id: number;
  date: string;
  total_assets: number;         // ₦ raw naira
  total_liabilities: number;   // ₦ raw naira
  equity: number;              // ₦ raw naira (includes current year PAT)
  loan_book: number;           // ₦ raw naira
  deposit_base: number;        // ₦ raw naira (customer + interbank deposits)
  growth_rate_vs_prior: number; // % QoQ growth
}

// Q4 2024 from TB: Assets ₦3.585tn | Loans ₦1.201tn | Deposits ₦2.782tn | Equity ₦259.6bn
export const balance_sheet: BalanceSheetRow[] = [
  { id: 1, date: "Q1 2024", total_assets: 3_154_846_189_851, total_liabilities: 2_926_398_708_580, equity: 228_447_481_271, loan_book: 1_057_064_200_606, deposit_base: 2_448_437_431_030, growth_rate_vs_prior: 0.0 },
  { id: 2, date: "Q2 2024", total_assets: 3_334_098_814_274, total_liabilities: 3_092_671_362_477, equity: 241_427_451_798, loan_book: 1_117_124_666_549, deposit_base: 2_587_553_194_157, growth_rate_vs_prior: 5.7 },
  { id: 3, date: "Q3 2024", total_assets: 3_477_500_913_813, total_liabilities: 3_225_689_485_594, equity: 251_811_428_219, loan_book: 1_165_173_039_304, deposit_base: 2_698_845_804_658, growth_rate_vs_prior: 4.3 },
  { id: 4, date: "Q4 2024", total_assets: 3_585_052_488_467, total_liabilities: 3_325_453_077_932, equity: 259_599_410_535, loan_book: 1_201_209_318_870, deposit_base: 2_782_315_262_534, growth_rate_vs_prior: 3.1 },
];

// ── 3. Risk & Asset Quality Indicators ──────────────────────────────────────
export interface RiskIndicatorRow {
  id: number;
  date: string;
  npl_ratio: number;          // %
  npl_coverage: number;       // %
  cost_of_risk: number;       // %
  provisions: number;         // ₦ raw naira (provision stock)
  stage1_exposure: number;    // ₦ raw naira (performing loans)
  stage2_exposure: number;    // ₦ raw naira (under-watch)
  stage3_exposure: number;    // ₦ raw naira (non-performing)
  watchlist_exposure: number; // ₦ raw naira
}

export const risk_indicators: RiskIndicatorRow[] = [
  { id: 1, date: "Q1 2024", npl_ratio: 5.8, npl_coverage: 82.0, cost_of_risk: 1.74, provisions: 50_273_973_000, stage1_exposure: 975_099_065_000, stage2_exposure: 81_284_497_000, stage3_exposure: 61_309_724_000, watchlist_exposure: 52_853_210_000 },
  { id: 2, date: "Q2 2024", npl_ratio: 5.5, npl_coverage: 85.0, cost_of_risk: 1.65, provisions: 52_225_578_000, stage1_exposure: 1_023_684_291_000, stage2_exposure: 89_370_000_000, stage3_exposure: 61_441_857_000, watchlist_exposure: 55_856_233_000 },
  { id: 3, date: "Q3 2024", npl_ratio: 5.2, npl_coverage: 87.0, cost_of_risk: 1.56, provisions: 52_712_428_000, stage1_exposure: 1_069_159_000_000, stage2_exposure: 95_414_000_000, stage3_exposure: 60_588_998_000, watchlist_exposure: 58_258_652_000 },
  { id: 4, date: "Q4 2024", npl_ratio: 4.8, npl_coverage: 90.0, cost_of_risk: 1.54, provisions: 51_892_243_000, stage1_exposure: 1_047_454_526_000, stage2_exposure: 96_096_746_000, stage3_exposure: 57_658_047_000, watchlist_exposure: 60_060_466_000 },
];

// ── 4. Liquidity & Funding Metrics ───────────────────────────────────────────
export interface LiquidityMetricRow {
  id: number;
  date: string;
  lcr: number;                   // % Liquidity Coverage Ratio (min 100%)
  nsfr: number;                  // % Net Stable Funding Ratio (min 100%)
  loan_to_deposit_ratio: number; // %
  retail_funding_pct: number;    // %
  wholesale_funding_pct: number; // %
  interbank_borrowings: number;  // ₦ raw naira
  maturity_bucket: string;
}

export const liquidity_metrics: LiquidityMetricRow[] = [
  { id:  1, date: "Jan 2024", lcr: 148, nsfr: 118, loan_to_deposit_ratio: 45.8, retail_funding_pct: 67, wholesale_funding_pct: 33, interbank_borrowings: 285_000_000_000, maturity_bucket: "0–30d dominant" },
  { id:  2, date: "Feb 2024", lcr: 151, nsfr: 120, loan_to_deposit_ratio: 45.5, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 292_000_000_000, maturity_bucket: "0–30d dominant" },
  { id:  3, date: "Mar 2024", lcr: 155, nsfr: 122, loan_to_deposit_ratio: 45.1, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 268_000_000_000, maturity_bucket: "30–90d growing" },
  { id:  4, date: "Apr 2024", lcr: 152, nsfr: 121, loan_to_deposit_ratio: 44.8, retail_funding_pct: 67, wholesale_funding_pct: 33, interbank_borrowings: 310_000_000_000, maturity_bucket: "0–30d dominant" },
  { id:  5, date: "May 2024", lcr: 158, nsfr: 124, loan_to_deposit_ratio: 44.5, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 295_000_000_000, maturity_bucket: "0–30d dominant" },
  { id:  6, date: "Jun 2024", lcr: 162, nsfr: 127, loan_to_deposit_ratio: 44.2, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 275_000_000_000, maturity_bucket: "30–90d growing" },
  { id:  7, date: "Jul 2024", lcr: 156, nsfr: 123, loan_to_deposit_ratio: 44.0, retail_funding_pct: 67, wholesale_funding_pct: 33, interbank_borrowings: 318_000_000_000, maturity_bucket: "0–30d dominant" },
  { id:  8, date: "Aug 2024", lcr: 165, nsfr: 129, loan_to_deposit_ratio: 43.7, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 262_000_000_000, maturity_bucket: "30–90d growing" },
  { id:  9, date: "Sep 2024", lcr: 168, nsfr: 131, loan_to_deposit_ratio: 43.5, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 252_000_000_000, maturity_bucket: ">90d lengthening" },
  { id: 10, date: "Oct 2024", lcr: 170, nsfr: 133, loan_to_deposit_ratio: 43.4, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 260_000_000_000, maturity_bucket: "30–90d growing" },
  { id: 11, date: "Nov 2024", lcr: 172, nsfr: 134, loan_to_deposit_ratio: 43.3, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 255_000_000_000, maturity_bucket: ">90d lengthening" },
  { id: 12, date: "Dec 2024", lcr: 174, nsfr: 136, loan_to_deposit_ratio: 43.2, retail_funding_pct: 68, wholesale_funding_pct: 32, interbank_borrowings: 258_500_000_000, maturity_bucket: ">90d lengthening" },
];

// ── 5. Treasury & Market Risk ────────────────────────────────────────────────
export interface TreasuryMarketRow {
  id: number;
  date: string;
  portfolio_value: number;        // ₦ raw naira total securities
  yield_on_securities: number;    // % annualised
  fx_usd_exposure: number;        // USD millions net long
  fx_gbp_exposure: number;        // GBP millions
  fx_eur_exposure: number;        // EUR millions
  open_position_vs_limit: number; // % of regulatory FX open position limit
  dv01: number;                   // ₦ millions (value of 1bp move)
  nii_at_risk: number;            // ₦ raw naira
}

// Portfolio Q4 2024 from TB: investments+pledged = ₦1,199.3bn
export const treasury_market: TreasuryMarketRow[] = [
  { id:  1, date: "Jan 2024", portfolio_value: 1_055_381_984_000, yield_on_securities: 18.5, fx_usd_exposure: 282, fx_gbp_exposure: 52, fx_eur_exposure:  66, open_position_vs_limit: 40, dv01:  92, nii_at_risk: 15_200_000_000 },
  { id:  2, date: "Feb 2024", portfolio_value: 1_067_175_362_000, yield_on_securities: 19.0, fx_usd_exposure: 298, fx_gbp_exposure: 55, fx_eur_exposure:  72, open_position_vs_limit: 43, dv01:  98, nii_at_risk: 15_900_000_000 },
  { id:  3, date: "Mar 2024", portfolio_value: 1_078_968_740_000, yield_on_securities: 19.8, fx_usd_exposure: 318, fx_gbp_exposure: 59, fx_eur_exposure:  80, open_position_vs_limit: 46, dv01: 105, nii_at_risk: 16_800_000_000 },
  { id:  4, date: "Apr 2024", portfolio_value: 1_090_762_118_000, yield_on_securities: 20.5, fx_usd_exposure: 338, fx_gbp_exposure: 63, fx_eur_exposure:  88, open_position_vs_limit: 49, dv01: 112, nii_at_risk: 17_600_000_000 },
  { id:  5, date: "May 2024", portfolio_value: 1_102_555_496_000, yield_on_securities: 21.2, fx_usd_exposure: 355, fx_gbp_exposure: 68, fx_eur_exposure:  96, open_position_vs_limit: 52, dv01: 120, nii_at_risk: 18_500_000_000 },
  { id:  6, date: "Jun 2024", portfolio_value: 1_114_348_874_000, yield_on_securities: 21.8, fx_usd_exposure: 372, fx_gbp_exposure: 74, fx_eur_exposure: 104, open_position_vs_limit: 55, dv01: 128, nii_at_risk: 19_400_000_000 },
  { id:  7, date: "Jul 2024", portfolio_value: 1_126_142_252_000, yield_on_securities: 22.2, fx_usd_exposure: 388, fx_gbp_exposure: 78, fx_eur_exposure: 108, open_position_vs_limit: 57, dv01: 135, nii_at_risk: 20_200_000_000 },
  { id:  8, date: "Aug 2024", portfolio_value: 1_137_935_630_000, yield_on_securities: 22.8, fx_usd_exposure: 402, fx_gbp_exposure: 82, fx_eur_exposure: 112, open_position_vs_limit: 59, dv01: 142, nii_at_risk: 21_100_000_000 },
  { id:  9, date: "Sep 2024", portfolio_value: 1_149_729_008_000, yield_on_securities: 23.2, fx_usd_exposure: 416, fx_gbp_exposure: 86, fx_eur_exposure: 116, open_position_vs_limit: 61, dv01: 150, nii_at_risk: 22_400_000_000 },
  { id: 10, date: "Oct 2024", portfolio_value: 1_161_522_386_000, yield_on_securities: 23.6, fx_usd_exposure: 428, fx_gbp_exposure: 89, fx_eur_exposure: 120, open_position_vs_limit: 63, dv01: 158, nii_at_risk: 23_800_000_000 },
  { id: 11, date: "Nov 2024", portfolio_value: 1_185_109_142_000, yield_on_securities: 24.2, fx_usd_exposure: 438, fx_gbp_exposure: 92, fx_eur_exposure: 123, open_position_vs_limit: 65, dv01: 166, nii_at_risk: 26_200_000_000 },
  { id: 12, date: "Dec 2024", portfolio_value: 1_199_297_709_155, yield_on_securities: 24.6, fx_usd_exposure: 445, fx_gbp_exposure: 95, fx_eur_exposure: 125, open_position_vs_limit: 67, dv01: 175, nii_at_risk: 28_500_000_000 },
];

// ── 6. Budget vs Actual Variance ─────────────────────────────────────────────
export interface BudgetVsActualRow {
  id: number;
  line_item: string;
  budget_amount: number;  // ₦ raw naira (full year)
  actual_amount: number;  // ₦ raw naira (full year)
  variance_ngn: number;   // ₦ raw naira (positive = favourable)
  variance_pct: number;   // % (positive = favourable)
  rag_status: "Green" | "Amber" | "Red";
}

// Actuals from FY 2024 TB; budgets set conservatively below actuals for income
export const budget_vs_actual: BudgetVsActualRow[] = [
  { id:  1, line_item: "Total Revenue",          budget_amount: 248_000_000_000, actual_amount: 255_841_324_779, variance_ngn:   7_841_324_779, variance_pct:  3.2, rag_status: "Green" },
  { id:  2, line_item: "Net Interest Income",    budget_amount: 170_000_000_000, actual_amount: 177_040_421_716, variance_ngn:   7_040_421_716, variance_pct:  4.1, rag_status: "Green" },
  { id:  3, line_item: "Non-Interest Income",    budget_amount: 78_000_000_000,  actual_amount: 78_800_903_063,  variance_ngn:     800_903_063,  variance_pct:  1.0, rag_status: "Green" },
  { id:  4, line_item: "Total Operating Expenses",budget_amount:128_000_000_000, actual_amount: 131_682_692_440, variance_ngn:  -3_682_692_440,  variance_pct: -2.9, rag_status: "Amber" },
  { id:  5, line_item: "Staff Costs",            budget_amount: 44_000_000_000,  actual_amount: 45_475_369_084,  variance_ngn:  -1_475_369_084,  variance_pct: -3.4, rag_status: "Amber" },
  { id:  6, line_item: "Other Operating Expenses",budget_amount:77_000_000_000,  actual_amount: 77_467_214_784,  variance_ngn:    -467_214_784,  variance_pct: -0.6, rag_status: "Green" },
  { id:  7, line_item: "Net Provisions & Impairment",budget_amount:20_000_000_000,actual_amount:18_499_355_120,  variance_ngn:   1_500_644_880,  variance_pct:  7.5, rag_status: "Green" },
  { id:  8, line_item: "Profit Before Tax",      budget_amount: 100_000_000_000, actual_amount: 105_659_277_219, variance_ngn:   5_659_277_219,  variance_pct:  5.7, rag_status: "Green" },
  { id:  9, line_item: "Profit After Tax",       budget_amount:  85_000_000_000, actual_amount: 89_436_703_365,  variance_ngn:   4_436_703_365,  variance_pct:  5.2, rag_status: "Green" },
  { id: 10, line_item: "Loan Book",              budget_amount:1_150_000_000_000,actual_amount:1_201_209_318_870,variance_ngn:  51_209_318_870,  variance_pct:  4.5, rag_status: "Green" },
];

// ── 7. Cost & Operational Metrics ────────────────────────────────────────────
export interface CostMetricRow {
  id: number;
  date: string;
  cost_to_income_ratio: number; // %
  total_opex: number;           // ₦ raw naira (monthly)
  staff_cost: number;           // ₦ raw naira (monthly)
  it_cost: number;              // ₦ raw naira (monthly)
  admin_cost: number;           // ₦ raw naira (monthly)
  operational_losses: number;   // ₦ thousands (small amounts)
  headcount: number;
}

// Annual OpEx from TB: Staff ₦45.5bn | Other ₦77.5bn | D&A ₦8.7bn | Total ₦131.7bn
export const cost_metrics: CostMetricRow[] = [
  { id:  1, date: "Jan 2024", cost_to_income_ratio: 53.1, total_opex:  9_836_444_000, staff_cost: 3_398_099_000, it_cost:   696_000_000, admin_cost: 5_742_345_000, operational_losses: 156_000, headcount: 12_420 },
  { id:  2, date: "Feb 2024", cost_to_income_ratio: 52.8, total_opex: 10_079_355_000, staff_cost: 3_480_993_000, it_cost:   713_000_000, admin_cost: 5_885_362_000, operational_losses: 178_000, headcount: 12_455 },
  { id:  3, date: "Mar 2024", cost_to_income_ratio: 52.5, total_opex: 10_322_266_000, staff_cost: 3_563_887_000, it_cost:   730_000_000, admin_cost: 6_028_379_000, operational_losses: 142_000, headcount: 12_510 },
  { id:  4, date: "Apr 2024", cost_to_income_ratio: 52.2, total_opex: 10_443_721_000, staff_cost: 3_605_334_000, it_cost:   738_000_000, admin_cost: 6_100_387_000, operational_losses: 205_000, headcount: 12_560 },
  { id:  5, date: "May 2024", cost_to_income_ratio: 51.9, total_opex: 10_686_632_000, staff_cost: 3_688_228_000, it_cost:   755_000_000, admin_cost: 6_243_404_000, operational_losses: 191_000, headcount: 12_610 },
  { id:  6, date: "Jun 2024", cost_to_income_ratio: 51.6, total_opex: 10_929_543_000, staff_cost: 3_771_122_000, it_cost:   772_000_000, admin_cost: 6_386_421_000, operational_losses: 165_000, headcount: 12_650 },
  { id:  7, date: "Jul 2024", cost_to_income_ratio: 51.9, total_opex: 11_051_000_000, staff_cost: 3_812_569_000, it_cost:   780_000_000, admin_cost: 6_458_431_000, operational_losses: 262_000, headcount: 12_690 },
  { id:  8, date: "Aug 2024", cost_to_income_ratio: 51.4, total_opex: 11_293_911_000, staff_cost: 3_895_463_000, it_cost:   797_000_000, admin_cost: 6_601_448_000, operational_losses: 156_000, headcount: 12_730 },
  { id:  9, date: "Sep 2024", cost_to_income_ratio: 51.2, total_opex: 11_536_822_000, staff_cost: 3_978_357_000, it_cost:   814_000_000, admin_cost: 6_744_465_000, operational_losses: 139_000, headcount: 12_760 },
  { id: 10, date: "Oct 2024", cost_to_income_ratio: 51.3, total_opex: 11_658_277_000, staff_cost: 4_019_804_000, it_cost:   822_000_000, admin_cost: 6_816_473_000, operational_losses: 184_000, headcount: 12_785 },
  { id: 11, date: "Nov 2024", cost_to_income_ratio: 51.0, total_opex: 11_901_188_000, staff_cost: 4_102_698_000, it_cost:   839_000_000, admin_cost: 6_959_490_000, operational_losses: 167_000, headcount: 12_800 },
  { id: 12, date: "Dec 2024", cost_to_income_ratio: 50.8, total_opex: 12_002_980_000, staff_cost: 4_144_027_000, it_cost:   848_000_000, admin_cost: 7_010_953_000, operational_losses: 205_000, headcount: 12_824 },
];

// ── 8. Customer & Business Segment Insights ──────────────────────────────────
export interface SegmentInsightRow {
  id: number;
  date: string;
  total_active_customers: number; // millions (stored as e.g. 10.2 = 10.2mn)
  new_customers: number;          // thousands (stored as e.g. 85 = 85k)
  retail_revenue: number;         // ₦ raw naira (monthly)
  sme_revenue: number;            // ₦ raw naira (monthly)
  corporate_revenue: number;      // ₦ raw naira (monthly)
  treasury_revenue: number;       // ₦ raw naira (monthly)
  product_penetration_rate: number; // avg products per customer
}

// Revenue split: Retail 32% | SME 18% | Corporate 38% | Treasury 12%
export const segment_insights: SegmentInsightRow[] = [
  { id:  1, date: "Jan 2024", total_active_customers: 10.22, new_customers:  85, retail_revenue: 6_120_000_000, sme_revenue: 3_442_000_000, corporate_revenue: 7_268_000_000, treasury_revenue: 2_294_000_000, product_penetration_rate: 3.4 },
  { id:  2, date: "Feb 2024", total_active_customers: 10.30, new_customers:  92, retail_revenue: 6_268_000_000, sme_revenue: 3_526_000_000, corporate_revenue: 7_444_000_000, treasury_revenue: 2_352_000_000, product_penetration_rate: 3.4 },
  { id:  3, date: "Mar 2024", total_active_customers: 10.40, new_customers: 108, retail_revenue: 6_418_000_000, sme_revenue: 3_610_000_000, corporate_revenue: 7_620_000_000, treasury_revenue: 2_410_000_000, product_penetration_rate: 3.5 },
  { id:  4, date: "Apr 2024", total_active_customers: 10.48, new_customers: 115, retail_revenue: 6_493_000_000, sme_revenue: 3_652_000_000, corporate_revenue: 7_710_000_000, treasury_revenue: 2_435_000_000, product_penetration_rate: 3.5 },
  { id:  5, date: "May 2024", total_active_customers: 10.57, new_customers: 122, retail_revenue: 6_642_000_000, sme_revenue: 3_736_000_000, corporate_revenue: 7_887_000_000, treasury_revenue: 2_491_000_000, product_penetration_rate: 3.6 },
  { id:  6, date: "Jun 2024", total_active_customers: 10.65, new_customers: 131, retail_revenue: 6_791_000_000, sme_revenue: 3_820_000_000, corporate_revenue: 8_065_000_000, treasury_revenue: 2_547_000_000, product_penetration_rate: 3.6 },
  { id:  7, date: "Jul 2024", total_active_customers: 10.72, new_customers: 138, retail_revenue: 6_866_000_000, sme_revenue: 3_862_000_000, corporate_revenue: 8_155_000_000, treasury_revenue: 2_573_000_000, product_penetration_rate: 3.7 },
  { id:  8, date: "Aug 2024", total_active_customers: 10.80, new_customers: 148, retail_revenue: 7_015_000_000, sme_revenue: 3_946_000_000, corporate_revenue: 8_333_000_000, treasury_revenue: 2_628_000_000, product_penetration_rate: 3.7 },
  { id:  9, date: "Sep 2024", total_active_customers: 10.87, new_customers: 155, retail_revenue: 7_164_000_000, sme_revenue: 4_030_000_000, corporate_revenue: 8_511_000_000, treasury_revenue: 2_684_000_000, product_penetration_rate: 3.8 },
  { id: 10, date: "Oct 2024", total_active_customers: 10.92, new_customers: 142, retail_revenue: 7_239_000_000, sme_revenue: 4_072_000_000, corporate_revenue: 8_600_000_000, treasury_revenue: 2_711_000_000, product_penetration_rate: 3.8 },
  { id: 11, date: "Nov 2024", total_active_customers: 10.97, new_customers: 128, retail_revenue: 7_388_000_000, sme_revenue: 4_156_000_000, corporate_revenue: 8_778_000_000, treasury_revenue: 2_767_000_000, product_penetration_rate: 3.9 },
  { id: 12, date: "Dec 2024", total_active_customers: 11.02, new_customers: 118, retail_revenue: 7_463_000_000, sme_revenue: 4_198_000_000, corporate_revenue: 8_862_000_000, treasury_revenue: 2_799_000_000, product_penetration_rate: 3.9 },
];
