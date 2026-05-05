import React from 'react';
import type { RAGStatus } from '../../types/subsidiary.types';

interface RAGBadgeProps {
  status: RAGStatus;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const COLORS: Record<RAGStatus, { dot: string; bg: string; text: string; border: string }> = {
  Green: { dot: 'bg-lw-green', bg: 'bg-lw-green/15', text: 'text-lw-green', border: 'border-lw-green/30' },
  Amber: { dot: 'bg-lw-amber', bg: 'bg-lw-amber/15', text: 'text-lw-amber', border: 'border-lw-amber/30' },
  Red:   { dot: 'bg-lw-danger', bg: 'bg-lw-danger/15', text: 'text-lw-danger', border: 'border-lw-danger/30' },
};

export const RAGBadge: React.FC<RAGBadgeProps> = ({ status, label, size = 'md' }) => {
  const c = COLORS[status];
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 ${padding} rounded-full border ${c.bg} ${c.border} ${c.text} ${textSize} font-semibold`}>
      <span className={`${dotSize} rounded-full flex-shrink-0 ${c.dot} ${status === 'Red' ? 'rag-pulse' : ''}`} />
      {label ?? status}
    </span>
  );
};

export default RAGBadge;
