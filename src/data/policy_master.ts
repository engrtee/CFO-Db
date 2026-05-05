import type { SubsidiaryCode } from '../types/subsidiary.types';
import type { LineOfBusiness } from '../types/financial.types';

// ── Policy statistics summary ─────────────────────────────────────────────
export const policyStats = {
  totalPolicies: 48_524,
  activePolicies: 38_150,
  lapsedPolicies: 6_820,
  expiredPolicies: 3_554,
  newPoliciesYTD: 4_812,
  renewalRateYTD: 0.78,
  totalSumInsured: 2_450_000_000_000, // ₦2.45tn
  totalGrossPremiumYTD: 18_200_000_000,
  bySubsidiary: {
    LWL: { count: 18_500, gwpYtd: 9_800_000_000  },
    LWG: { count: 15_200, gwpYtd: 6_200_000_000  },
    LWH: { count:  9_100, gwpYtd: 1_850_000_000  },
    LWN: { count:  2_800, gwpYtd:   220_000_000  },
    LWT: { count:    524, gwpYtd:    80_000_000  },
    LWP: { count:    400, gwpYtd:    50_000_000  },
    LWC: { count:      0, gwpYtd:             0  },
  },
  byLineOfBusiness: {
    'Life Individual':  { count: 14_200, gwpYtd: 5_500_000_000 },
    'Life Group':       { count:  4_300, gwpYtd: 4_200_000_000 },
    'Motor':            { count: 12_500, gwpYtd: 2_800_000_000 },
    'Fire & Property':  { count:  5_200, gwpYtd: 1_800_000_000 },
    'Health':           { count:  9_100, gwpYtd: 1_850_000_000 },
    'Oil & Gas':        { count:    180, gwpYtd: 1_100_000_000 },
    'Marine':           { count:    820, gwpYtd:   520_000_000 },
    'Engineering':      { count:    650, gwpYtd:   280_000_000 },
    'Annuities':        { count:    980, gwpYtd:   100_000_000 },
    'Aviation':         { count:     94, gwpYtd:    50_000_000 },
  },
};

// ── Sample policies (50 representative records) ────────────────────────────
type PolicyRecord = {
  policy_id: string;
  subsidiary_code: SubsidiaryCode;
  product_code: string;
  line_of_business: LineOfBusiness;
  channel_code: string;
  sum_insured: number;
  gross_premium: number;
  status: 'Active' | 'Lapsed' | 'Expired';
  renewal_flag: boolean;
  broker_id: string;
  created_date: string;
};

export const samplePolicies: PolicyRecord[] = [
  { policy_id:'POL-LWL-00001', subsidiary_code:'LWL', product_code:'LI-IND-001', line_of_business:'Life Individual', channel_code:'BROKER', sum_insured:50_000_000, gross_premium:2_400_000, status:'Active', renewal_flag:true,  broker_id:'BRK-003', created_date:'2024-01-10' },
  { policy_id:'POL-LWL-00002', subsidiary_code:'LWL', product_code:'LI-GRP-001', line_of_business:'Life Group',      channel_code:'DIRECT', sum_insured:2_500_000_000, gross_premium:85_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-001', created_date:'2024-01-15' },
  { policy_id:'POL-LWL-00003', subsidiary_code:'LWL', product_code:'ANN-001',    line_of_business:'Annuities',       channel_code:'BROKER', sum_insured:180_000_000, gross_premium:15_000_000, status:'Active', renewal_flag:false, broker_id:'BRK-006', created_date:'2024-02-01' },
  { policy_id:'POL-LWG-00001', subsidiary_code:'LWG', product_code:'MT-COMP-001',line_of_business:'Motor',           channel_code:'BROKER', sum_insured:8_500_000, gross_premium:320_000, status:'Active', renewal_flag:true,   broker_id:'BRK-001', created_date:'2024-01-05' },
  { policy_id:'POL-LWG-00002', subsidiary_code:'LWG', product_code:'MT-COMP-001',line_of_business:'Motor',           channel_code:'DIRECT', sum_insured:12_000_000, gross_premium:480_000, status:'Active', renewal_flag:true,  broker_id:'BRK-004', created_date:'2024-01-08' },
  { policy_id:'POL-LWG-00003', subsidiary_code:'LWG', product_code:'FP-COM-001', line_of_business:'Fire & Property', channel_code:'BROKER', sum_insured:500_000_000, gross_premium:12_500_000, status:'Active', renewal_flag:true,  broker_id:'BRK-002', created_date:'2024-01-20' },
  { policy_id:'POL-LWG-00004', subsidiary_code:'LWG', product_code:'OG-EXP-001', line_of_business:'Oil & Gas',       channel_code:'BROKER', sum_insured:5_000_000_000, gross_premium:250_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-001', created_date:'2024-01-22' },
  { policy_id:'POL-LWG-00005', subsidiary_code:'LWG', product_code:'MRN-001',    line_of_business:'Marine',          channel_code:'BROKER', sum_insured:800_000_000, gross_premium:18_000_000, status:'Active', renewal_flag:false, broker_id:'BRK-002', created_date:'2024-02-10' },
  { policy_id:'POL-LWG-00006', subsidiary_code:'LWG', product_code:'ENG-CAR-001',line_of_business:'Engineering',     channel_code:'BROKER', sum_insured:1_200_000_000, gross_premium:35_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-005', created_date:'2024-02-15' },
  { policy_id:'POL-LWG-00007', subsidiary_code:'LWG', product_code:'AVI-001',    line_of_business:'Aviation',        channel_code:'DIRECT', sum_insured:15_000_000_000, gross_premium:120_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-001', created_date:'2024-03-01' },
  { policy_id:'POL-LWH-00001', subsidiary_code:'LWH', product_code:'HMO-IND-001',line_of_business:'Health',          channel_code:'DIRECT', sum_insured:5_000_000, gross_premium:180_000, status:'Active', renewal_flag:true,   broker_id:'BRK-013', created_date:'2024-01-02' },
  { policy_id:'POL-LWH-00002', subsidiary_code:'LWH', product_code:'HMO-GRP-001',line_of_business:'Health',          channel_code:'BROKER', sum_insured:1_500_000_000, gross_premium:48_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-003', created_date:'2024-01-12' },
  { policy_id:'POL-LWL-00004', subsidiary_code:'LWL', product_code:'LI-IND-002', line_of_business:'Life Individual', channel_code:'AGENCY', sum_insured:30_000_000, gross_premium:1_800_000, status:'Active', renewal_flag:true,  broker_id:'BRK-008', created_date:'2024-03-05' },
  { policy_id:'POL-LWL-00005', subsidiary_code:'LWL', product_code:'LI-GRP-002', line_of_business:'Life Group',      channel_code:'BROKER', sum_insured:800_000_000, gross_premium:28_000_000, status:'Active', renewal_flag:false, broker_id:'BRK-007', created_date:'2024-03-10' },
  { policy_id:'POL-LWG-00008', subsidiary_code:'LWG', product_code:'FP-IND-001', line_of_business:'Fire & Property', channel_code:'DIRECT', sum_insured:45_000_000, gross_premium:900_000, status:'Lapsed', renewal_flag:false,   broker_id:'BRK-009', created_date:'2024-01-18' },
  { policy_id:'POL-LWG-00009', subsidiary_code:'LWG', product_code:'MT-TPL-001', line_of_business:'Motor',           channel_code:'DIRECT', sum_insured:1_000_000, gross_premium:15_000, status:'Active', renewal_flag:true,       broker_id:'BRK-010', created_date:'2024-04-01' },
  { policy_id:'POL-LWL-00006', subsidiary_code:'LWL', product_code:'ANN-002',    line_of_business:'Annuities',       channel_code:'BROKER', sum_insured:250_000_000, gross_premium:20_000_000, status:'Active', renewal_flag:false, broker_id:'BRK-006', created_date:'2024-04-15' },
  { policy_id:'POL-LWG-00010', subsidiary_code:'LWG', product_code:'FP-COM-002', line_of_business:'Fire & Property', channel_code:'BROKER', sum_insured:300_000_000, gross_premium:7_500_000, status:'Active', renewal_flag:true,  broker_id:'BRK-002', created_date:'2024-05-01' },
  { policy_id:'POL-LWH-00003', subsidiary_code:'LWH', product_code:'HMO-GRP-002',line_of_business:'Health',          channel_code:'BROKER', sum_insured:800_000_000, gross_premium:25_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-003', created_date:'2024-05-10' },
  { policy_id:'POL-LWL-00007', subsidiary_code:'LWL', product_code:'LI-IND-003', line_of_business:'Life Individual', channel_code:'BANCASS', sum_insured:20_000_000, gross_premium:1_200_000, status:'Active', renewal_flag:true, broker_id:'BRK-019', created_date:'2024-05-20' },
  { policy_id:'POL-LWG-00011', subsidiary_code:'LWG', product_code:'OG-EXP-002', line_of_business:'Oil & Gas',       channel_code:'BROKER', sum_insured:2_500_000_000, gross_premium:125_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-001', created_date:'2024-06-01' },
  { policy_id:'POL-LWG-00012', subsidiary_code:'LWG', product_code:'MRN-002',    line_of_business:'Marine',          channel_code:'BROKER', sum_insured:450_000_000, gross_premium:10_000_000, status:'Expired', renewal_flag:false, broker_id:'BRK-005', created_date:'2024-06-10' },
  { policy_id:'POL-LWL-00008', subsidiary_code:'LWL', product_code:'LI-GRP-003', line_of_business:'Life Group',      channel_code:'DIRECT', sum_insured:1_200_000_000, gross_premium:42_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-004', created_date:'2024-07-01' },
  { policy_id:'POL-LWG-00013', subsidiary_code:'LWG', product_code:'ENG-EAR-001',line_of_business:'Engineering',     channel_code:'BROKER', sum_insured:600_000_000, gross_premium:18_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-002', created_date:'2024-07-15' },
  { policy_id:'POL-LWH-00004', subsidiary_code:'LWH', product_code:'HMO-IND-002',line_of_business:'Health',          channel_code:'DIRECT', sum_insured:3_000_000, gross_premium:120_000, status:'Active', renewal_flag:true,    broker_id:'BRK-013', created_date:'2024-08-01' },
  { policy_id:'POL-LWL-00009', subsidiary_code:'LWL', product_code:'ANN-003',    line_of_business:'Annuities',       channel_code:'BROKER', sum_insured:400_000_000, gross_premium:32_000_000, status:'Active', renewal_flag:false, broker_id:'BRK-003', created_date:'2024-08-20' },
  { policy_id:'POL-LWG-00014', subsidiary_code:'LWG', product_code:'FP-IND-002', line_of_business:'Fire & Property', channel_code:'BROKER', sum_insured:120_000_000, gross_premium:3_000_000, status:'Active', renewal_flag:true,  broker_id:'BRK-011', created_date:'2024-09-01' },
  { policy_id:'POL-LWG-00015', subsidiary_code:'LWG', product_code:'MT-COMP-002',line_of_business:'Motor',           channel_code:'DIRECT', sum_insured:18_000_000, gross_premium:720_000, status:'Lapsed', renewal_flag:false,    broker_id:'BRK-016', created_date:'2024-09-10' },
  { policy_id:'POL-LWL-00010', subsidiary_code:'LWL', product_code:'LI-IND-004', line_of_business:'Life Individual', channel_code:'AGENCY', sum_insured:10_000_000, gross_premium:600_000, status:'Active', renewal_flag:true,     broker_id:'BRK-014', created_date:'2024-10-01' },
  { policy_id:'POL-LWG-00016', subsidiary_code:'LWG', product_code:'AVI-002',    line_of_business:'Aviation',        channel_code:'BROKER', sum_insured:8_000_000_000, gross_premium:64_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-001', created_date:'2024-10-15' },
  { policy_id:'POL-LWH-00005', subsidiary_code:'LWH', product_code:'HMO-GRP-003',line_of_business:'Health',          channel_code:'BROKER', sum_insured:500_000_000, gross_premium:16_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-007', created_date:'2024-11-01' },
  { policy_id:'POL-LWL-00011', subsidiary_code:'LWL', product_code:'LI-GRP-004', line_of_business:'Life Group',      channel_code:'BANCASS', sum_insured:600_000_000, gross_premium:21_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-006', created_date:'2024-11-10' },
  { policy_id:'POL-LWG-00017', subsidiary_code:'LWG', product_code:'OG-EXP-003', line_of_business:'Oil & Gas',       channel_code:'BROKER', sum_insured:3_500_000_000, gross_premium:175_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-002', created_date:'2024-12-01' },
  { policy_id:'POL-LWG-00018', subsidiary_code:'LWG', product_code:'MRN-003',    line_of_business:'Marine',          channel_code:'BROKER', sum_insured:350_000_000, gross_premium:8_000_000, status:'Active', renewal_flag:true,   broker_id:'BRK-005', created_date:'2024-12-15' },
  { policy_id:'POL-LWL-00012', subsidiary_code:'LWL', product_code:'LI-IND-005', line_of_business:'Life Individual', channel_code:'BROKER', sum_insured:75_000_000, gross_premium:3_600_000, status:'Active', renewal_flag:true,   broker_id:'BRK-008', created_date:'2025-01-05' },
  { policy_id:'POL-LWG-00019', subsidiary_code:'LWG', product_code:'FP-COM-003', line_of_business:'Fire & Property', channel_code:'DIRECT', sum_insured:200_000_000, gross_premium:5_000_000, status:'Active', renewal_flag:true,  broker_id:'BRK-012', created_date:'2025-01-10' },
  { policy_id:'POL-LWH-00006', subsidiary_code:'LWH', product_code:'HMO-IND-003',line_of_business:'Health',          channel_code:'AGENCY', sum_insured:2_000_000, gross_premium:80_000, status:'Active', renewal_flag:false,      broker_id:'BRK-019', created_date:'2025-01-15' },
  { policy_id:'POL-LWL-00013', subsidiary_code:'LWL', product_code:'ANN-004',    line_of_business:'Annuities',       channel_code:'BROKER', sum_insured:350_000_000, gross_premium:28_000_000, status:'Active', renewal_flag:false, broker_id:'BRK-003', created_date:'2025-02-01' },
  { policy_id:'POL-LWG-00020', subsidiary_code:'LWG', product_code:'ENG-CAR-002',line_of_business:'Engineering',     channel_code:'BROKER', sum_insured:900_000_000, gross_premium:27_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-001', created_date:'2025-02-10' },
  { policy_id:'POL-LWL-00014', subsidiary_code:'LWL', product_code:'LI-GRP-005', line_of_business:'Life Group',      channel_code:'DIRECT', sum_insured:2_000_000_000, gross_premium:70_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-004', created_date:'2025-02-15' },
  { policy_id:'POL-LWG-00021', subsidiary_code:'LWG', product_code:'MT-COMP-003',line_of_business:'Motor',           channel_code:'DIRECT', sum_insured:22_000_000, gross_premium:880_000, status:'Active', renewal_flag:true,     broker_id:'BRK-009', created_date:'2025-03-01' },
  { policy_id:'POL-LWH-00007', subsidiary_code:'LWH', product_code:'HMO-GRP-004',line_of_business:'Health',          channel_code:'BROKER', sum_insured:600_000_000, gross_premium:19_200_000, status:'Active', renewal_flag:true, broker_id:'BRK-007', created_date:'2025-03-05' },
  { policy_id:'POL-LWG-00022', subsidiary_code:'LWG', product_code:'OG-EXP-004', line_of_business:'Oil & Gas',       channel_code:'BROKER', sum_insured:4_200_000_000, gross_premium:210_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-002', created_date:'2025-03-10' },
  { policy_id:'POL-LWL-00015', subsidiary_code:'LWL', product_code:'LI-IND-006', line_of_business:'Life Individual', channel_code:'BANCASS', sum_insured:15_000_000, gross_premium:900_000, status:'Active', renewal_flag:true,    broker_id:'BRK-006', created_date:'2025-03-15' },
  { policy_id:'POL-LWG-00023', subsidiary_code:'LWG', product_code:'AVI-003',    line_of_business:'Aviation',        channel_code:'BROKER', sum_insured:10_000_000_000, gross_premium:80_000_000, status:'Active', renewal_flag:true, broker_id:'BRK-001', created_date:'2025-04-01' },
  { policy_id:'POL-LWL-00016', subsidiary_code:'LWL', product_code:'LI-GRP-006', line_of_business:'Life Group',      channel_code:'DIRECT', sum_insured:900_000_000, gross_premium:31_500_000, status:'Active', renewal_flag:true, broker_id:'BRK-005', created_date:'2025-04-05' },
  { policy_id:'POL-LWG-00024', subsidiary_code:'LWG', product_code:'MRN-004',    line_of_business:'Marine',          channel_code:'BROKER', sum_insured:520_000_000, gross_premium:11_700_000, status:'Active', renewal_flag:true, broker_id:'BRK-003', created_date:'2025-04-10' },
  { policy_id:'POL-LWH-00008', subsidiary_code:'LWH', product_code:'HMO-IND-004',line_of_business:'Health',          channel_code:'DIRECT', sum_insured:4_000_000, gross_premium:160_000, status:'Active', renewal_flag:true,      broker_id:'BRK-013', created_date:'2025-04-12' },
  { policy_id:'POL-LWG-00025', subsidiary_code:'LWG', product_code:'FP-COM-004', line_of_business:'Fire & Property', channel_code:'BROKER', sum_insured:750_000_000, gross_premium:18_750_000, status:'Active', renewal_flag:true, broker_id:'BRK-002', created_date:'2025-04-18' },
  { policy_id:'POL-LWL-00017', subsidiary_code:'LWL', product_code:'ANN-005',    line_of_business:'Annuities',       channel_code:'BROKER', sum_insured:600_000_000, gross_premium:48_000_000, status:'Active', renewal_flag:false, broker_id:'BRK-008', created_date:'2025-04-20' },
];
