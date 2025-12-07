'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface GameStats {
  name: string;
  rating: number;
  plays: number;
}

interface GamePieChartProps {
  data: GameStats[];
  title?: string;
}

export default function GamePieChart({ data, title = 'Distribucija Igranja' }: GamePieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const size = Math.min(500, Math.max(300, containerWidth - 32));
        setDimensions({ width: size, height: size });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const width = dimensions.width;
    const height = dimensions.height;
    const isMobile = width < 500;
    const radius = Math.min(width, height) / 2 - (isMobile ? 20 : 40);

    // Očisti prethodni sadržaj
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Color scale
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(data.map((d) => d.name))
      .range(['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']);

    // Pie generator
    const pie = d3
      .pie<GameStats>()
      .value((d) => d.plays)
      .sort(null);

    // Arc generator
    const arc = d3
      .arc<d3.PieArcDatum<GameStats>>()
      .innerRadius(radius * (isMobile ? 0.5 : 0.6)) // Donut chart
      .outerRadius(radius);

    const outerArc = d3
      .arc<d3.PieArcDatum<GameStats>>()
      .innerRadius(radius)
      .outerRadius(radius);

    // Dodaj arcs
    const arcs = svg
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Dodaj paths sa animacijom
    const paths = arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => colorScale(d.data.name))
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .style('opacity', 1)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) || '';
        };
      });

    // Tooltip
    const tooltip = d3.select(tooltipRef.current);

    arcs
      .on('mouseover', function (event, d) {
        d3.select(this).select('path')
          .transition()
          .duration(200)
          .style('opacity', 0.8)
          .style('filter', 'drop-shadow(0 8px 12px rgba(0, 0, 0, 0.2))')
          .attr('transform', 'scale(1.05)');

        const percentage = ((d.data.plays / d3.sum(data, (g) => g.plays)) * 100).toFixed(1);

        tooltip
          .style('display', 'block')
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px')
          .html(`
            <div class="font-bold text-lg mb-2">${d.data.name}</div>
            <div class="space-y-1">
              <div>⭐ Ocjena: <span class="font-semibold">${d.data.rating}/10</span></div>
              <div>🎮 Ocjena: <span class="font-semibold">${d.data.plays.toLocaleString()}</span></div>
              <div>📊 Postotak: <span class="font-semibold">${percentage}%</span></div>
            </div>
          `);
      })
      .on('mousemove', function (event) {
        tooltip
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).select('path')
          .transition()
          .duration(200)
          .style('opacity', 1)
          .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
          .attr('transform', 'scale(1)');

        tooltip.style('display', 'none');
      });

    // Dodaj centralni tekst
    const totalPlays = d3.sum(data, (d) => d.plays);
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', isMobile ? '24px' : '32px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .style('opacity', 0)
      .text(totalPlays)
      .transition()
      .duration(1000)
      .delay(800)
      .style('opacity', 1);

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .style('font-size', isMobile ? '11px' : '14px')
      .style('fill', '#6b7280')
      .style('opacity', 0)
      .text('Ukupno igranja')
      .transition()
      .duration(1000)
      .delay(800)
      .style('opacity', 1);

  }, [data, title, dimensions]);

  return (
    <div ref={containerRef} className="w-full bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl relative">
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">{title}</h3>
      <div className="flex justify-center">
        <svg ref={svgRef} className="w-full" />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs sm:text-sm">
        {data.map((game, i) => {
          const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[i % colors.length] }} />
              <span className="text-gray-700 font-medium">
                {game.name.length > 15 ? game.name.substring(0, 15) + '...' : game.name}
              </span>
            </div>
          );
        })}
      </div>
      <div
        ref={tooltipRef}
        className="fixed bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl pointer-events-none text-sm"
        style={{ display: 'none', zIndex: 9999 }}
      />
    </div>
  );
}
