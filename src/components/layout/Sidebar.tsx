'use client';

import { useUIStore } from '@/store/ui';

interface WizardStep {
  number: number;
  label: string;
  description: string;
}

const wizardSteps: WizardStep[] = [
  { number: 1, label: 'Project Setup', description: 'Name, address, type' },
  { number: 2, label: 'Building Basics', description: 'Area, floors, occupancy' },
  { number: 3, label: 'Energy Bills', description: 'Electricity, gas, fuel' },
  { number: 4, label: 'Envelope', description: 'Walls, roof, windows' },
  { number: 5, label: 'Systems & Loads', description: 'HVAC, DHW, lighting' },
  { number: 6, label: 'Renewables', description: 'PV, wind, offsets' },
  { number: 7, label: 'Results', description: 'Dashboard & analysis' },
];

export function Sidebar() {
  const { currentStep, setStep } = useUIStore();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border-default bg-bg-surface lg:block">
      <nav className="flex flex-col gap-1 p-4" aria-label="Wizard steps">
        {wizardSteps.map((step) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <button
              key={step.number}
              onClick={() => setStep(step.number)}
              className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                isActive
                  ? 'bg-energy-50 text-text-primary'
                  : isCompleted
                    ? 'text-text-secondary hover:bg-bg-raised'
                    : 'text-text-tertiary hover:bg-bg-raised hover:text-text-secondary'
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Step indicator */}
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                  isActive
                    ? 'bg-energy-400 text-text-primary'
                    : isCompleted
                      ? 'bg-success-400 text-white'
                      : 'border border-border-default bg-bg-raised'
                }`}
              >
                {isCompleted ? '✓' : step.number}
              </span>

              {/* Step text */}
              <div className="min-w-0">
                <div className={`text-sm font-medium ${isActive ? 'text-text-primary' : ''}`}>
                  {step.label}
                </div>
                <div className="text-xs text-text-tertiary">{step.description}</div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
