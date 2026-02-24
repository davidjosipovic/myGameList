'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  date: string;
  activeUsers: number;
  sessions: number;
  eventCount: number;
}

interface Props {
  data: DataPoint[];
}

/**
 * D3.js Line Chart – Trend aktivnih korisnika, sesija i eventova kroz vrijeme.
 */
export default function ActiveUsersLineChart({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = Math.max(300, containerRef.current.offsetWidth - 16);
        setDims({ width: w, height: Math.max(280, Math.min(420, w * 0.5)) });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const isMobile = dims.width < 640;
    const margin = {
      top: 30,
      right: isMobile ? 10 : 30,
      bottom: isMobile ? 60 : 50,
      left: isMobile ? 40 : 60,
    };
    const w = dims.width - margin.left - margin.right;
    const h = dims.height - margin.top - margin.bottom;

    // Parsiraj datume:
    // GA4 historical format: YYYYMMDD (8 znakova)
    // GA4 realtime format:   YYYYMMDDHHMM (12 znakova)
    const parseDate = (s: string) => {
      if (s.length >= 12) {
        // Realtime: YYYYMMDDHHMM
        const y = s.slice(0, 4);
        const mo = s.slice(4, 6);
        const d = s.slice(6, 8);
        const h = s.slice(8, 10);
        const mi = s.slice(10, 12);
        return new Date(`${y}-${mo}-${d}T${h}:${mi}:00`);
      }
      // Historical: YYYYMMDD
      const y = s.slice(0, 4);
      const m = s.slice(4, 6);
      const d = s.slice(6, 8);
      return new Date(`${y}-${m}-${d}`);
    };

    const isRealtime = data.length > 0 && data[0].date.length >= 12;

    const parsed = data.map((d) => ({
      date: parseDate(d.date),
      activeUsers: d.activeUsers,
      sessions: d.sessions,
      eventCount: d.eventCount,
    }));
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', dims.width)
      .attr('height', dims.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Skale
    const x = d3
      .scaleTime()
      .domain(d3.extent(parsed, (d) => d.date) as [Date, Date])
      .range([0, w]);

    const maxY = d3.max(parsed, (d) => Math.max(d.activeUsers, d.sessions)) || 100;
    const y = d3.scaleLinear().domain([0, maxY * 1.1]).range([h, 0]);

    // Grid linije
    svg
      .append('g')
      .attr('class', 'grid')
      .selectAll('line')
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
      .call(
        d3
          .axisBottom(x)
          .ticks(isMobile ? 5 : 8)
          .tickFormat((d) =>
            isRealtime
              ? d3.timeFormat('%H:%M')(d as Date)   // HH:mm za realtime
              : d3.timeFormat('%d.%m.')(d as Date)  // DD.MM. za historical/mock
          ),
      )
      .selectAll('text')
      .attr('fill', '#D9D9D9')
      .style('font-size', isMobile ? '9px' : '11px')
      .attr('transform', 'rotate(-35)')
      .attr('text-anchor', 'end');

    svg
      .append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#D9D9D9')
      .style('font-size', '11px');

    svg.selectAll('.domain').attr('stroke', '#555');
    svg.selectAll('.tick line').attr('stroke', '#555');

    // Linije
    const lines = [
      { key: 'activeUsers' as const, color: '#00FFA2', label: 'Active Users' },
      { key: 'sessions' as const, color: '#6366F1', label: 'Sessions' },
    ];

    for (const { key, color } of lines) {
      const lineGen = d3
        .line<(typeof parsed)[0]>()
        .x((d) => x(d.date))
        .y((d) => y(d[key]))
        .curve(d3.curveMonotoneX);

      svg
        .append('path')
        .datum(parsed)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2.5)
        .attr('d', lineGen);

      // Točke
      svg
        .selectAll(`.dot-${key}`)
        .data(parsed)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d.date))
        .attr('cy', (d) => y(d[key]))
        .attr('r', isMobile ? 2 : 3)
        .attr('fill', color)
        .attr('stroke', '#1A1A1A')
        .attr('stroke-width', 1)
        .on('mouseover', function (event, d) {
          d3.select(this).attr('r', 6);
          if (tooltipRef.current) {
            tooltipRef.current.style.opacity = '1';
            tooltipRef.current.style.left = `${event.offsetX + 10}px`;
            tooltipRef.current.style.top = `${event.offsetY - 30}px`;
            tooltipRef.current.innerHTML = `
              <strong>${isRealtime ? d3.timeFormat('%H:%M')(d.date) : d3.timeFormat('%d.%m.%Y')(d.date)}</strong><br/>
              Active Users: ${d.activeUsers}<br/>
              Sessions: ${d.sessions}
            `;
          }
        })
        .on('mouseout', function () {
          d3.select(this).attr('r', isMobile ? 2 : 3);
          if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
        });
    }

    // Legenda
    const legend = svg.append('g').attr('transform', `translate(${w - 140}, -15)`);
    lines.forEach(({ color, label }, i) => {
      legend
        .append('rect')
        .attr('x', 0)
        .attr('y', i * 18)
        .attr('width', 14)
        .attr('height', 3)
        .attr('fill', color);
      legend
        .append('text')
        .attr('x', 20)
        .attr('y', i * 18 + 5)
        .text(label)
        .attr('fill', '#D9D9D9')
        .style('font-size', '11px');
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
