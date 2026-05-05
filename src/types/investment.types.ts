import type { SubsidiaryCode } from './subsidiary.types';

export type InstrumentType =
  | 'FGS' | 'State Bond' | 'Corporate Bond' | 'Equity'
  | 'MMI' | 'Real Estate' | 'Offshore';

export interface InvestmentHoldingRow {
  holding_id: string;
  subsidiary_code: SubsidiaryCode;
  instrument_type: InstrumentType;
  issuer_name: string;
  isin_code: string;
  face_value: number;
  cost_of_acquisition: number;
  current_market_value: number;
  unrealised_gain_loss: number;
  coupon_rate: number;
  maturity_date: string;
  duration_years: number;
  yield_to_maturity: number;
  prescribed_asset_flag: boolean;
  valuation_date: string;
  currency_code: string;
}

export interface InvestmentIncomeLedgerRow {
  subsidiary_code: SubsidiaryCode;
  accounting_period: string;
  instrument_type: InstrumentType;
  interest_income: number;
  dividend_income: number;
  realised_gains: number;
  unrealised_gains: number;
  total_income: number;
}

export interface InvestmentSummary {
  subsidiaryCode: SubsidiaryCode;
  totalAUM: number;
  prescribedAssetRatio: number;
  portfolioYield: number;
  unrealisedGainLoss: number;
  durationGap: number;
  byAssetClass: Record<InstrumentType, number>;
  top10Holdings: InvestmentHoldingRow[];
  offshoreExposureUSD: number;
}

export interface CashPositionRow {
  position_id: string;
  subsidiary_code: SubsidiaryCode;
  position_date: string;
  bank_name: string;
  account_number: string;
  account_type: string;
  currency_code: string;
  balance_local_ccy: number;
  exchange_rate_to_ngn: number;
  balance_ngn: number;
  available_balance_ngn: number;
  intercompany_flag: boolean;
}

export interface CashflowStatementRow {
  subsidiary_code: SubsidiaryCode;
  accounting_period: string;
  operating_cf: number;
  investing_cf: number;
  financing_cf: number;
  free_cash_flow: number;
  opening_cash: number;
  closing_cash: number;
}
