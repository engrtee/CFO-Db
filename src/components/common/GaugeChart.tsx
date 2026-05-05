import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { RAGStatus } from '../../types/subsidiary.types';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  greenThreshold: number;
  amberThreshold: number;
  label: string;
  unit?: string;
  rag: RAGStatus;
  size?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  greenThreshold,
  amberThreshold,
  label,
  unit = '%',
  rag,
  size = 160,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const el = svgRef.current;
    d3.select(el).selectAll('*').remove();

    const w = size;
    const h = size * 0.65;
    const cx = w / 2;
    const cy = h * 0.92;
    const r = Math.min(w, h * 1.4) * 0.42;

    const svg = d3.select(el)
      .attr('width', w)
      .attr('height', h);

    const angleScale = d3.scaleLinear()
      .domain([min, max])
      .range([-Math.PI / 2 - Math.PI / 12, Math.PI / 2 + Math.PI / 12]);

    const arc = d3.arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(r * 0.68)
      .outerRadius(r)
      .startAngle((d) => d.startAngle)
      .endAngle((d) => d.endAngle);

    const zones = [
      { from: min, to: amberThreshold, color: '#DC2626' },
      { from: amberThreshold, to: greenThreshold, color: '#F59E0B' },
      { from: greenThreshold, to: max, color: '#00A86B' },
    ];

    zones.forEach(({ from, to, color }) => {
      svg.append('path')
        .datum({ startAngle: angleScale(from), endAngle: angleScale(to) })
        .attr('d', arc)
        .attr('fill', color)
        .attr('opacity', 0.25)
        .attr('transform', `translate(${cx},${cy})`);
    });

    const needleAngle = angleScale(Math.min(Math.max(value, min), max));
    const needleLen = r * 0.88;
    const nx = cx + needleLen * Math.cos(needleAngle - Math.PI / 2);
    const ny = cy + needleLen * Math.sin(needleAngle - Math.PI / 2);

    svg.append('line')
      .attr('x1', cx).attr('y1', cy)
      .attr('x2', nx).attr('y2', ny)
      .attr('stroke', rag === 'Red' ? '#DC2626' : rag === 'Amber' ? '#F59E0B' : '#00A86B')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round');

    svg.append('circle')
      .attr('cx', cx).attr('cy', cy)
      .attr('r', 5)
      .attr('fill', '#E8EDF5');

    svg.append('text')
      .attr('x', cx).attr('y', cy - r * 0.2)
      .attr('text-anchor', 'middle')
      .attr('font-size', r * 0.38)
      .attr('font-weight', 'bold')
      .attr('font-family', 'IBM Plex Mono')
      .attr('fill', rag === 'Red' ? '#DC2626' : rag === 'Amber' ? '#F59E0B' : '#00A86B')
      .text(value.toFixed(1) + unit);

    svg.append('text')
      .attr('x', cx).attr('y', cy - r * 0.02)
      .attr('text-anchor', 'middle')
      .attr('font-size', r * 0.18)
      .attr('font-family', 'DM Sans')
      .attr('fill', '#7A92B0')
      .text(label);
  }, [value, min, max, greenThreshold, amberThreshold, rag, label, unit, size]);

  return <svg ref={svgRef} />;
};

export default GaugeChart;
