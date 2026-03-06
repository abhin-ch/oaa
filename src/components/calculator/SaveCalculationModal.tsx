'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { MODAL_BACKDROP, MODAL_CONTENT } from '@/lib/animations';
import { useModalControls } from '@/hooks/useModalControls';

interface SaveCalculationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function SaveCalculationModal({ open, onClose, onSave }: SaveCalculationModalProps) {
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');

  useModalControls(open, onClose, inputRef);

  /* eslint-disable react-hooks/set-state-in-effect -- intentional reset on open */
  useEffect(() => {
    if (open) setName('');
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            {...MODAL_BACKDROP}
            className="absolute inset-0 bg-bg-base/60 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            {...MODAL_CONTENT}
            className="relative w-full max-w-md mx-4"
            role="dialog"
            aria-modal="true"
            aria-label={t('catalog.saveModalTitle')}
          >
            <div className="bg-bg-base p-10 shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.12),0_50px_100px_-20px_rgba(0,0,0,0.25)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2),0_16px_40px_rgba(0,0,0,0.35),0_50px_100px_-20px_rgba(0,0,0,0.6)]">
              {/* OAA mark */}
              <div className="mb-8 flex justify-center pt-4">
                <svg
                  viewBox="-1 -1 110 110"
                  fill="currentColor"
                  className="h-10 w-10 text-text-primary"
                  aria-hidden="true"
                >
                  <path
                    d="M102.69,12.11v18.4a54.9,54.9,0,0,0-25.3-25.3h18.4V-.19H-.11v95.9h5.4V77.31a54.9,54.9,0,0,0,25.3,25.3H12.19V108h95.9V12.11ZM5.29,5.21h25.3a54.9,54.9,0,0,0-25.3,25.3Zm0,48.7A48.7,48.7,0,1,1,54,102.61,48.76,48.76,0,0,1,5.29,53.91Zm72.2,48.7a54.9,54.9,0,0,0,25.3-25.3v25.3Z"
                    transform="translate(0.11 0.19)"
                  />
                </svg>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="calc-name"
                    className="text-xs font-medium uppercase tracking-wider text-text-tertiary"
                  >
                    {t('catalog.saveModalLabel')}
                  </label>
                  <input
                    ref={inputRef}
                    id="calc-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('catalog.saveModalPlaceholder')}
                    className="h-11 border border-border-default bg-bg-base px-3.5 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:border-text-primary focus:outline-none focus:ring-2 focus:ring-text-primary/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="mt-2 h-11 bg-text-primary text-sm font-medium text-text-inverse transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t('catalog.saveModalDone')}
                </button>
              </form>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-bg-raised text-text-tertiary transition-all hover:bg-bg-sunken hover:text-text-primary"
                aria-label={t('common.close')}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
