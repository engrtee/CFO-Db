import type { SubsidiaryCode, RAGStatus } from './subsidiary.types';

export type TreatyType = 'QS' | 'Surplus' | 'XL' | 'Fac' | 'CAT XL';

export interface RegulatoryCapitalRow {
  snapshot_id: string;
  subsidiary_code: SubsidiaryCode;
  reporting_period: string;
  paid_up_capital: number;
  share_premium: number;
  retained_earnings: number;
  other_reserves: number;
  total_shareholders_funds: number;
  total_admissible_assets: number;
  total_liabilities: number;
  net_premium_income: number;
  solvency_margin_naira: number;
  solvency_margin_ratio: number;
  naicom_minimum_capital: number;
  capital_headroom: number;
  rbc_ratio_placeholder: number;
}

export interface ReinsuranceTreatyRow {
  treaty_id: string;
  subsidiary_code: SubsidiaryCode;
  reinsurer_name: string;
  reinsurer_rating: string;
  treaty_type: TreatyType;
  line_of_business: string;
  treaty_start_date: string;
  treaty_end_date: string;
  cession_rate: number;
  premium_ceded_ytd: number;
  claims_recovered_ytd: number;
  recoveries_outstanding: number;
  counterparty_exposure: number;
}

export interface BrokerMasterRow {
  broker_id: string;
  broker_name: string;
  broker_tier: 'Top-tier' | 'Mid-tier' | 'Regional';
  gwp_ytd: number;
  gwp_prior_year: number;
  premium_outstanding: number;
  debtor_aging_30: number;
  debtor_aging_60: number;
  debtor_aging_90: number;
  debtor_aging_90plus: number;
  primary_subsidiary: SubsidiaryCode;
}

export interface CustomerMasterRow {
  customer_id: string;
  customer_name: string;
  sector: string;
  total_gwp_ytd: number;
  policy_count: number;
  primary_subsidiary: SubsidiaryCode;
  renewal_status: 'Active' | 'Lapsed' | 'Renewed' | 'Under Review';
}

export interface RegulatoryAlertRow {
  alert_id: string;
  subsidiary_code: SubsidiaryCode;
  alert_timestamp: string;
  regulatory_requirement: string;
  regulator: string;
  kpi_name: string;
  kpi_value: number;
  threshold: number;
  rag_status: RAGStatus;
  alert_message: string;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
}

export interface CapitalSummary {
  subsidiaryCode: SubsidiaryCode;
  solvencyMarginRatio: number;
  capitalHeadroom: number;
  totalShareholdersFunds: number;
  roe: number;
  roa: number;
  ragStatus: RAGStatus;
  naicomMinimum: number;
}

export interface ComplianceRAGBoard {
  lossRatioGeneral: RAGStatus;
  lossRatioLife: RAGStatus;
  solvencyMargin: Record<SubsidiaryCode, RAGStatus>;
  prescribedAssets: RAGStatus;
  claimsPayingAbility: RAGStatus;
  minCapital: Record<SubsidiaryCode, RAGStatus>;
  mer: RAGStatus;
}
