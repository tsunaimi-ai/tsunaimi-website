'use client';

import { usePathname, useRouter } from 'next/navigation';

interface LanguageSwitcherProps {
  locale: string;
  className?: string;
}

export default function LanguageSwitcher({ locale, className = '' }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const targetLocale = locale === 'en' ? 'fr' : 'en';
  const targetPath = pathname?.replace(`/${locale}`, `/${targetLocale}`);

  const handleLanguageSwitch = (newLocale: string) => {
    const newPath = pathname?.replace(/^\/[a-zA-Z-]+/, `/${newLocale}`);
    router.push(newPath || `/${newLocale}`);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => handleLanguageSwitch('en')}
        className={`px-4 py-2 rounded-md transition-colors ${
          locale === 'en'
            ? 'bg-brand-primary-light text-white'
            : 'text-brand-primary hover:text-brand-primary-light'
        }`}
      >
        EN
      </button>
      <span className="text-brand-primary">/</span>
      <button
        onClick={() => handleLanguageSwitch('fr')}
        className={`px-4 py-2 rounded-md transition-colors ${
          locale === 'fr'
            ? 'bg-brand-primary-light text-white'
            : 'text-brand-primary hover:text-brand-primary-light'
        }`}
      >
        FR
      </button>
    </div>
  );
} 