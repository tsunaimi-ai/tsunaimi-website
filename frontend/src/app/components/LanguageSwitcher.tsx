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
    <div className={`flex items-center gap-1 ${className}`}>
      <Link
        href={`/en${pathname?.replace(/^\/[a-zA-Z-]+/, '')}`}
        className={`px-4 py-2 rounded-md transition-colors ${
          locale === 'en'
            ? 'bg-[#7057A0] text-white'
            : 'text-[#251C6B] hover:text-[#7057A0]'
        }`}
      >
        EN
      </Link>
      <span className="text-[#251C6B]">/</span>
      <Link
        href={`/fr${pathname?.replace(/^\/[a-zA-Z-]+/, '')}`}
        className={`px-4 py-2 rounded-md transition-colors ${
          locale === 'fr'
            ? 'bg-[#7057A0] text-white'
            : 'text-[#251C6B] hover:text-[#7057A0]'
        }`}
      >
        FR
      </Link>
    </div>
  );
} 