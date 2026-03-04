'use client';

import { useUIStore } from '@/store/ui';
import { Step1ProjectSetup } from './Step1_ProjectSetup';
import { Step2BuildingBasics } from './Step2_BuildingBasics';
import { Step3EnergyBills } from './Step3_EnergyBills';
import { Step4Envelope } from './Step4_Envelope';
import { Step5SystemsLoads } from './Step5_SystemsLoads';
import { Step6Renewables } from './Step6_Renewables';
import { Step7Results } from './Step7_Results';

const steps: Record<number, React.ComponentType> = {
  1: Step1ProjectSetup,
  2: Step2BuildingBasics,
  3: Step3EnergyBills,
  4: Step4Envelope,
  5: Step5SystemsLoads,
  6: Step6Renewables,
  7: Step7Results,
};

export function WizardContainer() {
  const { currentStep } = useUIStore();
  const StepComponent = steps[currentStep] ?? Step1ProjectSetup;

  return (
    <div className="flex flex-col gap-6">
      {/* Step header — visible on mobile */}
      <div className="lg:hidden">
        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
          Step {currentStep} of 7
        </p>
      </div>

      {/* Step content */}
      <div className="animate-in fade-in slide-in-from-right-2 duration-250">
        <StepComponent />
      </div>
    </div>
  );
}
