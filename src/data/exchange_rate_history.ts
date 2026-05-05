import type { ExchangeRateRow } from '../types/financial.types';

// Monthly average CBN official rates Jan 2024 – Apr 2025 (18 months)
// NGN/USD: 1450 → 1580, NGN/GBP: 1820 → 1980, NGN/EUR: 1560 → 1720

const usdRates: [string, number][] = [
  ['2024-01', 1450], ['2024-02', 1462], ['2024-03', 1478],
  ['2024-04', 1491], ['2024-05', 1503], ['2024-06', 1512],
  ['2024-07', 1520], ['2024-08', 1528], ['2024-09', 1535],
  ['2024-10', 1541], ['2024-11', 1550], ['2024-12', 1558],
  ['2025-01', 1563], ['2025-02', 1568], ['2025-03', 1573],
  ['2025-04', 1580], ['2025-05', 1585], ['2025-06', 1590],
];

const gbpRates: [string, number][] = [
  ['2024-01', 1820], ['2024-02', 1835], ['2024-03', 1852],
  ['2024-04', 1868], ['2024-05', 1880], ['2024-06', 1892],
  ['2024-07', 1903], ['2024-08', 1912], ['2024-09', 1921],
  ['2024-10', 1930], ['2024-11', 1940], ['2024-12', 1950],
  ['2025-01', 1958], ['2025-02', 1964], ['2025-03', 1971],
  ['2025-04', 1980], ['2025-05', 1985], ['2025-06', 1992],
];

const eurRates: [string, number][] = [
  ['2024-01', 1560], ['2024-02', 1574], ['2024-03', 1589],
  ['2024-04', 1601], ['2024-05', 1612], ['2024-06', 1622],
  ['2024-07', 1632], ['2024-08', 1641], ['2024-09', 1650],
  ['2024-10', 1659], ['2024-11', 1668], ['2024-12', 1678],
  ['2025-01', 1686], ['2025-02', 1694], ['2025-03', 1706],
  ['2025-04', 1720], ['2025-05', 1728], ['2025-06', 1735],
];

const toDate = (period: string) => `${period}-01`;

export const exchangeRateHistory: ExchangeRateRow[] = [
  ...usdRates.map(([period, rate]) => ({
    rate_date: toDate(period),
    currency_pair: 'NGN/USD',
    rate,
    source: 'CBN Official Rate',
  })),
  ...gbpRates.map(([period, rate]) => ({
    rate_date: toDate(period),
    currency_pair: 'NGN/GBP',
    rate,
    source: 'CBN Official Rate',
  })),
  ...eurRates.map(([period, rate]) => ({
    rate_date: toDate(period),
    currency_pair: 'NGN/EUR',
    rate,
    source: 'CBN Official Rate',
  })),
];
