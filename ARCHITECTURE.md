# CFO Dashboard - Architecture Documentation

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Top navigation bar with search, notifications, user profile
│   ├── Sidebar.tsx     # Left navigation menu with all module links
│   ├── KPICard.tsx     # Reusable KPI card component with drill-down support
│   ├── DrillDownModal.tsx    # Modal for displaying drill-down data
│   └── PeriodFilter.tsx      # Period selection and comparison controls
│
├── sections/           # Main dashboard pages
│   ├── Overview.tsx              # Dashboard home page
│   ├── PerformanceManagement.tsx # Financial performance tracking
│   ├── ProjectManagement.tsx     # Project portfolio management
│   ├── BudgetingForecasting.tsx  # Budget planning and forecasting
│   ├── LiquiditySolvency.tsx     # Liquidity and solvency metrics
│   ├── RiskCompliance.tsx        # Risk and compliance monitoring
│   ├── FinancialReporting.tsx    # Financial statements and analysis
│   ├── ExpenseManagement.tsx     # Operational expense tracking (NEW)
│   ├── TaxManagement.tsx         # Tax compliance and payments (NEW)
│   ├── InvestorRelations.tsx     # Investor-facing metrics (NEW)
│   └── DownloadCenter.tsx        # Document repository
│
├── lib/                # Utilities and services
│   ├── supabase.ts     # Supabase client and TypeScript interfaces
│   └── seedData.ts     # Database seeding functions
│
├── App.tsx             # Main app component with router setup
├── Dashboard.tsx       # Dashboard layout wrapper
├── main.tsx           # Application entry point
└── index.css          # Global styles (Tailwind)
```

## Component Architecture

### Reusable Components

#### KPICard
**Purpose**: Display key performance indicators with optional drill-down
**Props**:
- `title`: Metric name
- `value`: Current value
- `change`: Period-over-period change
- `isPositive`: Whether change is favorable
- `icon`: Lucide icon component
- `iconBgColor`: Background color class
- `iconColor`: Icon color class
- `onClick`: Optional click handler for drill-down

**Usage**:
```tsx
<KPICard
  title="Interest Income"
  value="$856M"
  change="+5.2% from last month"
  isPositive={true}
  icon={DollarSign}
  iconBgColor="bg-blue-100"
  iconColor="text-blue-600"
  onClick={() => handleDrillDown()}
/>
```

#### DrillDownModal
**Purpose**: Display hierarchical data in a modal overlay
**Props**:
- `isOpen`: Modal visibility state
- `onClose`: Close handler
- `title`: Modal title
- `breadcrumb`: Navigation path array
- `data`: Array of drill-down items
- `onDrillDown`: Optional handler for deeper navigation

**Features**:
- Breadcrumb navigation
- Click-through to deeper levels
- Overlay backdrop
- Responsive design

#### PeriodFilter
**Purpose**: Control time period selection and comparison
**Props**:
- `selectedPeriod`: 'quarterly' | 'yearly'
- `onPeriodChange`: Period type change handler
- `selectedYear`: Current year
- `onYearChange`: Year change handler
- `selectedQuarter`: Current quarter (optional)
- `onQuarterChange`: Quarter change handler (optional)
- `showComparison`: Enable comparison toggle
- `comparisonEnabled`: Comparison state
- `onComparisonToggle`: Comparison toggle handler

**Features**:
- Toggle between quarterly/yearly views
- Year and quarter dropdowns
- Optional YoY/QoQ comparison checkbox
- Consistent styling across all pages

### Layout Components

#### Header
**Features**:
- Global search bar
- Notification bell with badge
- Settings icon
- User profile with name and role
- Import Data button
- Logout option
- Last updated timestamp

#### Sidebar
**Features**:
- Bank logo and name
- 11 navigation menu items
- Active state highlighting
- Icon + label for each item
- Consistent color coding
- Responsive collapse (mobile)

### Section Components

Each section follows a consistent pattern:
1. Page title
2. Period filter (where applicable)
3. KPI cards grid
4. Data visualizations (charts, tables)
5. Drill-down modals (where applicable)

## Data Flow

### State Management
```
User Interaction
    ↓
Component State Update
    ↓
Supabase Query (if needed)
    ↓
Data Processing
    ↓
UI Re-render
```

### Drill-Down Flow
```
Click KPI Card
    ↓
Open DrillDownModal
    ↓
Display Level 1 Data
    ↓
Click Item (optional)
    ↓
Update Breadcrumb
    ↓
Display Level 2 Data
```

### Period Filtering Flow
```
Change Period Selection
    ↓
Update Component State
    ↓
Trigger Data Refetch
    ↓
Update All Visualizations
```

## Database Schema

### Table Relationships
```
financial_metrics
├── Indexed by: year, quarter, metric_type
└── Enables: YoY/QoQ comparisons, drill-down by division/product/branch

expenses
├── Indexed by: year, quarter, department
└── Enables: Budget variance, vendor analysis, department drill-down

tax_records
├── Indexed by: year, quarter, status
└── Enables: Compliance tracking, payment history, due date alerts

loan_portfolio
├── Indexed by: year, quarter
└── Enables: Portfolio distribution analysis, trend tracking

investor_reports
├── Indexed by: year, quarter
└── Enables: Document repository, report downloads
```

### Security Model
- Row Level Security (RLS) enabled on all tables
- Policies restrict access to authenticated users
- Select, insert, update policies defined per table
- No public access to financial data

## Styling Architecture

### Tailwind CSS Classes
**Color Palette**:
- Primary: `red-600` (#DF5622)  // mapped to logo color
- Success: `green-600` (#059669)
- Warning: `yellow-600` (#D97706)
- Danger: `red-600` (#DF5622)  // mapped to logo color
- Info: `blue-600` (#2563EB)
- Neutral: `gray-*` shades

**Component Patterns**:
- Cards: `bg-white rounded-xl p-6 shadow-sm border border-gray-200`
- Buttons: `px-4 py-2 rounded-lg transition-colors`
- Tables: `hover:bg-gray-50` for rows
- Modals: `fixed inset-0 bg-black bg-opacity-50`

### Responsive Design
- Mobile: `grid-cols-1`
- Tablet: `md:grid-cols-2`
- Desktop: `lg:grid-cols-3` or `lg:grid-cols-4`
- Large: `xl:grid-cols-6` for KPI grids

## Performance Optimizations

1. **Async Data Loading**: Drill-down data loaded on-demand
2. **Database Indexes**: All frequently queried columns indexed
3. **Lazy Loading**: Charts render only when in viewport
4. **Optimized Queries**: Aggregations performed at database level
5. **Caching**: React state caching for frequently accessed data

## TypeScript Interfaces

### Core Types
```typescript
interface FinancialMetric {
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

interface Expense {
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

interface TaxRecord {
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
```

## Routing Structure

```
/ (root)
├── / → Overview
├── /performance → Performance Management
├── /projects → Project Management
├── /budgeting → Budgeting & Forecasting
├── /liquidity → Liquidity & Solvency
├── /risk → Risk & Compliance
├── /reporting → Financial Reporting
├── /expenses → Expense Management (NEW)
├── /tax → Tax Management (NEW)
├── /investor → Investor Relations (NEW)
└── /downloads → Download Center
```

## Build and Deployment

### Development
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

### Production Build Output
- Optimized assets in `dist/`
- Code splitting for better performance
- Minified CSS and JavaScript
- Gzip compression enabled

## Future Enhancement Opportunities

1. **Real-time Updates**: WebSocket integration for live data
2. **Advanced Analytics**: ML-powered forecasting
3. **Mobile App**: React Native version
4. **API Integration**: Connect to core banking systems
5. **Advanced Drill-downs**: 4+ level hierarchies
6. **Custom Reports**: User-defined report builder
7. **Alerts System**: Email/SMS notifications
8. **Multi-currency**: Support for international operations
