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
      className={`flex items-center justify-center px-4 py-1.5 text-xs font-medium ${
        isOnline ? 'bg-bg-raised text-text-secondary' : 'bg-bg-sunken text-text-secondary'
      }`}
    >
      {isOnline ? t('common.backOnline') : t('common.offline')}
    </div>
  );
}
