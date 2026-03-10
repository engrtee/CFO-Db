# GTBank CFO Dashboard

A comprehensive banking CFO dashboard built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Core Modules

1. **Overview Dashboard**
   - Key performance indicators with drill-down capabilities
   - Performance trends visualization
   - Loan portfolio distribution
   - Quick action buttons

2. **Performance Management**
   - Net Interest Income, Operating Profit, Cost-to-Income Ratio, ROE tracking
   - Revenue breakdown by division
   - YoY and QoQ comparison capabilities

3. **Project Management**
   - Active project tracking
   - Budget vs actual monitoring
   - Progress visualization
   - Team assignment tracking

4. **Budgeting & Forecasting**
   - Budget vs actual analysis by category
   - Budget allocation visualization
   - Forecast vs target metrics
   - Variance tracking

5. **Liquidity & Solvency**
   - Liquidity Coverage Ratio monitoring
   - Capital Adequacy Ratio tracking
   - Liquid assets breakdown
   - Solvency metrics dashboard

6. **Risk & Compliance**
   - NPL ratio tracking
   - Risk distribution by category
   - Compliance status monitoring
   - Recent risk events log

7. **Financial Reporting & Analysis**
   - Income statement summary
   - Balance sheet overview
   - Key financial ratios
   - Cash flow statement

8. **Expense Management** (New)
   - Department-wise expense tracking
   - Vendor spend analysis
   - Budget threshold alerts
   - QoQ expense trends

9. **Tax Management** (New)
   - Tax liability tracking
   - Compliance calendar with due dates
   - Tax payment history
   - Effective tax rate monitoring

10. **Investor Relations** (New)
    - Key investor metrics (NIM, ROE, ROA, EPS, CAR)
    - Performance ratios vs industry benchmarks
    - Investor reports repository
    - Shareholder information
    - Investor mode for simplified board presentations

11. **Download Center**
    - Centralized document repository
    - Category-based filtering
    - Quick export options for reports

## Key Features

### Drill-Down Capabilities
- Click on any KPI card or chart to view detailed breakdowns
- Breadcrumb navigation for easy tracking
- Multi-level data exploration (Overview → Division → Product → Branch)

### YoY and QoQ Analysis
- Toggle between quarterly and yearly views
- Enable comparison mode to see period-over-period changes
- Visual indicators for positive/negative trends

### Period Filtering
- Select specific years and quarters
- Dynamic data updates based on selected periods
- Comparison mode for trend analysis

## Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router v6
- **Build Tool**: Vite

## Database Schema

### Tables

1. **financial_metrics** - Core financial KPIs with period tracking
2. **expenses** - Operational expenditure tracking
3. **tax_records** - Tax liability and payment management
4. **investor_reports** - Investor document repository
5. **loan_portfolio** - Loan distribution tracking

All tables include Row Level Security (RLS) policies for secure data access.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Data Seeding

To populate the database with sample data:

```typescript
import { seedAllData } from './src/lib/seedData';
await seedAllData();
```

## Navigation

- **Overview** - Dashboard home with key metrics
- **Performance Management** - Financial performance tracking
- **Project Management** - Project portfolio management
- **Budgeting & Forecasting** - Budget planning and analysis
- **Liquidity & Solvency** - Liquidity and capital metrics
- **Risk & Compliance** - Risk monitoring and compliance tracking
- **Financial Reporting & Analysis** - Complete financial statements
- **Expense Management** - Operational expense tracking
- **Tax Management** - Tax compliance and payments
- **Investor Relations** - Investor-facing metrics and reports
- **Download Center** - Document repository and exports

## Color Theme

The dashboard uses a professional banking color scheme:
- Primary: Red (#DF5622) // updated to match logo
- Accent colors: Blue, Green, Yellow, Cyan, Purple
- Neutral: Gray scale for backgrounds and text

## Security

- Row Level Security (RLS) enabled on all tables
- Authenticated user access only
- Data encryption at rest and in transit
- Secure API endpoints

## Performance

- Optimized queries with database indexes
- Async data loading for drill-downs
- Efficient caching strategies
- Responsive design for all screen sizes
