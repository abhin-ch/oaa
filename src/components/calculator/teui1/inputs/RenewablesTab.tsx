'use client';

import { useTranslations } from 'next-intl';
import type { Building } from '@/schema/building';
import { EnergySourceInput } from './EnergySourceInput';

interface RenewablesTabProps {
  building: Building;
  onUpdate: (changes: Partial<Building>) => void;
}

export function RenewablesTab({ building, onUpdate }: RenewablesTabProps) {
  const t = useTranslations('teui1.renewables');
  const rn = building.renewables ?? {};

  function setField(field: string, value: number) {
    onUpdate({
      renewables: { ...rn, [field]: value },
    });
  }

  return (
    <div className="space-y-4 pb-4">
      <EnergySourceInput
        label={t('onSite')}
        unit="kWh"
        value={rn.onSiteKwh ?? 0}
        onChange={(v) => setField('onSiteKwh', v)}
      />

      <EnergySourceInput
        label={t('offSiteElectricity')}
        unit="kWh"
        value={rn.offSiteElectricityKwh ?? 0}
        onChange={(v) => setField('offSiteElectricityKwh', v)}
      />

      <EnergySourceInput
        label={t('offSiteGas')}
        unit="kWh"
        value={rn.offSiteGasKwh ?? 0}
        onChange={(v) => setField('offSiteGasKwh', v)}
      />

      <p className="text-[11px] text-text-tertiary">{t('hint')}</p>
    </div>
  );
}
