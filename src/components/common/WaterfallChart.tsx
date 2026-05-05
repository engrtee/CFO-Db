import React from 'react';
import {
  ComposedChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface WaterfallItem {
  label: string;
  value: number;
  isTotal?: boolean;
}

interface WaterfallChartProps {
  data: WaterfallItem[];
  height?: number;
  unit?: string;
  divisor?: number;
}

const bn = (v: number, divisor: number, unit: string) =>
  `${unit}${(Math.abs(v) / divisor).toFixed(2)}${divisor >= 1e9 ? 'bn' : 'm'}`;

const CustomTooltip = ({
  active, payload, label, divisor, unit,
}: {
  active?: boolean;
  payload?: { payload: { value: number; start: number; isTotal?: boolean } }[];
  label?: string;
  divisor: number;
  unit: string;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-lw-darkCard2 border border-lw-darkBorder rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-lw-darkText mb-1">{label}</p>
      <p className="font-mono text-lw-gold">{bn(d.value, divisor, unit)}</p>
    </div>
  );
};

export const WaterfallChart: React.FC<WaterfallChartProps> = ({
  data,
  height = 300,
  unit = '₦',
  divisor = 1e9,
}) => {
  let cumulative = 0;
  const chartData = data.map((item) => {
    if (item.isTotal) {
      const start = 0;
      const end = cumulative;
      return { ...item, start, value: end, fill: end >= 0 ? '#00A86B' : '#DC2626' };
    }
    const start = cumulative;
    cumulative += item.value;
    const pos = item.value >= 0;
    return {
      ...item,
      start: pos ? start : start + item.value,
      fill: item.value >= 0 ? '#00A86B' : '#DC2626',
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#7A92B0' }}
          axisLine={false}
          tickLine={false}
          angle={-35}
          textAnchor="end"
          height={55}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#7A92B0' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${unit}${(v / divisor).toFixed(0)}${divisor >= 1e9 ? 'bn' : 'm'}`}
          width={65}
        />
        <Tooltip content={<CustomTooltip divisor={divisor} unit={unit} />} />
        <ReferenceLine y={0} stroke="#7A92B0" strokeDasharray="3 3" />
        {/* Invisible base bar */}
        <Bar dataKey="start" stackId="waterfall" fill="transparent" />
        <Bar dataKey="value" stackId="waterfall" radius={[3, 3, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} fillOpacity={entry.isTotal ? 1 : 0.8} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default WaterfallChart;
