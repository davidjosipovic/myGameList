'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DeviceData {
  device: string;
  activeUsers: number;
  sessions: number;
}

interface Props {
  data: DeviceData[];
}

/**
 * D3.js Bar Chart – Korisnici i sesije po uređajima (desktop / mobile / tablet).
 */
export default function DeviceBarChart({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 600, height: 350 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = Math.max(280, containerRef.current.offsetWidth - 16);
        setDims({ width: w, height: Math.max(260, Math.min(380, w * 0.6)) });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const isMobile = dims.width < 500;
    const margin = { top: 30, right: 20, bottom: 50, left: isMobile ? 45 : 60 };
    const w = dims.width - margin.left - margin.right;
    const h = dims.height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', dims.width)
      .attr('height', dims.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Skale
    const x0 = d3
      .scaleBand()
      .domain(data.map((d) => d.device))
      .range([0, w])
      .padding(0.3);

    const x1 = d3
      .scaleBand()
      .domain(['activeUsers', 'sessions'])
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const maxVal = d3.max(data, (d) => Math.max(d.activeUsers, d.sessions)) || 100;
    const y = d3.scaleLinear().domain([0, maxVal * 1.15]).range([h, 0]);

    const colors: Record<string, string> = {
      activeUsers: '#00FFA2',
      sessions: '#6366F1',
    };

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
      .style('font-size', '12px')
      .style('text-transform', 'capitalize');

    svg
      .append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#D9D9D9')
      .style('font-size', '11px');

    svg.selectAll('.domain').attr('stroke', '#555');
    svg.selectAll('.tick line').attr('stroke', '#555');

    // Grupe barova
    const groups = svg
      .selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${x0(d.device)},0)`);

    const metricKeys: ('activeUsers' | 'sessions')[] = ['activeUsers', 'sessions'];

    for (const key of metricKeys) {
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
              <strong>${d.device}</strong><br/>
              ${key === 'activeUsers' ? 'Users' : 'Sessions'}: ${d[key]}
            `;
          }
        })
        .on('mouseout', function () {
          d3.select(this).attr('opacity', 0.85);
          if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
        })
        .transition()
        .duration(600)
        .delay((_, i) => i * 100)
        .attr('y', (d) => y(d[key]))
        .attr('height', (d) => h - y(d[key]));

      // Broj iznad bara
      groups
        .append('text')
        .attr('x', () => (x1(key) || 0) + x1.bandwidth() / 2)
        .attr('y', (d) => y(d[key]) - 6)
        .text((d) => d[key])
        .attr('text-anchor', 'middle')
        .attr('fill', '#D9D9D9')
        .style('font-size', isMobile ? '9px' : '11px')
        .attr('opacity', 0)
        .transition()
        .duration(600)
        .delay((_, i) => i * 100 + 300)
        .attr('opacity', 1);
    }

    // Legenda
    const legend = svg.append('g').attr('transform', `translate(${w - 130}, -15)`);
    const legendItems = [
      { color: '#00FFA2', label: 'Active Users' },
      { color: '#6366F1', label: 'Sessions' },
    ];
    legendItems.forEach(({ color, label }, i) => {
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
