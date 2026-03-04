'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, type SankeyGraph } from 'd3-sankey';
import type { SankeyData } from '@/engine/shared/types';

interface SankeyDiagramProps {
  data: SankeyData;
  width?: number;
  height?: number;
}

interface SankeyNodeDatum {
  id: string;
  label: string;
  value: number;
  unit: string;
  index?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

interface SankeyLinkDatum {
  source: string | SankeyNodeDatum;
  target: string | SankeyNodeDatum;
  value: number;
  width?: number;
  y0?: number;
  y1?: number;
}

const NODE_COLORS: Record<string, string> = {
  heating_energy: '#f59e0b', // amber
  cooling_energy: '#3b82f6', // blue
  lighting_energy: '#fcd34d', // yellow
  equipment_energy: '#a78bfa', // violet
  dhw_energy: '#fb923c', // orange
  fan_energy: '#94a3b8', // slate
  total_energy: '#64748b', // dark slate
  envelope_loss: '#fb7185', // rose
  ventilation_loss: '#f87171', // red
  infiltration_loss: '#ef4444', // red
  internal_gains: '#34d399', // emerald
  solar_gains: '#fbbf24', // amber
};

/**
 * D3-based Sankey diagram for energy flow visualization.
 * Shows energy sources flowing through to losses and gains.
 */
export function SankeyDiagram({ data, width = 600, height = 400 }: SankeyDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 120, bottom: 10, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Build node index map
    const nodeMap = new Map(data.nodes.map((n, i) => [n.id, i]));

    // Prepare data for d3-sankey
    const sankeyNodes = data.nodes.map((n) => ({ ...n }));
    const sankeyLinks = data.links
      .filter((l) => nodeMap.has(l.source as string) && nodeMap.has(l.target as string))
      .map((l) => ({
        source: nodeMap.get(l.source as string)!,
        target: nodeMap.get(l.target as string)!,
        value: l.value,
      }));

    if (sankeyLinks.length === 0) return;

    const sankeyLayout = sankey<
      SankeyNodeDatum,
      { source: number; target: number; value: number }
    >()
      .nodeId((d: SankeyNodeDatum) => d.index!)
      .nodeWidth(16)
      .nodePadding(12)
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ]);

    const graph = sankeyLayout({
      nodes: sankeyNodes,
      links: sankeyLinks,
    });

    // Draw links
    g.append('g')
      .selectAll('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        const sourceNode = d.source as SankeyNodeDatum;
        return NODE_COLORS[sourceNode.id] || '#cbd5e1';
      })
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', (d) => Math.max(1, d.width || 1));

    // Draw nodes
    g.append('g')
      .selectAll('rect')
      .data(graph.nodes)
      .join('rect')
      .attr('x', (d) => d.x0!)
      .attr('y', (d) => d.y0!)
      .attr('height', (d) => Math.max(1, d.y1! - d.y0!))
      .attr('width', (d) => d.x1! - d.x0!)
      .attr('fill', (d) => NODE_COLORS[d.id] || '#94a3b8')
      .attr('rx', 2);

    // Labels
    g.append('g')
      .selectAll('text')
      .data(graph.nodes)
      .join('text')
      .attr('x', (d) => (d.x0! < innerWidth / 2 ? d.x1! + 6 : d.x0! - 6))
      .attr('y', (d) => (d.y0! + d.y1!) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => (d.x0! < innerWidth / 2 ? 'start' : 'end'))
      .attr('class', 'fill-text-secondary text-[10px]')
      .text((d) => `${d.label} (${Math.round(d.value).toLocaleString()} kWh)`);
  }, [data, width, height]);

  if (data.nodes.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-bg-raised text-sm text-text-tertiary">
        No energy flow data available
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      className="w-full"
      style={{ maxHeight: height }}
      role="img"
      aria-label="Energy flow Sankey diagram"
    />
  );
}
