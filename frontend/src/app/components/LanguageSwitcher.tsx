'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface LanguageSwitcherProps {
  locale: string;
  className?: string;
}

export default function LanguageSwitcher({ locale, className = '' }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const targetLocale = locale === 'en' ? 'fr' : 'en';
  const targetPath = pathname?.replace(`/${locale}`, `/${targetLocale}`);

  return (
    <Link
      href={targetPath || `/${targetLocale}`}
      className={`text-[#251C6B] hover:text-[#7057A0] transition-colors ${className}`}
    >
      {targetLocale.toUpperCase()}
    </Link>
  );
} 