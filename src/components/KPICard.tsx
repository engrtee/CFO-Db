import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { RAGStatus } from '../types/subsidiary.types';

interface KPICardProps {
  title: string;
  value: number;
  formatter?: (v: number) => string;
  change?: number;
  changeLabel?: string;
  isPositiveGood?: boolean;
  icon?: React.ElementType;
  ragStatus?: RAGStatus;
  subtitle?: string;
  className?: string;
}

function useCountUp(target: number, duration = 800) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(target * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

const RAG_RING: Record<RAGStatus, string> = {
  Green: 'border-lw-green',
  Amber: 'border-lw-amber',
  Red:   'border-lw-danger',
};

const RAG_TEXT: Record<RAGStatus, string> = {
  Green: 'text-lw-green',
  Amber: 'text-lw-amber',
  Red:   'text-lw-danger',
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  formatter = (v) => v.toLocaleString('en-NG', { maximumFractionDigits: 1 }),
  change,
  changeLabel = 'vs budget',
  isPositiveGood = true,
  icon: Icon,
  ragStatus,
  subtitle,
  className = '',
}) => {
  const animated = useCountUp(value);

  const changePositive = change !== undefined && (isPositiveGood ? change >= 0 : change <= 0);
  const changeNeutral  = change === undefined || Math.abs(change) < 0.05;

  return (
    <div
      className={`
        relative bg-lw-darkCard border rounded-xl p-5 flex flex-col gap-2 shadow-lg animate-count-up
        ${ragStatus ? RAG_RING[ragStatus] : 'border-lw-darkBorder'}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-lw-darkMuted uppercase tracking-wide leading-tight pr-2 font-sans">
          {title}
        </p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-lw-panel flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-lw-gold" />
          </div>
        )}
      </div>

      {/* Value */}
      <h3 className="text-2xl font-bold text-lw-darkText leading-none font-mono">
        {formatter(animated)}
      </h3>

      {subtitle && (
        <p className="text-xs text-lw-darkMuted">{subtitle}</p>
      )}

      {/* Change badge */}
      {change !== undefined && !changeNeutral && (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit
          ${changePositive ? 'bg-lw-green/15 text-lw-green' : 'bg-lw-danger/15 text-lw-danger'}`}
        >
          {changePositive
            ? <TrendingUp className="w-3 h-3" />
            : <TrendingDown className="w-3 h-3" />}
          {change > 0 ? '+' : ''}{change.toFixed(1)}% {changeLabel}
        </div>
      )}
      {changeNeutral && change !== undefined && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-lw-darkBorder text-lw-darkMuted w-fit">
          <Minus className="w-3 h-3" />
          No change
        </div>
      )}

      {/* RAG dot */}
      {ragStatus && (
        <div className={`absolute top-3 right-3 w-3 h-3 rounded-full
          ${ragStatus === 'Red' ? 'bg-lw-danger rag-pulse' : ragStatus === 'Amber' ? 'bg-lw-amber' : 'bg-lw-green'}
        `} />
      )}
    </div>
  );
};

export default KPICard;
