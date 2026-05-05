import type { SubsidiaryCode } from './subsidiary.types';
import type { LineOfBusiness, ClaimStatus } from './financial.types';

export interface ClaimsRegisterRow {
  claim_id: string;
  policy_id: string;
  subsidiary_code: SubsidiaryCode;
  line_of_business: LineOfBusiness;
  date_of_loss: string;
  date_reported: string;
  date_settled: string | null;
  gross_claim_amount: number;
  reinsurance_recovery: number;
  net_claim_amount: number;
  claim_status: ClaimStatus;
  ibnr_flag: boolean;
  large_loss_flag: boolean;
  fraud_flag: boolean;
  settlement_days: number | null;
  claim_handler_id: string;
}

export interface IBNRReserveRow {
  subsidiary_code: SubsidiaryCode;
  accounting_period: string;
  line_of_business: LineOfBusiness;
  ocr_amount: number;
  ibnr_amount: number;
  total_reserve: number;
  actuarial_best_estimate: number;
  adequacy_ratio: number;
}

export interface ClaimsSummary {
  subsidiaryCode: SubsidiaryCode;
  totalClaims: number;
  netClaims: number;
  riRecoveryRate: number;
  avgSettlementDays: number;
  openCount: number;
  settledCount: number;
  litigationCount: number;
  largeLossCount: number;
  largeLossValue: number;
  fraudFlaggedCount: number;
  fraudFlaggedValue: number;
  lossRatioByLob: Record<string, number>;
}
