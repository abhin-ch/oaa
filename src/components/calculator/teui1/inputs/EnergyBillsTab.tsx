'use client';

import { useTranslations } from 'next-intl';
import type { Building } from '@/schema/building';
import { EnergySourceInput } from './EnergySourceInput';
import { GAS_M3_TO_KWH, PROPANE_LBS_TO_KWH, OIL_L_TO_KWH, BIOFUEL_M3_TO_KWH } from '@/engine/teui1';

interface EnergyBillsTabProps {
  building: Building;
  onUpdate: (changes: Partial<Building>) => void;
}

export function EnergyBillsTab({ building, onUpdate }: EnergyBillsTabProps) {
  const t = useTranslations('teui1');
  const es = building.energySources ?? {};

  function setField(field: string, value: number) {
    onUpdate({
      energySources: { ...es, [field]: value },
    });
  }

  return (
    <div className="space-y-4 pb-4">
      <EnergySourceInput
        label={t('energy.electricity')}
        unit={t('energy.electricityUnit')}
        value={es.electricityKwh ?? 0}
        onChange={(v) => setField('electricityKwh', v)}
      />

      <EnergySourceInput
        label={t('energy.naturalGas')}
        unit={t('energy.naturalGasUnit')}
        value={es.naturalGasM3 ?? 0}
        onChange={(v) => setField('naturalGasM3', v)}
        kwhEquivalent={(es.naturalGasM3 ?? 0) * GAS_M3_TO_KWH}
        convertedLabel={t('energy.convertedTo')}
      />

      <EnergySourceInput
        label={t('energy.propane')}
        unit={t('energy.propaneUnit')}
        value={es.propaneLbs ?? 0}
        onChange={(v) => setField('propaneLbs', v)}
        kwhEquivalent={(es.propaneLbs ?? 0) * PROPANE_LBS_TO_KWH}
        convertedLabel={t('energy.convertedTo')}
      />

      <EnergySourceInput
        label={t('energy.heatingOil')}
        unit={t('energy.heatingOilUnit')}
        value={es.heatingOilL ?? 0}
        onChange={(v) => setField('heatingOilL', v)}
        kwhEquivalent={(es.heatingOilL ?? 0) * OIL_L_TO_KWH}
        convertedLabel={t('energy.convertedTo')}
      />

      <EnergySourceInput
        label={t('energy.biofuel')}
        unit={t('energy.biofuelUnit')}
        value={es.biofuelM3 ?? 0}
        onChange={(v) => setField('biofuelM3', v)}
        kwhEquivalent={(es.biofuelM3 ?? 0) * BIOFUEL_M3_TO_KWH}
        convertedLabel={t('energy.convertedTo')}
      />
    </div>
  );
}
