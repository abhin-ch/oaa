'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Building } from '@/schema/building';

interface ProjectTabProps {
  building: Building;
  onUpdate: (changes: Partial<Building>) => void;
}

export function ProjectTab({ building, onUpdate }: ProjectTabProps) {
  const t = useTranslations('teui1.project');
  const beginId = useId();
  const endId = useId();
  const ep = building.evaluationPeriod ?? {};

  function setField(field: string, value: string) {
    onUpdate({
      evaluationPeriod: { ...ep, [field]: value },
    });
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-3">
        <Label
          htmlFor={beginId}
          className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          {t('beginDate')}
        </Label>
        <Input
          id={beginId}
          type="date"
          value={ep.beginDate ?? ''}
          onChange={(e) => setField('beginDate', e.target.value)}
          className="font-mono text-base"
        />
      </div>

      <div className="space-y-3">
        <Label
          htmlFor={endId}
          className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          {t('endDate')}
        </Label>
        <Input
          id={endId}
          type="date"
          value={ep.endDate ?? ''}
          onChange={(e) => setField('endDate', e.target.value)}
          className="font-mono text-base"
        />
      </div>

      <p className="text-[11px] text-text-tertiary">{t('period')}</p>
    </div>
  );
}
