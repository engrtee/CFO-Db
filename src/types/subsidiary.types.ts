export type SubsidiaryCode = 'LWL' | 'LWG' | 'LWC' | 'LWH' | 'LWT' | 'LWP' | 'LWN' | 'ALL';
export type RAGStatus = 'Green' | 'Amber' | 'Red';
export type Currency = 'NGN' | 'USD';
export type TimePeriod = 'MTD' | 'QTD' | 'YTD' | 'CUSTOM';
export type AccountingPeriod = string; // 'YYYY-MM'

export interface SubsidiaryMaster {
  code: SubsidiaryCode;
  name: string;
  shortName: string;
  regulator: string;
  licence: string;
  isInsurance: boolean;
  isPension: boolean;
  isAssetMgmt: boolean;
  incorporatedYear: number;
  headcount: number;
}

export interface ServiceParams {
  subsidiaryCode: SubsidiaryCode;
  period: AccountingPeriod;
  currency: Currency;
}
