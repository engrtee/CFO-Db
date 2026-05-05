LEADWAY CFO DASHBOARD — SAMPLE DATA FILES
==========================================
These CSV files contain representative sample data for testing upload
functionality. All figures are illustrative and match the dashboard's
expected data schema.

FILES
-----
sample_policies.csv
  Columns: policy_id, policy_number, subsidiary, line_of_business,
           customer_id, broker_id, inception_date, expiry_date,
           sum_insured, annual_premium, status, payment_status, renewal_flag
  Use for: Policy count, premium analysis, renewal tracking

sample_claims.csv
  Columns: claim_id, policy_id, subsidiary, line_of_business,
           date_of_loss, date_notified, date_settled, claim_type,
           claim_amount_gross, salvage, reinsurance_recovery,
           net_claim_cost, reserve_outstanding, status, handler_id,
           siu_flag, fraud_outcome
  Use for: Claims analytics, SIU referrals, settlement cycle KPIs

sample_investment_holdings.csv
  Columns: holding_id, subsidiary, asset_class, instrument_name, issuer,
           isin, face_value, book_value, market_value, coupon_rate,
           yield_to_maturity, maturity_date, duration_years,
           credit_rating, is_prescribed_asset, sector, currency
  Use for: AUM, prescribed asset ratio, maturity ladder, duration gap

sample_brokers.csv
  Columns: broker_id, broker_name, broker_tier, broker_code,
           naicom_licence, gwp_ytd, gwp_prior_year, premium_outstanding,
           debtor_aging_30, debtor_aging_60, debtor_aging_90,
           debtor_aging_90plus, commission_rate_pct,
           relationship_manager, active
  Use for: Broker credit risk, debtor aging, channel performance

sample_income_statement.csv
  Columns: period, subsidiary, line_of_business, account_code,
           account_name, category, amount_ngn, budget_ngn,
           prior_year_ngn
  Use for: P&L, GWP, claims, expense and investment income analysis

sample_cash_positions.csv
  Columns: date, subsidiary, bank_name, account_type, account_number,
           currency, balance_local, balance_ngn, available_balance_ngn,
           restricted_flag, restriction_reason
  Use for: Group cash position, FX exposure, restricted funds monitoring

sample_regulatory_capital.csv
  Columns: snapshot_date, subsidiary, entity_type, total_assets,
           total_liabilities, shareholders_equity, minimum_paid_up_capital,
           actual_paid_up_capital, admissible_assets, inadmissible_assets,
           net_admissible_assets, technical_reserves, free_reserves,
           solvency_margin_required, solvency_margin_available,
           solvency_ratio_pct, prescribed_asset_value,
           prescribed_asset_requirement_pct, prescribed_asset_ratio_pct,
           rag_status, capital_headroom, roe_pct
  Use for: NAICOM solvency compliance, capital adequacy, ROE tracking

sample_reinsurance_treaties.csv
  Columns: treaty_id, reinsurer_name, reinsurer_rating, treaty_type,
           line_of_business, treaty_year, premium_ceded_ngn,
           retention_pct, cession_pct, commission_income_ngn,
           recoveries_outstanding_ngn, counterparty_exposure_ngn,
           treaty_limit_ngn, reinstatement_used, status, domicile
  Use for: Credit risk, reinsurer counterparty concentration

sample_budget_vs_actual.csv
  Columns: period, subsidiary, line_of_business, metric, budget_ngn,
           actual_ngn, prior_year_ngn, variance_ngn, variance_pct
  Metrics: gwp, net_earned_premium, net_claims, operating_expenses,
           investment_income, profit_after_tax
  Use for: Budget variance analysis, YTD performance, P&L waterfall

NOTES
-----
- All NGN amounts are in full Naira (not millions or billions)
- Subsidiary codes: LWL=Life, LWG=General, LWH=Health,
  LWC=Capital, LWT=Hotels, LWP=Properties, LWN=Pensure
- Exchange rate assumption: 1 USD = 1,555 NGN (April 2025)
- NAICOM minimum capital: Life ₦8bn, General ₦3bn, Health ₦1bn
- Prescribed asset ratio requirement: Life 40%, General 30%, Health 30%
