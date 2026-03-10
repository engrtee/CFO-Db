import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FinancialMetric {
  id: string;
  year: number;
  quarter: number;
  division?: string;
  product?: string;
  branch?: string;
  metric_type: string;
  amount: number;
  created_at: string;
}

export interface Expense {
  id: string;
  year: number;
  quarter: number;
  department: string;
  cost_center?: string;
  vendor?: string;
  category: string;
  amount: number;
  budget_amount: number;
  description?: string;
  created_at: string;
}

export interface TaxRecord {
  id: string;
  year: number;
  quarter: number;
  entity: string;
  tax_type: string;
  liability_amount: number;
  paid_amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
}

export interface LoanPortfolio {
  id: string;
  year: number;
  quarter: number;
  loan_type: string;
  amount: number;
  count: number;
  created_at: string;
}
