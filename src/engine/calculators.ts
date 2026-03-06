/**
 * Calculator registry — defines all available calculators on the platform.
 *
 * Each calculator has a unique ID, display metadata, category, and availability status.
 * This is the single source of truth for what calculators exist.
 */

export type CalculatorCategory = 'energy' | 'carbon' | 'compliance' | 'water';

export interface Calculator {
  id: string;
  category: CalculatorCategory;
  available: boolean;
}

/**
 * All calculators on the platform.
 * IDs are used as i18n keys: `calculators.{id}.name` and `calculators.{id}.description`
 */
export const CALCULATORS: Calculator[] = [
  // Energy
  { id: 'teui-v1', category: 'energy', available: true },
  { id: 'teui-v2', category: 'energy', available: false },
  { id: 'teui-v3', category: 'energy', available: false },
  { id: 'teui-v4', category: 'energy', available: false },
  { id: 'tedi', category: 'energy', available: false },

  // Carbon
  { id: 'ghgi', category: 'carbon', available: false },
  { id: 'embodied-carbon', category: 'carbon', available: false },
  { id: 'whole-life-carbon', category: 'carbon', available: false },

  // Compliance
  { id: 'necb', category: 'compliance', available: false },
  { id: 'sb10', category: 'compliance', available: false },
  { id: 'sb12', category: 'compliance', available: false },

  // Water & IAQ
  { id: 'water-use', category: 'water', available: false },
  { id: 'iaq', category: 'water', available: false },
];

export const CATEGORIES: { key: CalculatorCategory; count: number }[] = [
  { key: 'energy', count: CALCULATORS.filter((c) => c.category === 'energy').length },
  { key: 'carbon', count: CALCULATORS.filter((c) => c.category === 'carbon').length },
  { key: 'compliance', count: CALCULATORS.filter((c) => c.category === 'compliance').length },
  { key: 'water', count: CALCULATORS.filter((c) => c.category === 'water').length },
];
