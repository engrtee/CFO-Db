import { supabase } from './supabase';

export async function seedFinancialMetrics() {
  const currentYear = 2025;
  const quarters = [1, 2, 3, 4];
  const divisions = ['Retail Banking', 'Corporate Banking', 'Investment Banking', 'Treasury'];
  const products = ['Savings', 'Loans', 'Investments', 'Cards'];
  const branches = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano'];
  const metricTypes = [
    'interest_income',
    'net_interest_income',
    'operating_profit',
    'total_assets',
    'total_equity',
    'deposits',
  ];

  const metrics = [];

  for (let year = 2023; year <= currentYear; year++) {
    for (const quarter of quarters) {
      for (const division of divisions) {
        for (const metricType of metricTypes) {
          const baseAmount = Math.random() * 500000000 + 100000000;
          metrics.push({
            year,
            quarter,
            division,
            product: products[Math.floor(Math.random() * products.length)],
            branch: branches[Math.floor(Math.random() * branches.length)],
            metric_type: metricType,
            amount: baseAmount,
          });
        }
      }
    }
  }

  const { error } = await supabase.from('financial_metrics').insert(metrics);
  if (error) console.error('Error seeding financial metrics:', error);
  else console.log('Financial metrics seeded successfully');
}

export async function seedExpenses() {
  const currentYear = 2025;
  const quarters = [1, 2, 3];
  const departments = ['Technology', 'Operations', 'Marketing', 'Human Resources', 'Facilities', 'Compliance'];
  const categories = ['Personnel', 'Software', 'Hardware', 'Services', 'Marketing', 'Utilities'];
  const vendors = ['Microsoft', 'AWS', 'Oracle', 'IBM', 'Facilities Management Ltd', 'Security Services Inc'];

  const expenses = [];

  for (let year = 2024; year <= currentYear; year++) {
    for (const quarter of quarters) {
      for (const department of departments) {
        const budgetAmount = Math.random() * 50000000 + 10000000;
        const actualAmount = budgetAmount * (0.7 + Math.random() * 0.5);
        expenses.push({
          year,
          quarter,
          department,
          cost_center: `${department}-CC${Math.floor(Math.random() * 100)}`,
          vendor: vendors[Math.floor(Math.random() * vendors.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          amount: actualAmount,
          budget_amount: budgetAmount,
          description: `${category} expenses for ${department}`,
        });
      }
    }
  }

  const { error } = await supabase.from('expenses').insert(expenses);
  if (error) console.error('Error seeding expenses:', error);
  else console.log('Expenses seeded successfully');
}

export async function seedTaxRecords() {
  const currentYear = 2025;
  const quarters = [1, 2, 3];
  const entities = ['GTBank PLC', 'Subsidiary A', 'Subsidiary B'];
  const taxTypes = ['Corporate Income Tax', 'VAT', 'Withholding Tax', 'Property Tax'];

  const taxRecords = [];

  for (let year = 2024; year <= currentYear; year++) {
    for (const quarter of quarters) {
      for (const entity of entities) {
        for (const taxType of taxTypes) {
          const liability = Math.random() * 20000000 + 5000000;
          const isPaid = year < currentYear || quarter < 3;
          taxRecords.push({
            year,
            quarter,
            entity,
            tax_type: taxType,
            liability_amount: liability,
            paid_amount: isPaid ? liability : 0,
            due_date: new Date(year, quarter * 3, 15).toISOString().split('T')[0],
            status: isPaid ? 'paid' : 'pending',
          });
        }
      }
    }
  }

  const { error } = await supabase.from('tax_records').insert(taxRecords);
  if (error) console.error('Error seeding tax records:', error);
  else console.log('Tax records seeded successfully');
}

export async function seedLoanPortfolio() {
  const currentYear = 2025;
  const quarters = [1, 2, 3];
  const loanTypes = ['Retail Loans', 'Corporate Loans', 'Mortgages', 'SME Loans'];

  const portfolios = [];

  for (let year = 2024; year <= currentYear; year++) {
    for (const quarter of quarters) {
      for (const loanType of loanTypes) {
        const amount = Math.random() * 15000000000 + 5000000000;
        const count = Math.floor(Math.random() * 5000 + 1000);
        portfolios.push({
          year,
          quarter,
          loan_type: loanType,
          amount,
          count,
        });
      }
    }
  }

  const { error } = await supabase.from('loan_portfolio').insert(portfolios);
  if (error) console.error('Error seeding loan portfolio:', error);
  else console.log('Loan portfolio seeded successfully');
}

export async function seedAllData() {
  console.log('Starting data seeding...');
  await seedFinancialMetrics();
  await seedExpenses();
  await seedTaxRecords();
  await seedLoanPortfolio();
  console.log('Data seeding completed!');
}
