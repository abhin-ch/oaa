/**
 * Unit tests for src/engine/teui4.ts
 */

import { describe, it, expect } from 'vitest';
import { calculateTEUI4, generateSankeyData, compareScenarios } from '@/engine/teui4';
import { calculateTEUI3 } from '@/engine/teui3';
import { createFullOfficeBuilding, createWithActuals } from './fixtures/buildings';

describe('teui4 — calculateTEUI4', () => {
  it('returns all TEUI3 fields plus sankeyData', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI4(building);

    // TEUI3 fields
    expect(result).toHaveProperty('teui');
    expect(result).toHaveProperty('tedi');
    expect(result).toHaveProperty('ghgi');
    expect(result).toHaveProperty('energyBalance');
    expect(result).toHaveProperty('referenceModel');
    expect(result).toHaveProperty('designModel');

    // TEUI4-specific
    expect(result).toHaveProperty('sankeyData');
    expect(result.sankeyData).toHaveProperty('nodes');
    expect(result.sankeyData).toHaveProperty('links');
  });

  it('TEUI matches TEUI3 result for same building', () => {
    const building = createFullOfficeBuilding();
    const teui3 = calculateTEUI3(building);
    const teui4 = calculateTEUI4(building);

    expect(teui4.teui).toBeCloseTo(teui3.teui, 4);
    expect(teui4.tedi).toBeCloseTo(teui3.tedi, 4);
    expect(teui4.ghgi).toBeCloseTo(teui3.ghgi, 4);
  });
});

describe('teui4 — generateSankeyData', () => {
  it('generates nodes for non-zero energy components', () => {
    const building = createFullOfficeBuilding();
    const teui3 = calculateTEUI3(building);
    const sankey = generateSankeyData(teui3);

    // Should have total_energy node
    const totalNode = sankey.nodes.find((n) => n.id === 'total_energy');
    expect(totalNode).toBeDefined();
    expect(totalNode!.value).toBeGreaterThan(0);

    // Should have at least one energy component node besides total_energy
    const energyNodes = sankey.nodes.filter((n) => n.id !== 'total_energy');
    expect(energyNodes.length).toBeGreaterThan(0);
  });

  it('generates links connecting sources to total', () => {
    const building = createFullOfficeBuilding();
    const teui3 = calculateTEUI3(building);
    const sankey = generateSankeyData(teui3);

    // Should have at least one link to total_energy
    const linksToTotal = sankey.links.filter((l) => l.target === 'total_energy');
    expect(linksToTotal.length).toBeGreaterThan(0);
  });

  it('generates links from total to losses', () => {
    const building = createFullOfficeBuilding();
    const teui3 = calculateTEUI3(building);
    const sankey = generateSankeyData(teui3);

    const linksFromTotal = sankey.links.filter((l) => l.source === 'total_energy');
    expect(linksFromTotal.length).toBeGreaterThan(0);
  });

  it('all link values are positive', () => {
    const building = createFullOfficeBuilding();
    const teui3 = calculateTEUI3(building);
    const sankey = generateSankeyData(teui3);

    for (const link of sankey.links) {
      expect(link.value).toBeGreaterThan(0);
    }
  });

  it('all nodes have required fields', () => {
    const building = createFullOfficeBuilding();
    const teui3 = calculateTEUI3(building);
    const sankey = generateSankeyData(teui3);

    for (const node of sankey.nodes) {
      expect(node).toHaveProperty('id');
      expect(node).toHaveProperty('label');
      expect(node).toHaveProperty('value');
      expect(node).toHaveProperty('unit');
      expect(typeof node.id).toBe('string');
      expect(typeof node.label).toBe('string');
      expect(typeof node.value).toBe('number');
    }
  });

  it('all links have required fields', () => {
    const building = createFullOfficeBuilding();
    const teui3 = calculateTEUI3(building);
    const sankey = generateSankeyData(teui3);

    for (const link of sankey.links) {
      expect(link).toHaveProperty('source');
      expect(link).toHaveProperty('target');
      expect(link).toHaveProperty('value');
    }
  });

  it('link sources and targets reference existing node IDs', () => {
    const building = createFullOfficeBuilding();
    const teui3 = calculateTEUI3(building);
    const sankey = generateSankeyData(teui3);

    const nodeIds = new Set(sankey.nodes.map((n) => n.id));
    for (const link of sankey.links) {
      expect(nodeIds.has(link.source)).toBe(true);
      expect(nodeIds.has(link.target)).toBe(true);
    }
  });
});

describe('teui4 — compareScenarios', () => {
  it('returns diffs for all key metrics', () => {
    const buildingA = createFullOfficeBuilding();
    const buildingB = createFullOfficeBuilding();
    buildingB.envelope.walls = buildingB.envelope.walls.map((w) => ({
      ...w,
      uValue: w.uValue * 0.5, // Better insulation
    }));

    const resultA = calculateTEUI3(buildingA);
    const resultB = calculateTEUI3(buildingB);
    const diffs = compareScenarios(resultA, resultB);

    expect(diffs.length).toBeGreaterThan(0);
    const teuiDiff = diffs.find((d) => d.metricName === 'TEUI');
    expect(teuiDiff).toBeDefined();
    expect(teuiDiff!.scenarioAValue).toBeCloseTo(resultA.teui, 4);
    expect(teuiDiff!.scenarioBValue).toBeCloseTo(resultB.teui, 4);
  });

  it('better insulation shows negative envelope loss diff', () => {
    const buildingA = createFullOfficeBuilding();
    // Remove HRV so heating demand is meaningful and wall insulation matters more
    buildingA.ventilation.hrvEfficiency = 0;

    const buildingB = createFullOfficeBuilding();
    buildingB.ventilation.hrvEfficiency = 0;
    buildingB.envelope.walls = buildingB.envelope.walls.map((w) => ({
      ...w,
      uValue: w.uValue * 0.5, // Better insulation
    }));

    const resultA = calculateTEUI3(buildingA);
    const resultB = calculateTEUI3(buildingB);
    const diffs = compareScenarios(resultA, resultB);

    const envelopeDiff = diffs.find((d) => d.metricName === 'Envelope Loss');
    expect(envelopeDiff).toBeDefined();
    expect(envelopeDiff!.absoluteDiff).toBeLessThan(0); // B has less envelope loss
  });

  it('identical scenarios have zero diffs', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    const diffs = compareScenarios(result, result);

    for (const diff of diffs) {
      expect(diff.absoluteDiff).toBe(0);
      expect(diff.percentDiff).toBe(0);
    }
  });

  it('each diff has correct structure', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    const diffs = compareScenarios(result, result);

    for (const diff of diffs) {
      expect(diff).toHaveProperty('metricName');
      expect(diff).toHaveProperty('scenarioAValue');
      expect(diff).toHaveProperty('scenarioBValue');
      expect(diff).toHaveProperty('absoluteDiff');
      expect(diff).toHaveProperty('percentDiff');
      expect(diff).toHaveProperty('unit');
      expect(typeof diff.metricName).toBe('string');
      expect(typeof diff.unit).toBe('string');
    }
  });

  it('includes envelope loss and heating energy diffs', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    const diffs = compareScenarios(result, result);

    const metricNames = diffs.map((d) => d.metricName);
    expect(metricNames).toContain('Envelope Loss');
    expect(metricNames).toContain('Heating Energy');
    expect(metricNames).toContain('Cooling Energy');
    expect(metricNames).toContain('Total Energy');
  });
});
