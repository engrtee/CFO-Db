import type { CustomerMasterRow } from '../types/regulatory.types';
import type { SubsidiaryCode } from '../types/subsidiary.types';

const mk = (
  id: string, name: string, sector: string,
  gwp: number, policies: number,
  sub: SubsidiaryCode,
  status: CustomerMasterRow['renewal_status']
): CustomerMasterRow => ({
  customer_id: id, customer_name: name, sector,
  total_gwp_ytd: gwp, policy_count: policies,
  primary_subsidiary: sub, renewal_status: status,
});

export const customerMaster: CustomerMasterRow[] = [
  // ── Oil & Gas (10) ────────────────────────────────────────────────────────
  mk('CUS-001','Nigerian National Petroleum Company Limited','Oil & Gas',2_850_000_000,28,'LWG','Active'),
  mk('CUS-002','Shell Petroleum Development Company','Oil & Gas',2_100_000_000,22,'LWG','Active'),
  mk('CUS-003','TotalEnergies E&P Nigeria Limited','Oil & Gas',1_650_000_000,18,'LWG','Renewed'),
  mk('CUS-004','Seplat Energy Plc','Oil & Gas',980_000_000,12,'LWG','Active'),
  mk('CUS-005','Oando Plc','Oil & Gas',720_000_000,10,'LWG','Active'),
  mk('CUS-006','Aiteo Eastern E&P Company','Oil & Gas',560_000_000,8,'LWG','Active'),
  mk('CUS-007','Shoreline Natural Resources','Oil & Gas',420_000_000,7,'LWG','Renewed'),
  mk('CUS-008','First E&P Nigeria','Oil & Gas',320_000_000,6,'LWG','Under Review'),
  mk('CUS-009','Pillar Oil Limited','Oil & Gas',180_000_000,4,'LWG','Active'),
  mk('CUS-010','Niger Delta Exploration','Oil & Gas',95_000_000,3,'LWG','Lapsed'),

  // ── Manufacturing (8) ─────────────────────────────────────────────────────
  mk('CUS-011','Dangote Industries Limited','Manufacturing',1_480_000_000,35,'LWL','Active'),
  mk('CUS-012','BUA Group','Manufacturing',980_000_000,22,'LWG','Active'),
  mk('CUS-013','Nigerian Breweries Plc','Manufacturing',650_000_000,14,'LWG','Renewed'),
  mk('CUS-014','Nestle Nigeria Plc','Manufacturing',480_000_000,11,'LWL','Active'),
  mk('CUS-015','Flour Mills of Nigeria Plc','Manufacturing',380_000_000,9,'LWG','Active'),
  mk('CUS-016','Cadbury Nigeria Plc','Manufacturing',210_000_000,7,'LWL','Renewed'),
  mk('CUS-017','Unilever Nigeria Plc','Manufacturing',165_000_000,6,'LWL','Active'),
  mk('CUS-018','PZ Cussons Nigeria','Manufacturing',120_000_000,5,'LWL','Under Review'),

  // ── Banking & Finance (7) ─────────────────────────────────────────────────
  mk('CUS-019','Access Holdings Plc','Banking',920_000_000,18,'LWL','Active'),
  mk('CUS-020','Zenith Bank Plc','Banking',850_000_000,16,'LWL','Active'),
  mk('CUS-021','Guaranty Trust Holding Company','Banking',780_000_000,15,'LWL','Renewed'),
  mk('CUS-022','United Bank for Africa Plc','Banking',620_000_000,13,'LWL','Active'),
  mk('CUS-023','First Bank of Nigeria Holdings','Banking',540_000_000,12,'LWL','Active'),
  mk('CUS-024','Stanbic IBTC Holdings Plc','Banking',350_000_000,8,'LWL','Renewed'),
  mk('CUS-025','Fidelity Bank Plc','Banking',220_000_000,6,'LWL','Active'),

  // ── Telecoms (5) ──────────────────────────────────────────────────────────
  mk('CUS-026','MTN Nigeria Communications Plc','Telecoms',1_150_000_000,20,'LWG','Active'),
  mk('CUS-027','Airtel Africa Plc','Telecoms',820_000_000,15,'LWG','Active'),
  mk('CUS-028','Glo Mobile Nigeria','Telecoms',580_000_000,11,'LWG','Renewed'),
  mk('CUS-029','9mobile (Emerging Markets Telecom Services)','Telecoms',320_000_000,8,'LWG','Under Review'),
  mk('CUS-030','IHS Nigeria Limited','Telecoms',210_000_000,6,'LWG','Active'),

  // ── Government (8) ────────────────────────────────────────────────────────
  mk('CUS-031','Lagos State Government','Government',1_350_000_000,45,'LWL','Active'),
  mk('CUS-032','Rivers State Government','Government',920_000_000,32,'LWL','Renewed'),
  mk('CUS-033','Federal Capital Territory Authority','Government',680_000_000,28,'LWL','Active'),
  mk('CUS-034','Ogun State Government','Government',480_000_000,22,'LWG','Active'),
  mk('CUS-035','Kano State Government','Government',380_000_000,18,'LWL','Active'),
  mk('CUS-036','Edo State Government','Government',280_000_000,14,'LWL','Renewed'),
  mk('CUS-037','Delta State Government','Government',220_000_000,12,'LWG','Active'),
  mk('CUS-038','Anambra State Government','Government',165_000_000,10,'LWL','Under Review'),

  // ── FMCG (7) ──────────────────────────────────────────────────────────────
  mk('CUS-039','Procter & Gamble Nigeria','FMCG',320_000_000,8,'LWL','Active'),
  mk('CUS-040','Guinness Nigeria Plc','FMCG',280_000_000,7,'LWG','Renewed'),
  mk('CUS-041','UAC of Nigeria Plc','FMCG',210_000_000,6,'LWL','Active'),
  mk('CUS-042','Julius Berger Nigeria Plc','FMCG',185_000_000,5,'LWG','Active'),
  mk('CUS-043','Honeywell Flour Mills','FMCG',145_000_000,5,'LWL','Active'),
  mk('CUS-044','Vitafoam Nigeria Plc','FMCG',95_000_000,4,'LWL','Lapsed'),
  mk('CUS-045','DN Tyre & Rubber Plc','FMCG',65_000_000,3,'LWL','Under Review'),

  // ── Other (5) ─────────────────────────────────────────────────────────────
  mk('CUS-046','Nigerian Aviation Handling Company','Other',850_000_000,12,'LWG','Active'),
  mk('CUS-047','Transcorp Plc','Other',520_000_000,10,'LWL','Renewed'),
  mk('CUS-048','Costain West Africa Plc','Other',180_000_000,5,'LWG','Active'),
  mk('CUS-049','Chams Plc','Other',55_000_000,3,'LWL','Lapsed'),
  mk('CUS-050','E-Tranzact International','Other',28_000_000,2,'LWL','Lapsed'),
];
