import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPITooltipData {
  mtd?: string;
  ytd?: string;
  yoy?: string;
}

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean;
  isNeutral?: boolean;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  onClick?: () => void;
  subtitle?: string;
  tooltip?: KPITooltipData;
  colorScheme?: 'green' | 'red' | 'orange' | 'blue' | 'yellow' | 'default';
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  isNeutral = false,
  icon: Icon,
  iconBgColor,
  iconColor,
  onClick,
  subtitle,
  tooltip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const trendIcon = isNeutral
    ? <Minus className="w-3 h-3" />
    : isPositive
      ? <TrendingUp className="w-3 h-3" />
      : <TrendingDown className="w-3 h-3" />;

  const trendColor = isNeutral
    ? 'text-gray-500 bg-gray-50'
    : isPositive
      ? 'text-emerald-700 bg-emerald-50'
      : 'text-red-700 bg-red-50';

  return (
    <div
      className={`relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => tooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div className="absolute z-50 top-full mt-2 left-0 w-56 bg-gray-900 text-white rounded-xl p-3 shadow-xl text-xs">
          <div className="font-semibold text-gray-300 mb-2 uppercase tracking-wide">Comparison</div>
          {tooltip.mtd && (
            <div className="flex justify-between mb-1">
              <span className="text-gray-400">MTD</span>
              <span className="font-medium">{tooltip.mtd}</span>
            </div>
          )}
          {tooltip.ytd && (
            <div className="flex justify-between mb-1">
              <span className="text-gray-400">YTD</span>
              <span className="font-medium">{tooltip.ytd}</span>
            </div>
          )}
          {tooltip.yoy && (
            <div className="flex justify-between">
              <span className="text-gray-400">YoY</span>
              <span className="font-medium">{tooltip.yoy}</span>
            </div>
          )}
          <div className="absolute -top-1.5 left-4 w-3 h-3 bg-gray-900 rotate-45"></div>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight pr-2">{title}</p>
        <div className={`${iconBgColor} rounded-xl p-2.5 flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-1 leading-none">{value}</h3>

      {subtitle && (
        <p className="text-xs text-gray-400 mb-2">{subtitle}</p>
      )}

      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trendColor}`}>
        {trendIcon}
        <span>{change}</span>
      </div>

      {tooltip && (
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60" title="Hover for MTD/YTD/YoY" />
      )}
    </div>
  );
};

export default KPICard;
