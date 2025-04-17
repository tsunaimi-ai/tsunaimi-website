'use client';

import { usePathname } from 'next/navigation';

interface LanguageSwitcherProps {
  locale: string;
  className?: string;
}

export default function LanguageSwitcher({ locale, className = '' }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const targetLocale = locale === 'en' ? 'fr' : 'en';
  const targetPath = pathname?.replace(`/${locale}`, `/${targetLocale}`);

  const handleLanguageSwitch = (newLocale: string) => {
    const newPath = pathname?.replace(/^\/[a-zA-Z-]+/, `/${newLocale}`);
    window.location.href = newPath || `/${newLocale}`;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => handleLanguageSwitch('en')}
        className={`px-4 py-2 rounded-md transition-colors ${
          locale === 'en'
            ? 'bg-[#7057A0] text-white'
            : 'text-[#251C6B] hover:text-[#7057A0]'
        }`}
      >
        EN
      </button>
      <span className="text-[#251C6B]">/</span>
      <button
        onClick={() => handleLanguageSwitch('fr')}
        className={`px-4 py-2 rounded-md transition-colors ${
          locale === 'fr'
            ? 'bg-[#7057A0] text-white'
            : 'text-[#251C6B] hover:text-[#7057A0]'
        }`}
      >
        FR
      </button>
    </div>
  );
} 