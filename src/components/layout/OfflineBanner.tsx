'use client';

import { useTranslations } from 'next-intl';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const t = useTranslations();
  const { isOnline, wasOffline } = useOnlineStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-0 left-0 right-0 z-[60] flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors ${
        isOnline ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
      }`}
    >
      {isOnline ? t('common.backOnline') : t('common.offline')}
    </div>
  );
}
