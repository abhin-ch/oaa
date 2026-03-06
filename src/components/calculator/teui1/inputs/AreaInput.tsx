'use client';

import { useState, useId } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ft2ToM2, m2ToFt2 } from '@/engine/teui1';
import { parsePositiveNumber } from '@/lib/validation';

interface AreaInputProps {
  valueM2: number;
  onChange: (m2: number) => void;
}

export function AreaInput({ valueM2, onChange }: AreaInputProps) {
  const t = useTranslations('teui1.building');
  const id = useId();
  const [unit, setUnit] = useState<'m2' | 'ft2'>('m2');

  const displayValue = unit === 'm2' ? valueM2 : m2ToFt2(valueM2);

  function handleChange(raw: string) {
    const num = parsePositiveNumber(raw);
    onChange(unit === 'm2' ? num : ft2ToM2(num));
  }

  return (
    <div className="space-y-3">
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
      >
        {t('conditionedArea')}
      </Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="number"
          min={0}
          step="any"
          value={displayValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0"
          className="font-mono text-base"
        />
        <div className="flex shrink-0 overflow-hidden rounded-md border border-input text-sm font-medium">
          <button
            type="button"
            onClick={() => setUnit('m2')}
            className={`px-4 py-2 transition-colors ${
              unit === 'm2'
                ? 'bg-text-primary text-text-inverse'
                : 'bg-bg-surface text-text-secondary hover:bg-bg-raised'
            }`}
          >
            {t('sqm')}
          </button>
          <button
            type="button"
            onClick={() => setUnit('ft2')}
            className={`px-4 py-2 transition-colors ${
              unit === 'ft2'
                ? 'bg-text-primary text-text-inverse'
                : 'bg-bg-surface text-text-secondary hover:bg-bg-raised'
            }`}
          >
            {t('sqft')}
          </button>
        </div>
      </div>
      <p className="text-[11px] text-text-tertiary">{t('hint')}</p>
    </div>
  );
}
