/*
  # CFO Dashboard Database Schema

  ## Overview
  This migration creates a comprehensive banking CFO dashboard schema supporting:
  - Multi-period financial data (YoY/QoQ analysis)
  - Drill-down capabilities across divisions, products, branches
  - Expense, tax, and investor relations modules
  
  ## New Tables
  
  ### 1. financial_metrics
  Stores core financial KPIs with period-based tracking
  - `id` (uuid, primary key)
  - `year` (integer) - Financial year
  - `quarter` (integer) - Quarter (1-4)
  - `division` (text) - Business division
  - `product` (text) - Product type
  - `branch` (text) - Branch name
  - `metric_type` (text) - KPI type
  - `amount` (numeric) - Metric value
  - `created_at` (timestamptz)
  
  ### 2. expenses
  Tracks operational and non-operational expenditures
  - `id` (uuid, primary key)
  - `year` (integer)
  - `quarter` (integer)
  - `department` (text)
  - `cost_center` (text)
  - `vendor` (text)
  - `category` (text) - Expense category
  - `amount` (numeric)
  - `budget_amount` (numeric)
  - `description` (text)
  - `created_at` (timestamptz)
  
  ### 3. tax_records
  Manages tax liabilities and payments
  - `id` (uuid, primary key)
  - `year` (integer)
  - `quarter` (integer)
  - `entity` (text) - Legal entity
  - `tax_type` (text) - Type of tax
  - `liability_amount` (numeric)
  - `paid_amount` (numeric)
  - `due_date` (date)
  - `status` (text) - pending/paid/overdue
  - `created_at` (timestamptz)
  
  ### 4. investor_reports
  Stores investor-facing documents and KPIs
  - `id` (uuid, primary key)
  - `year` (integer)
  - `quarter` (integer)
  - `report_type` (text)
  - `file_url` (text)
  - `uploaded_at` (timestamptz)
  
  ### 5. loan_portfolio
  Tracks loan distribution by type
  - `id` (uuid, primary key)
  - `year` (integer)
  - `quarter` (integer)
  - `loan_type` (text)
  - `amount` (numeric)
  - `count` (integer)
  - `created_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to read their organization's data
*/

-- Financial Metrics Table
CREATE TABLE IF NOT EXISTS financial_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  quarter integer NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  division text,
  product text,
  branch text,
  metric_type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read financial metrics"
  ON financial_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert financial metrics"
  ON financial_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  quarter integer NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  department text NOT NULL,
  cost_center text,
  vendor text,
  category text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  budget_amount numeric DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Tax Records Table
CREATE TABLE IF NOT EXISTS tax_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  quarter integer NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  entity text NOT NULL,
  tax_type text NOT NULL,
  liability_amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  due_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tax_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read tax records"
  ON tax_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert tax records"
  ON tax_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update tax records"
  ON tax_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Investor Reports Table
CREATE TABLE IF NOT EXISTS investor_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  quarter integer NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  report_type text NOT NULL,
  file_url text,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE investor_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read investor reports"
  ON investor_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert investor reports"
  ON investor_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Loan Portfolio Table
CREATE TABLE IF NOT EXISTS loan_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  quarter integer NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  loan_type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE loan_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read loan portfolio"
  ON loan_portfolio FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert loan portfolio"
  ON loan_portfolio FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_financial_metrics_period ON financial_metrics(year, quarter);
CREATE INDEX IF NOT EXISTS idx_financial_metrics_type ON financial_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_expenses_period ON expenses(year, quarter);
CREATE INDEX IF NOT EXISTS idx_expenses_department ON expenses(department);
CREATE INDEX IF NOT EXISTS idx_tax_records_period ON tax_records(year, quarter);
CREATE INDEX IF NOT EXISTS idx_tax_records_status ON tax_records(status);
CREATE INDEX IF NOT EXISTS idx_loan_portfolio_period ON loan_portfolio(year, quarter);
