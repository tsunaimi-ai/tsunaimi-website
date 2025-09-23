'use client';

import { useTranslations } from 'next-intl';
import { getPlatformUrl } from '@/lib/platform-config';

interface LoginButtonProps {
  locale: string;
  className?: string;
  onClick?: () => void;
}

export default function LoginButton({ locale, className = '', onClick }: LoginButtonProps) {
  const t = useTranslations('common');

  const handleClick = () => {
    onClick?.();
    // Direct redirect to platform signin
    const platformSigninUrl = getPlatformUrl('signin');
    window.location.href = platformSigninUrl;
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-[#7057A0] hover:bg-[#251C6B] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium ${className}`}
    >
      {t('nav.login')}
    </button>
  );
} 