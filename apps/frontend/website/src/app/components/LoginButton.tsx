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

  const handleClick = async () => {
    onClick?.();
    try {
      // Open platform signin in new tab (consistent with other platform links)
      const platformSigninUrl = await getPlatformUrl('signin');
      window.open(platformSigninUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to get platform URL:', error);
      // Fallback or error handling
      alert('Unable to connect to platform. Please try again.');
    }
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