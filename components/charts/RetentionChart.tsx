'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface RetentionCohort {
  cohortDate: string;
  totalUsers: number;
  day1Retained: number;
  day7Retained: number;
}

interface RetentionData {
  totalUsers: number;
  day1: { retained: number; percent: number };
  day7: { retained: number; percent: number };
  cohorts: RetentionCohort[];
}

interface Props {
  data: RetentionData;
}

/**
 * D3.js Grouped Bar Chart – Retention po kohortama (Day 1 vs Day 7).
 */
export default function RetentionChart({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 700, height: 380 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = Math.max(300, containerRef.current.offsetWidth - 16);
        setDims({ width: w, height: Math.max(280, Math.min(400, w * 0.55)) });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!data || data.cohorts.length === 0 || !svgRef.current) return;

    const isMobile = dims.width < 500;
    const margin = { top: 30, right: 20, bottom: 55, left: isMobile ? 40 : 55 };
    const w = dims.width - margin.left - margin.right;
    const h = dims.height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', dims.width)
      .attr('height', dims.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const cohorts = data.cohorts;

    // Izračunaj postotke
    const chartData = cohorts.map((c) => ({
      label: c.cohortDate,
      d1Pct: c.totalUsers > 0 ? (c.day1Retained / c.totalUsers) * 100 : 0,
      d7Pct: c.totalUsers > 0 ? (c.day7Retained / c.totalUsers) * 100 : 0,
      totalUsers: c.totalUsers,
      d1: c.day1Retained,
      d7: c.day7Retained,
    }));

    // Skale
    const x0 = d3
      .scaleBand()
      .domain(chartData.map((d) => d.label))
      .range([0, w])
      .padding(0.25);

    const x1 = d3
      .scaleBand()
      .domain(['d1', 'd7'])
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const maxPct = d3.max(chartData, (d) => Math.max(d.d1Pct, d.d7Pct)) || 100;
    const y = d3.scaleLinear().domain([0, Math.min(100, maxPct * 1.2)]).range([h, 0]);

    // Grid
    svg
      .selectAll('.grid-line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', w)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', '#333')
      .attr('stroke-dasharray', '3,3');

    // Osi
    svg
      .append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .attr('fill', '#D9D9D9')
      .style('font-size', isMobile ? '9px' : '11px')
      .attr('transform', 'rotate(-25)')
      .attr('text-anchor', 'end');

    svg
      .append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `${d}%`),
      )
      .selectAll('text')
      .attr('fill', '#D9D9D9')
      .style('font-size', '11px');

    svg.selectAll('.domain').attr('stroke', '#555');
    svg.selectAll('.tick line').attr('stroke', '#555');

    const colors = { d1: '#00FFA2', d7: '#6366F1' };

    // Barovi
    const groups = svg
      .selectAll('.cohort-group')
      .data(chartData)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${x0(d.label)},0)`);

    for (const key of ['d1', 'd7'] as const) {
      const pctKey = key === 'd1' ? 'd1Pct' : 'd7Pct';

      groups
        .append('rect')
        .attr('x', () => x1(key) || 0)
        .attr('y', h)
        .attr('width', x1.bandwidth())
        .attr('height', 0)
        .attr('rx', 3)
        .attr('fill', colors[key])
        .attr('opacity', 0.85)
        .on('mouseover', function (event, d) {
          d3.select(this).attr('opacity', 1);
          if (tooltipRef.current) {
            tooltipRef.current.style.opacity = '1';
            tooltipRef.current.style.left = `${event.offsetX + 10}px`;
            tooltipRef.current.style.top = `${event.offsetY - 40}px`;
            tooltipRef.current.innerHTML = `
              <strong>${d.label}</strong><br/>
              Total: ${d.totalUsers} users<br/>
              Day 1: ${d.d1} (${d.d1Pct.toFixed(1)}%)<br/>
              Day 7: ${d.d7} (${d.d7Pct.toFixed(1)}%)
            `;
          }
        })
        .on('mouseout', function () {
          d3.select(this).attr('opacity', 0.85);
          if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
        })
        .transition()
        .duration(600)
        .delay((_, i) => i * 80)
        .attr('y', (d) => y(d[pctKey]))
        .attr('height', (d) => h - y(d[pctKey]));
    }

    // Legenda
    const legend = svg.append('g').attr('transform', `translate(${w - 130}, -15)`);
    [
      { color: '#00FFA2', label: 'Day 1 Retention' },
      { color: '#6366F1', label: 'Day 7 Retention' },
    ].forEach(({ color, label }, i) => {
      legend.append('rect').attr('x', 0).attr('y', i * 18).attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', color);
      legend.append('text').attr('x', 18).attr('y', i * 18 + 10).text(label).attr('fill', '#D9D9D9').style('font-size', '11px');
    });
  }, [data, dims]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full" />
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none bg-[#1a1a1a] border border-green-light/30 text-white text-xs rounded-lg px-3 py-2 opacity-0 transition-opacity shadow-xl shadow-black/40 z-10"
      />
    </div>
  );
}
