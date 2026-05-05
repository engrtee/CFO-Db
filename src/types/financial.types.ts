import type { SubsidiaryCode, RAGStatus } from './subsidiary.types';

export type AccountCategory = 'Revenue' | 'Claims' | 'Expense' | 'Investment' | 'Tax';
export type ClaimStatus = 'Open' | 'Settled' | 'Repudiated' | 'Litigation';
export type LineOfBusiness =
  | 'Motor' | 'Marine' | 'Fire & Property' | 'Engineering'
  | 'Oil & Gas' | 'Aviation' | 'Life Individual' | 'Life Group'
  | 'Annuities' | 'Health';

export interface IncomeStatementGLRow {
  gl_id: string;
  subsidiary_code: SubsidiaryCode;
  accounting_period: string;
  account_code: string;
  account_name: string;
  account_category: AccountCategory;
  actual_amount: number;
  budget_amount: number;
  prior_year_amount: number;
  ytd_actual: number;
  ytd_budget: number;
  intercompany_elimination: number;
  consolidated_amount: number;
}

export interface BalanceSheetGLRow {
  bs_id: string;
  subsidiary_code: SubsidiaryCode;
  accounting_period: string;
  account_code: string;
  account_name: string;
  account_type: 'Asset' | 'Liability' | 'Equity';
  balance: number;
  prior_period_balance: number;
}

export interface BudgetMasterRow {
  subsidiary_code: SubsidiaryCode;
  fiscal_year: number;
  accounting_period: string;
  account_code: string;
  annual_budget: number;
  monthly_budget: number;
  ytd_budget: number;
}

export interface PremiumEarningScheduleRow {
  subsidiary_code: SubsidiaryCode;
  accounting_period: string;
  line_of_business: LineOfBusiness;
  upr_opening: number;
  premium_written: number;
  premium_earned: number;
  upr_closing: number;
}

export interface PolicyPremiumLedgerRow {
  ledger_id: string;
  policy_id: string;
  subsidiary_code: SubsidiaryCode;
  transaction_date: string;
  accounting_period: string;
  gross_premium_written: number;
  reinsurance_ceded: number;
  net_premium_written: number;
  unearned_premium_bf: number;
  unearned_premium_cf: number;
  net_earned_premium: number;
  currency_code: string;
  exchange_rate: number;
}

export interface ComputedKPIRow {
  kpi_id: string;
  subsidiary_code: SubsidiaryCode;
  reporting_period: string;
  kpi_name: string;
  kpi_value: number;
  kpi_unit: string;
  rag_status: RAGStatus;
  threshold_min: number;
  threshold_max: number;
  last_computed: string;
}

export interface ExchangeRateRow {
  rate_date: string;
  currency_pair: string;
  rate: number;
  source: string;
}

export interface FinancialSummary {
  subsidiaryCode: SubsidiaryCode;
  period: string;
  gwp: number;
  reinsuranceCeded: number;
  netRetentionRatio: number;
  nep: number;
  claimsIncurred: number;
  lossRatio: number;
  managementExpenses: number;
  mer: number;
  combinedRatio: number;
  underwritingProfit: number;
  investmentIncome: number;
  pbt: number;
  tax: number;
  pat: number;
  budgetGwp: number;
  budgetPat: number;
  priorYearGwp: number;
  priorYearPat: number;
}
