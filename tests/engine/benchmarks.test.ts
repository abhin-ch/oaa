/**
 * Unit tests for src/engine/shared/benchmarks.ts
 */

import { describe, it, expect } from 'vitest';
import {
  getBenchmark,
  compareToBaseline,
  compareToNationalAverage,
  getNationalAverage,
  getAvailableStandards,
} from '@/engine/shared/benchmarks';

describe('benchmarks — getBenchmark', () => {
  it('returns NECB residential benchmark', () => {
    const b = getBenchmark('NECB', 'residential');
    expect(b).not.toBeNull();
    expect(b!.teui).toBeGreaterThan(0);
    expect(b!.tedi).toBeGreaterThan(0);
    expect(b!.ghgi).toBeGreaterThan(0);
  });

  it('returns SB-12 office benchmark', () => {
    const b = getBenchmark('SB-12', 'office');
    expect(b).not.toBeNull();
    expect(b!.teui).toBe(160);
  });

  it('returns PassiveHouse residential benchmark with low TEUI', () => {
    const b = getBenchmark('PassiveHouse', 'residential');
    expect(b).not.toBeNull();
    expect(b!.teui).toBeLessThanOrEqual(60);
    expect(b!.tedi).toBeLessThanOrEqual(15);
  });

  it('SB-12 is stricter than NECB for same type', () => {
    const necb = getBenchmark('NECB', 'residential');
    const sb12 = getBenchmark('SB-12', 'residential');
    expect(necb).not.toBeNull();
    expect(sb12).not.toBeNull();
    expect(sb12!.teui).toBeLessThan(necb!.teui);
  });

  it('all building types have NECB benchmarks', () => {
    const types = [
      'residential',
      'office',
      'retail',
      'assembly',
      'institutional',
      'industrial',
      'mixed',
    ] as const;
    for (const type of types) {
      expect(getBenchmark('NECB', type)).not.toBeNull();
    }
  });
});

describe('benchmarks — compareToBaseline', () => {
  it('returns excellent for result well below benchmark', () => {
    const benchmark = { teui: 200, tedi: 60, ghgi: 25 };
    const result = compareToBaseline({ teui: 80 }, benchmark);
    expect(result.percentOfCode).toBeCloseTo(40, 1);
    expect(result.rating).toBe('excellent');
  });

  it('returns good for result at 60% of benchmark', () => {
    const benchmark = { teui: 200, tedi: 60, ghgi: 25 };
    const result = compareToBaseline({ teui: 120 }, benchmark);
    expect(result.percentOfCode).toBeCloseTo(60, 1);
    expect(result.rating).toBe('good');
  });

  it('returns fair for result at 90% of benchmark', () => {
    const benchmark = { teui: 200, tedi: 60, ghgi: 25 };
    const result = compareToBaseline({ teui: 180 }, benchmark);
    expect(result.percentOfCode).toBeCloseTo(90, 1);
    expect(result.rating).toBe('fair');
  });

  it('returns poor for result exceeding benchmark', () => {
    const benchmark = { teui: 200, tedi: 60, ghgi: 25 };
    const result = compareToBaseline({ teui: 250 }, benchmark);
    expect(result.percentOfCode).toBeCloseTo(125, 1);
    expect(result.rating).toBe('poor');
  });

  it('handles zero benchmark TEUI', () => {
    const benchmark = { teui: 0, tedi: 0, ghgi: 0 };
    const result = compareToBaseline({ teui: 100 }, benchmark);
    expect(result.percentOfCode).toBe(0);
    expect(result.rating).toBe('poor');
  });
});

describe('benchmarks — compareToNationalAverage', () => {
  it('100% for a building exactly at national average', () => {
    const avg = getNationalAverage('residential');
    const result = compareToNationalAverage(avg, 'residential');
    expect(result.percentOfAverage).toBeCloseTo(100, 1);
  });

  it('50% for a building at half the national average', () => {
    const avg = getNationalAverage('office');
    const result = compareToNationalAverage(avg / 2, 'office');
    expect(result.percentOfAverage).toBeCloseTo(50, 1);
  });
});

describe('benchmarks — getAvailableStandards', () => {
  it('returns at least NECB, SB-10, SB-12', () => {
    const standards = getAvailableStandards();
    expect(standards).toContain('NECB');
    expect(standards).toContain('SB-10');
    expect(standards).toContain('SB-12');
  });
});
