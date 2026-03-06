'use client';

import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EnergySourceInputProps {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  kwhEquivalent?: number;
  convertedLabel?: string;
}

export function EnergySourceInput({
  label,
  unit,
  value,
  onChange,
  kwhEquivalent,
  convertedLabel,
}: EnergySourceInputProps) {
  const id = useId();

  function handleChange(raw: string) {
    const num = parseFloat(raw);
    onChange(isNaN(num) || num < 0 ? 0 : num);
  }

  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
      >
        {label}
      </Label>
      <div className="flex items-center gap-3">
        <Input
          id={id}
          type="number"
          min={0}
          step="any"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0"
          className="font-mono text-base"
        />
        <span className="text-[11px] font-medium text-text-tertiary whitespace-nowrap uppercase tracking-wider">
          {unit}
        </span>
      </div>
      {kwhEquivalent != null && value > 0 && (
        <p className="text-[11px] font-mono text-text-tertiary tabular-nums animate-in fade-in duration-150">
          {convertedLabel ?? '='}{' '}
          {kwhEquivalent.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh
        </p>
      )}
    </div>
  );
}
