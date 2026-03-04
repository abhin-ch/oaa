'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';
import type { EnvelopeWall, EnvelopeWindow, CardinalDirection } from '@/schema/building';

const directions: CardinalDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

const presets = [
  { label: 'Code Minimum', wallU: 0.315, roofU: 0.183, windowU: 2.0, shgc: 0.4, ach: 3.0 },
  { label: 'High Performance', wallU: 0.2, roofU: 0.12, windowU: 1.4, shgc: 0.35, ach: 1.5 },
  { label: 'Passive House', wallU: 0.1, roofU: 0.08, windowU: 0.8, shgc: 0.5, ach: 0.6 },
];

export function Step4Envelope() {
  const { building, updateBuilding } = useProjectStore();
  const { nextStep, prevStep } = useUIStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!building) return null;

  const applyPreset = (preset: (typeof presets)[number]) => {
    const walls: EnvelopeWall[] =
      building.envelope.walls.length > 0
        ? building.envelope.walls.map((w) => ({ ...w, uValue: preset.wallU }))
        : [{ areaM2: 100, uValue: preset.wallU, orientation: 'N' as CardinalDirection }];

    const windows: EnvelopeWindow[] =
      building.envelope.windows.length > 0
        ? building.envelope.windows.map((w) => ({
            ...w,
            uValue: preset.windowU,
            shgc: preset.shgc,
          }))
        : [
            {
              areaM2: 20,
              uValue: preset.windowU,
              shgc: preset.shgc,
              orientation: 'S' as CardinalDirection,
            },
          ];

    updateBuilding({
      envelope: {
        ...building.envelope,
        walls,
        windows,
        roof: { ...building.envelope.roof, uValue: preset.roofU },
        airtightnessACH: preset.ach,
      },
    });
  };

  const updateAirtightness = (ach: number) => {
    updateBuilding({
      envelope: { ...building.envelope, airtightnessACH: ach },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">Envelope</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Define your building&apos;s thermal envelope — walls, roof, windows, and air tightness.
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-secondary">Quick Presets</span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="rounded-lg border border-border-default px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-energy-400 hover:bg-energy-50 hover:text-energy-700"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roof U-value */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="roof-u" className="text-sm font-medium text-text-secondary">
          Roof U-value <span className="text-xs text-text-tertiary">(W/m²·K)</span>
        </label>
        <input
          id="roof-u"
          type="number"
          min="0"
          step="0.01"
          value={building.envelope.roof.uValue || ''}
          onChange={(e) =>
            updateBuilding({
              envelope: {
                ...building.envelope,
                roof: { ...building.envelope.roof, uValue: Number(e.target.value) || 0 },
              },
            })
          }
          placeholder="e.g. 0.183"
          className="h-11 rounded-lg border border-border-default bg-bg-surface px-3.5 text-base text-text-primary placeholder:text-text-tertiary transition-colors focus:border-energy-400 focus:outline-none focus:ring-3 focus:ring-energy-100"
        />
      </div>

      {/* Airtightness slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="ach" className="text-sm font-medium text-text-secondary">
            Airtightness <span className="text-xs text-text-tertiary">(ACH @ 50 Pa)</span>
          </label>
          <span className="font-mono text-sm font-medium tabular-nums text-text-primary">
            {building.envelope.airtightnessACH.toFixed(1)}
          </span>
        </div>
        <input
          id="ach"
          type="range"
          min="0.3"
          max="10"
          step="0.1"
          value={building.envelope.airtightnessACH}
          onChange={(e) => updateAirtightness(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-bg-sunken accent-energy-400"
        />
        <div className="flex justify-between text-xs text-text-tertiary">
          <span>Passive House (0.3)</span>
          <span>Leaky (10.0)</span>
        </div>
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-left text-sm font-medium text-energy-600 hover:text-energy-700"
      >
        {showAdvanced ? '▾ Hide' : '▸ Show'} advanced wall & window details
      </button>

      {showAdvanced && (
        <div className="flex flex-col gap-4 rounded-lg border border-border-default bg-bg-raised p-4">
          <p className="text-xs text-text-tertiary">
            Add individual wall and window sections with orientation. For a quick estimate, one
            entry per orientation is usually sufficient.
          </p>

          {/* Walls */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-secondary">Walls</span>
            {building.envelope.walls.map((wall, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="number"
                  value={wall.areaM2 || ''}
                  onChange={(e) => {
                    const walls = [...building.envelope.walls];
                    walls[i] = { ...wall, areaM2: Number(e.target.value) || 0 };
                    updateBuilding({ envelope: { ...building.envelope, walls } });
                  }}
                  placeholder="Area m²"
                  className="h-9 w-24 rounded border border-border-default bg-bg-surface px-2 text-sm"
                />
                <input
                  type="number"
                  value={wall.uValue || ''}
                  onChange={(e) => {
                    const walls = [...building.envelope.walls];
                    walls[i] = { ...wall, uValue: Number(e.target.value) || 0 };
                    updateBuilding({ envelope: { ...building.envelope, walls } });
                  }}
                  placeholder="U-value"
                  className="h-9 w-24 rounded border border-border-default bg-bg-surface px-2 text-sm"
                />
                <select
                  value={wall.orientation}
                  onChange={(e) => {
                    const walls = [...building.envelope.walls];
                    walls[i] = { ...wall, orientation: e.target.value as CardinalDirection };
                    updateBuilding({ envelope: { ...building.envelope, walls } });
                  }}
                  className="h-9 rounded border border-border-default bg-bg-surface px-2 text-sm"
                >
                  {directions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button
              onClick={() => {
                const walls = [
                  ...building.envelope.walls,
                  { areaM2: 0, uValue: 0.278, orientation: 'N' as CardinalDirection },
                ];
                updateBuilding({ envelope: { ...building.envelope, walls } });
              }}
              className="text-sm text-energy-600 hover:text-energy-700"
            >
              + Add wall section
            </button>
          </div>

          {/* Windows */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-secondary">Windows</span>
            {building.envelope.windows.map((win, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="number"
                  value={win.areaM2 || ''}
                  onChange={(e) => {
                    const windows = [...building.envelope.windows];
                    windows[i] = { ...win, areaM2: Number(e.target.value) || 0 };
                    updateBuilding({ envelope: { ...building.envelope, windows } });
                  }}
                  placeholder="Area m²"
                  className="h-9 w-24 rounded border border-border-default bg-bg-surface px-2 text-sm"
                />
                <input
                  type="number"
                  value={win.uValue || ''}
                  onChange={(e) => {
                    const windows = [...building.envelope.windows];
                    windows[i] = { ...win, uValue: Number(e.target.value) || 0 };
                    updateBuilding({ envelope: { ...building.envelope, windows } });
                  }}
                  placeholder="U-value"
                  className="h-9 w-20 rounded border border-border-default bg-bg-surface px-2 text-sm"
                />
                <input
                  type="number"
                  value={win.shgc || ''}
                  onChange={(e) => {
                    const windows = [...building.envelope.windows];
                    windows[i] = { ...win, shgc: Number(e.target.value) || 0 };
                    updateBuilding({ envelope: { ...building.envelope, windows } });
                  }}
                  placeholder="SHGC"
                  className="h-9 w-20 rounded border border-border-default bg-bg-surface px-2 text-sm"
                />
                <select
                  value={win.orientation}
                  onChange={(e) => {
                    const windows = [...building.envelope.windows];
                    windows[i] = { ...win, orientation: e.target.value as CardinalDirection };
                    updateBuilding({ envelope: { ...building.envelope, windows } });
                  }}
                  className="h-9 rounded border border-border-default bg-bg-surface px-2 text-sm"
                >
                  {directions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button
              onClick={() => {
                const windows = [
                  ...building.envelope.windows,
                  { areaM2: 0, uValue: 2.0, shgc: 0.4, orientation: 'S' as CardinalDirection },
                ];
                updateBuilding({ envelope: { ...building.envelope, windows } });
              }}
              className="text-sm text-energy-600 hover:text-energy-700"
            >
              + Add window section
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={prevStep}
          className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-raised"
        >
          ← Back
        </button>
        <button
          onClick={nextStep}
          className="rounded-lg bg-energy-400 px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:brightness-105 active:scale-[0.98]"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
