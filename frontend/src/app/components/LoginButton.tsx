'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatures } from '@/contexts/FeatureContext';
import { useRouter } from 'next/navigation';

interface LoginButtonProps {
  locale: string;
  className?: string;
  onClick?: () => void;
}

export default function LoginButton({ locale, className = '', onClick }: LoginButtonProps) {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const { showLogin } = useFeatures();
  const t = useTranslations('common');
  const router = useRouter();

  const handleClick = async () => {
    if (isAuthenticated) {
      try {
        await logout();
        // Use Next.js router for navigation
        router.push(`/${locale}`);
      } catch (err) {
        console.error('Logout failed:', err);
        // You might want to show an error toast or message here
      }
    } else {
      onClick?.();
    }
  };

  if (!showLogin) {
    return null;
  }

  if (isLoading) {
    return (
      <button
        disabled
        className={`bg-[#7057A0] text-white px-6 py-3 rounded-lg flex items-center gap-2 opacity-50 cursor-not-allowed text-sm font-medium transition-colors ${className}`}
      >
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {isAuthenticated ? t('nav.logging_out') : t('nav.logging_in')}
      </button>
    );
  }

  if (isAuthenticated) {
    return (
      <button
        onClick={handleClick}
        className={`bg-[#7057A0] hover:bg-[#251C6B] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium ${className}`}
      >
        {t('nav.logout')}
      </button>
    );
  }

  return (
    <Link
      href={`/${locale}/login`}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        router.push(`/${locale}/login`);
      }}
      className={`bg-[#7057A0] hover:bg-[#251C6B] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium ${className}`}
    >
      {t('nav.login')}
    </Link>
  );
} 