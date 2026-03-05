'use client';

import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui';

export function Sidebar() {
  const t = useTranslations();
  const { currentStep, setStep } = useUIStore();

  const wizardSteps = [
    { number: 1, label: t('wizard.step1.title') },
    { number: 2, label: t('wizard.step2.title') },
    { number: 3, label: t('wizard.step3.title') },
    { number: 4, label: t('wizard.step4.title') },
    { number: 5, label: t('wizard.step5.title') },
    { number: 6, label: t('wizard.step6.title') },
    { number: 7, label: t('wizard.step7.title') },
  ];

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
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
