'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface GameStats {
  name: string;
  rating: number;
  plays: number;
}

interface GameStatsChartProps {
  data: GameStats[];
  title?: string;
}

export default function GameStatsChart({ data, title = 'Statistika Igara' }: GameStatsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 500 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newWidth = Math.max(300, containerWidth - 32);
        const newHeight = Math.max(300, Math.min(500, newWidth * 0.6));
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
      right: isMobile ? 10 : 30, 
      bottom: isMobile ? 100 : 120, 
      left: isMobile ? 40 : 70 
    };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Očisti prethodni sadržaj
    d3.select(svgRef.current).selectAll("*").remove();

    // Kreiraj SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Color scale za gradient - zelena tema
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, d3.max(data, (d) => d.rating) || 10])
      .range(['#22c55e', '#16a34a']); // green-light to green-dark

    // Kreiraj skale
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, width])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, 10])
      .range([height, 0]);

    // Dodaj grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.2)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .style('stroke', '#ffffff');

    // Kreiraj barove sa animacijom
    const bars = svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.name) || 0)
      .attr('y', height)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', (d) => colorScale(d.rating))
      .attr('rx', 6)
      .attr('opacity', 1)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))');

    // Tooltip interakcije - dodaj PRIJE animacije
    const tooltip = d3.select(tooltipRef.current);

    bars
      .on('mouseover', function (event, d) {
        // Samo promijeni opacity i filter, bez mijenjanja pozicije/veličine
        d3.select(this)
          .attr('opacity', 0.8)
          .style('filter', 'drop-shadow(0 8px 12px rgba(0, 0, 0, 0.2))');

        tooltip
          .style('display', 'block')
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px')
          .html(`
            <div class="font-bold text-lg mb-2">${d.name}</div>
            <div class="space-y-1">
              <div>⭐ Rating: <span class="font-semibold">${d.rating}/10</span></div>
              <div>🎮 Reviews: <span class="font-semibold">${d.plays.toLocaleString()}</span></div>
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
          .attr('opacity', 1)
          .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))');

        tooltip.style('display', 'none');
      });

    // Animacija barova - pokreni NAKON što su event listeneri dodani
    bars
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('y', (d) => yScale(d.rating))
      .attr('height', (d) => height - yScale(d.rating));

    // Dodaj labels na barovima (samo ako nije mobile)
    if (!isMobile) {
      svg
        .selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', (d) => (xScale(d.name) || 0) + xScale.bandwidth() / 2)
        .attr('y', height)
        .attr('text-anchor', 'middle')
        .style('font-size', width < 500 ? '10px' : '14px')
        .style('font-weight', 'bold')
        .style('fill', '#fff')
        .style('opacity', 0)
        .text((d) => d.rating.toFixed(1))
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .attr('y', (d) => yScale(d.rating) + 25)
        .style('opacity', 1);
    }

    // Kreiraj X os
    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll('line').style('stroke', '#ffffff');
    xAxis.select('.domain').style('stroke', '#ffffff');
    
    xAxis.selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.2em')
      .style('font-size', isMobile ? '11px' : '12px')
      .style('font-weight', '500')
      .style('fill', '#ffffff')
      .each(function(d) {
        const text = d as string;
        const maxLength = isMobile ? 15 : 20;
        const truncated = text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
        d3.select(this).text(truncated);
      });

    // Kreiraj Y os
    const yAxis = svg
      .append('g')
      .call(d3.axisLeft(yScale).ticks(isMobile ? 5 : 10))
      .style('font-size', isMobile ? '11px' : '13px');
    
    yAxis.selectAll('text').style('fill', '#ffffff');
    yAxis.selectAll('line').style('stroke', '#ffffff');
    yAxis.select('.domain').style('stroke', '#ffffff');

    // Dodaj Y os labelu
    if (!isMobile) {
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left + 15)
        .attr('x', 0 - height / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', '#ffffff')
        .text('Rating (0-10)');
    }

    // Dodaj naslov
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', isMobile ? -20 : -30)
      .attr('text-anchor', 'middle')
      .style('font-size', isMobile ? '16px' : '22px')
      .style('font-weight', 'bold')
      .style('fill', '#22c55e')
      .text(title);

    // Dodaj prosječnu liniju
    const avgRating = d3.mean(data, (d) => d.rating) || 0;
    svg
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', yScale(avgRating))
      .attr('y2', yScale(avgRating))
      .attr('stroke', '#22c55e')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .style('opacity', 0)
      .transition()
      .duration(1500)
      .style('opacity', 0.6);

    if (!isMobile) {
      svg
        .append('text')
        .attr('x', width - 5)
        .attr('y', yScale(avgRating) - 8)
        .attr('text-anchor', 'end')
        .style('font-size', '11px')
        .style('fill', '#22c55e')
        .style('font-weight', 'bold')
        .style('opacity', 0)
        .text(`Average: ${avgRating.toFixed(2)}`)
        .transition()
        .duration(1500)
        .style('opacity', 1);
    }

  }, [data, title, dimensions]);

  return (
    <div ref={containerRef} className="w-full bg-grey-dark p-4 sm:p-6 md:p-8 rounded-xl relative">
      <svg ref={svgRef} className="w-full" />
      <div
        ref={tooltipRef}
        className="fixed bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl pointer-events-none text-sm"
        style={{ display: 'none', zIndex: 9999 }}
      />
    </div>
  );
}
