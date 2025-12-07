'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface GameStats {
  name: string;
  rating: number;
  plays: number;
}

interface GameScatterPlotProps {
  data: GameStats[];
  title?: string;
}

export default function GameScatterPlot({ data, title = 'Ocjena vs Broj Igranja' }: GameScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 500 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newWidth = Math.max(300, containerWidth - 32);
        const newHeight = Math.max(300, Math.min(500, newWidth * 0.7));
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const isMobile = dimensions.width < 640;
    const margin = { 
      top: isMobile ? 40 : 60, 
      right: isMobile ? 20 : 40, 
      bottom: isMobile ? 60 : 80, 
      left: isMobile ? 50 : 80 
    };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Očisti prethodni sadržaj
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Skale
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.plays) || 200])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([7, 10])
      .range([height, 0]);

    // Color scale
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, d3.max(data, (d) => d.plays) || 200])
      .range(['#3b82f6', '#8b5cf6']);

    // Grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
      );

    svg
      .append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale)
          .tickSize(-height)
          .tickFormat(() => '')
      );

    // Tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Dodaj kružnice
    const circleRadius = isMobile ? 8 : 12;
    const circles = svg
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.plays))
      .attr('cy', height)
      .attr('r', 0)
      .attr('fill', (d) => colorScale(d.plays))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))');

    // Animacija kružnica
    circles
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('cy', (d) => yScale(d.rating))
      .attr('r', circleRadius)
      .style('opacity', 0.9);

    // Hover efekti
    circles
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', isMobile ? 14 : 18)
          .style('opacity', 1)
          .style('filter', 'drop-shadow(0 8px 12px rgba(0, 0, 0, 0.3))');

        tooltip
          .style('display', 'block')
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px')
          .html(`
            <div class="font-bold text-lg mb-2">${d.name}</div>
            <div class="space-y-1">
              <div>⭐ Ocjena: <span class="font-semibold">${d.rating}/10</span></div>
              <div>🎮 Broj ocjena: <span class="font-semibold">${d.plays.toLocaleString()}</span></div>
            </div>
          `);
      })
      .on('mousemove', function (event) {
        tooltip
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', circleRadius)
          .style('opacity', 0.9)
          .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))');

        tooltip.style('display', 'none');
      });

    // Ose
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(isMobile ? 4 : 8)
          .tickFormat((d) => {
            const num = Number(d);
            if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
            return num.toString();
          })
      )
      .style('font-size', isMobile ? '10px' : '12px')
      .style('fill', '#374151');

    svg
      .append('g')
      .call(d3.axisLeft(yScale).ticks(isMobile ? 5 : 10))
      .style('font-size', isMobile ? '10px' : '13px');

    // X os label
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + (isMobile ? margin.bottom - 10 : margin.bottom - 15))
      .attr('text-anchor', 'middle')
      .style('font-size', isMobile ? '11px' : '14px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text('Broj Ocjena');

    // Y os label
    if (!isMobile) {
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left + 20)
        .attr('x', 0 - height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', '#374151')
        .text('Ocjena (0-10)');
    }

    // Naslov
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', isMobile ? -20 : -30)
      .attr('text-anchor', 'middle')
      .style('font-size', isMobile ? '14px' : '22px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(title);

    // Trend linija (linearna regresija)
    const xMean = d3.mean(data, (d) => d.plays) || 0;
    const yMean = d3.mean(data, (d) => d.rating) || 0;

    let numerator = 0;
    let denominator = 0;
    data.forEach((d) => {
      numerator += (d.plays - xMean) * (d.rating - yMean);
      denominator += (d.plays - xMean) * (d.plays - xMean);
    });

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    const xMin = 0;
    const xMax = d3.max(data, (d) => d.plays) || 200;

    svg
      .append('line')
      .attr('x1', xScale(xMin))
      .attr('y1', yScale(intercept))
      .attr('x2', xScale(xMax))
      .attr('y2', yScale(slope * xMax + intercept))
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .style('opacity', 0)
      .transition()
      .duration(1500)
      .delay(1000)
      .style('opacity', 0.6);

    // Legenda za trend liniju
    if (!isMobile) {
      svg
        .append('text')
        .attr('x', width - 10)
        .attr('y', 20)
        .attr('text-anchor', 'end')
        .style('font-size', '11px')
        .style('fill', '#ef4444')
        .style('font-weight', 'bold')
        .style('opacity', 0)
        .text('Trend linija')
        .transition()
        .duration(1500)
        .delay(1000)
        .style('opacity', 1);
    }

  }, [data, title, dimensions]);

  return (
    <div ref={containerRef} className="w-full bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl relative">
      <svg ref={svgRef} className="w-full" />
      <div
        ref={tooltipRef}
        className="fixed bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl pointer-events-none text-sm"
        style={{ display: 'none', zIndex: 9999 }}
      />
    </div>
  );
}
