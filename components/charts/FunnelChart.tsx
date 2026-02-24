'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface FunnelStep {
  step: string;
  label: string;
  users: number;
  dropOffPercent: number;
  conversionPercent: number;
}

interface Props {
  data: FunnelStep[];
}

/**
 * D3.js Funnel Chart – Vizualizacija konverzije Home → Search → View → Add.
 */
export default function FunnelChart({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 700, height: 400 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = Math.max(300, containerRef.current.offsetWidth - 16);
        setDims({ width: w, height: Math.max(300, Math.min(450, w * 0.65)) });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const isMobile = dims.width < 500;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const w = dims.width - margin.left - margin.right;
    const h = dims.height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', dims.width)
      .attr('height', dims.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxUsers = data[0]?.users || 1;
    const barHeight = h / data.length - 12;
    const centerX = w / 2;

    // Boje – gradijent od zelene do crvene
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, data.length - 1])
      .range(['#00FFA2', '#FF2E00'])
      .interpolate(d3.interpolateHcl);

    data.forEach((step, i) => {
      const barWidth = Math.max(60, (step.users / maxUsers) * w * 0.9);
      const x = centerX - barWidth / 2;
      const y = i * (barHeight + 12);

      // Trapezoidni oblik (funnel)
      const nextWidth =
        i < data.length - 1
          ? Math.max(60, (data[i + 1].users / maxUsers) * w * 0.9)
          : barWidth * 0.7;

      const nextX = centerX - nextWidth / 2;

      // Crtaj trapez
      svg
        .append('path')
        .attr(
          'd',
          `M ${x} ${y}
           L ${x + barWidth} ${y}
           L ${nextX + nextWidth} ${y + barHeight}
           L ${nextX} ${y + barHeight}
           Z`,
        )
        .attr('fill', colorScale(i) as string)
        .attr('opacity', 0.85)
        .attr('rx', 4)
        .attr('stroke', '#1A1A1A')
        .attr('stroke-width', 1.5)
        .transition()
        .duration(500)
        .delay(i * 150)
        .attr('opacity', 0.9);

      // Label – naziv koraka
      svg
        .append('text')
        .attr('x', centerX)
        .attr('y', y + barHeight / 2 - (isMobile ? 2 : 4))
        .text(step.label)
        .attr('text-anchor', 'middle')
        .attr('fill', i < 2 ? '#1A1A1A' : '#FFF')
        .style('font-size', isMobile ? '11px' : '13px')
        .style('font-weight', 'bold');

      // Broj korisnika i postotak
      svg
        .append('text')
        .attr('x', centerX)
        .attr('y', y + barHeight / 2 + (isMobile ? 12 : 14))
        .text(`${step.users} users (${step.conversionPercent}%)`)
        .attr('text-anchor', 'middle')
        .attr('fill', i < 2 ? '#1A1A1A' : '#D9D9D9')
        .style('font-size', isMobile ? '9px' : '11px');

      // Drop-off indikator (između koraka)
      if (i > 0 && step.dropOffPercent > 0) {
        const dropY = y - 4;
        svg
          .append('text')
          .attr('x', isMobile ? w - 5 : w - 10)
          .attr('y', dropY)
          .text(`↓ ${step.dropOffPercent}% drop-off`)
          .attr('text-anchor', 'end')
          .attr('fill', '#FF5555')
          .style('font-size', isMobile ? '9px' : '11px')
          .style('font-weight', '600');
      }
    });
  }, [data, dims]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}
