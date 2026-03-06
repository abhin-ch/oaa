'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingHero } from '@/components/landing/LandingHero';
import { LoginModal } from '@/components/landing/LoginModal';

export default function LandingPage() {
  const t = useTranslations();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <LandingNav onLogin={() => setShowLogin(true)} />

      <main id="main-content" className="flex-1">
        <LandingHero onGetStarted={() => router.push('/projects')} />
      </main>

      {/* Footer bar */}
      <footer className="border-t border-border-subtle bg-[#171717] text-[#a3a3a3] dark:bg-[#262626] dark:text-[#737373]">
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-between px-6 text-[10px] tracking-wide">
          <span className="font-mono opacity-60">{t('landing.footerVersion')}</span>
          <span className="font-mono opacity-60">OAA &copy; 2025</span>
        </div>
      </footer>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
