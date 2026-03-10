import React, { useCallback, useState } from 'react';
import { useData, DatasetKey } from '../lib/dataContext';
import {
  Upload, FileSpreadsheet, CheckCircle, Trash2, Download, AlertCircle, X
} from 'lucide-react';

interface DatasetSpec {
  key: DatasetKey;
  label: string;
  description: string;
  requiredColumns: string[];
  sampleFile: string;
}

const DATASET_SPECS: DatasetSpec[] = [
  {
    key: 'kpis',
    label: 'Overview KPIs',
    description: 'Top-level financial KPIs shown on the Executive Overview page',
    requiredColumns: ['metric', 'value', 'change', 'is_positive', 'subtitle', 'mtd', 'ytd', 'yoy'],
    sampleFile: 'kpis.csv',
  },
  {
    key: 'revenue_trend',
    label: 'Revenue Trend',
    description: 'Monthly revenue and EBITDA for the trend chart',
    requiredColumns: ['month', 'revenue', 'ebitda'],
    sampleFile: 'revenue_trend.csv',
  },
  {
    key: 'actuals_budget',
    label: 'Actuals vs Budget',
    description: 'Revenue, Opex, EBITDA and Net Profit actual vs budget comparison',
    requiredColumns: ['metric', 'actual', 'budget', 'sply'],
    sampleFile: 'actuals_budget.csv',
  },
  {
    key: 'opex_variance',
    label: 'Opex Variance',
    description: 'Top Opex categories and their budget variance',
    requiredColumns: ['category', 'variance', 'overspend'],
    sampleFile: 'opex_variance.csv',
  },
  {
    key: 'cocoa_prices',
    label: 'Cocoa Prices',
    description: 'Global spot vs company negotiated cocoa price by month',
    requiredColumns: ['month', 'global', 'company'],
    sampleFile: 'cocoa_prices.csv',
  },
  {
    key: 'offtakers',
    label: 'Top Offtakers',
    description: 'Offtaker performance ranked by volume and revenue',
    requiredColumns: ['name', 'volume', 'revenue'],
    sampleFile: 'offtakers.csv',
  },
  {
    key: 'export_volume',
    label: 'Export Volume (MoM)',
    description: 'Month-on-month export volume in metric tonnes',
    requiredColumns: ['month', 'volume'],
    sampleFile: 'export_volume.csv',
  },
  {
    key: 'shipments',
    label: 'Shipment Dispatch',
    description: 'Dispatched vs delayed shipments per month',
    requiredColumns: ['month', 'dispatched', 'delayed'],
    sampleFile: 'shipments.csv',
  },
  {
    key: 'cashflow',
    label: 'Cashflow Statement',
    description: 'Cashflow waterfall items (opening, operating, investing, financing, closing)',
    requiredColumns: ['name', 'value', 'base', 'color', 'is_total'],
    sampleFile: 'cashflow.csv',
  },
  {
    key: 'ar_ageing',
    label: 'AR Ageing',
    description: 'Accounts receivable ageing buckets',
    requiredColumns: ['bucket', 'amount'],
    sampleFile: 'ar_ageing.csv',
  },
  {
    key: 'ap_ageing',
    label: 'AP Ageing',
    description: 'Accounts payable ageing buckets',
    requiredColumns: ['bucket', 'amount'],
    sampleFile: 'ap_ageing.csv',
  },
  {
    key: 'inventory',
    label: 'Inventory by Category',
    description: 'Inventory stock, demand, and value by product category',
    requiredColumns: ['category', 'stock', 'demand', 'value'],
    sampleFile: 'inventory.csv',
  },
  {
    key: 'fx_gainloss',
    label: 'FX Gain/Loss',
    description: 'Realized and unrealized FX gain/loss by month',
    requiredColumns: ['month', 'realized', 'unrealized'],
    sampleFile: 'fx_gainloss.csv',
  },
  {
    key: 'fx_exposure',
    label: 'FX Exposure',
    description: 'Open USD exposure breakdown by invoice ageing',
    requiredColumns: ['name', 'value', 'color'],
    sampleFile: 'fx_exposure.csv',
  },
  {
    key: 'forecasts_cf',
    label: 'Cashflow Forecast',
    description: 'Forward cashflow projection with base/high/low scenarios',
    requiredColumns: ['month', 'base', 'high', 'low'],
    sampleFile: 'forecasts_cf.csv',
  },
  {
    key: 'forecasts_price',
    label: 'Cocoa Price Forecast',
    description: 'Forward cocoa price projection ($/MT)',
    requiredColumns: ['month', 'base', 'high', 'low'],
    sampleFile: 'forecasts_price.csv',
  },
  {
    key: 'forecasts_fx',
    label: 'FX Rate Forecast',
    description: 'Forward USD/NGN exchange rate projection',
    requiredColumns: ['month', 'base', 'high', 'low'],
    sampleFile: 'forecasts_fx.csv',
  },
];

const DataUpload: React.FC = () => {
  const { uploads, loadCSV, removeDataset } = useData();
  const [dragOver, setDragOver] = useState<DatasetKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<DatasetKey | null>(null);

  const handleFile = useCallback(
    async (key: DatasetKey, file: File) => {
      if (!file.name.endsWith('.csv')) {
        setError(`"${file.name}" is not a CSV file`);
        return;
      }
      const text = await file.text();
      loadCSV(key, file.name, text);
      setSuccessKey(key);
      setTimeout(() => setSuccessKey(null), 2500);
    },
    [loadCSV]
  );

  const onInputChange = useCallback(
    (key: DatasetKey, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(key, file);
      e.target.value = '';
    },
    [handleFile]
  );

  const uploadedCount = Object.keys(uploads).length;

  // Group datasets by category
  const groups: { label: string; keys: DatasetKey[] }[] = [
    { label: 'Overview', keys: ['kpis', 'revenue_trend'] },
    { label: 'Performance', keys: ['actuals_budget', 'opex_variance', 'cocoa_prices', 'offtakers'] },
    { label: 'Export Operations', keys: ['export_volume', 'shipments'] },
    { label: 'Cashflow & Liquidity', keys: ['cashflow', 'ar_ageing', 'ap_ageing'] },
    { label: 'Forecasting', keys: ['forecasts_cf', 'forecasts_price', 'forecasts_fx'] },
    { label: 'Risk Exposure', keys: ['fx_gainloss', 'fx_exposure'] },
    { label: 'Inventory', keys: ['inventory'] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Upload</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload CSV files to populate dashboard charts and KPIs. Data stays in your browser — nothing is sent to a server.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{uploadedCount}<span className="text-gray-400 text-base font-normal">/{DATASET_SPECS.length}</span></div>
            <div className="text-xs text-gray-400">datasets loaded</div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-gray-100 flex items-center justify-center relative">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#f3f4f6" strokeWidth="4" />
              <circle
                cx="22" cy="22" r="18" fill="none" stroke="#b45309" strokeWidth="4"
                strokeDasharray={`${(uploadedCount / DATASET_SPECS.length) * 113} 113`}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs font-bold text-amber-700 z-10">{Math.round((uploadedCount / DATASET_SPECS.length) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Sample files banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-amber-900 mb-1">Download Sample CSV Files</h3>
            <p className="text-xs text-amber-700 mb-3">
              Sample CSV files are included in <code className="bg-amber-100 px-1 rounded">public/sample-data/</code>. 
              Download and customize with your actual data, then upload below.
            </p>
            <div className="flex flex-wrap gap-2">
              {DATASET_SPECS.map((spec) => (
                <a
                  key={spec.key}
                  href={`/sample-data/${spec.sampleFile}`}
                  download
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  {spec.sampleFile}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700 flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dataset groups */}
      {groups.map((group) => (
        <div key={group.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            {group.label}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.keys.map((key) => {
              const spec = DATASET_SPECS.find((s) => s.key === key)!;
              const uploaded = uploads[key];
              const isDragTarget = dragOver === key;
              const isSuccess = successKey === key;

              return (
                <label
                  key={key}
                  className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isDragTarget
                      ? 'border-amber-500 bg-amber-50'
                      : uploaded
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50/30'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(key); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(null);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFile(key, file);
                  }}
                >
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => onInputChange(key, e)}
                  />

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    uploaded ? 'bg-emerald-200' : 'bg-gray-200'
                  }`}>
                    {isSuccess ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 animate-bounce" />
                    ) : uploaded ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-800">{spec.label}</span>
                      {uploaded ? (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); removeDataset(key); }}
                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          title="Remove dataset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <a
                          href={`/sample-data/${spec.sampleFile}`}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-amber-600 hover:underline flex-shrink-0 flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Sample
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 mb-2">{spec.description}</p>

                    {uploaded ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          ✓ {uploaded.filename}
                        </span>
                        <span className="text-xs text-gray-400">{uploaded.rowCount} rows · {uploaded.uploadedAt}</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {spec.requiredColumns.slice(0, 4).map((col) => (
                          <code key={col} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">{col}</code>
                        ))}
                        {spec.requiredColumns.length > 4 && (
                          <span className="text-xs text-gray-400">+{spec.requiredColumns.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bulk upload hint */}
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 text-center">
        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-500">Drag and drop any CSV onto its card above</p>
        <p className="text-xs text-gray-400 mt-1">Or click any card to browse your files. CSV format must match the column headers shown.</p>
      </div>
    </div>
  );
};

export default DataUpload;
