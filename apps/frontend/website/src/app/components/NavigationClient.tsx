'use client';

import Link from 'next/link';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from 'next-intl';
import LoginButton from './LoginButton';

interface NavigationItem {
  name: string;
  href: string;
  submenu?: {
    name: string;
    href: string;
  }[];
}

interface NavigationClientProps {
  locale: string;
  navigation: NavigationItem[];
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export default function NavigationClient({ locale, navigation, isMenuOpen, onMenuToggle }: NavigationClientProps) {
  const t = useTranslations('common.nav');

  return (
    <nav className="bg-white backdrop-blur-sm shadow-lg fixed w-full z-[997] border-b border-[#E5E7EB]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center" prefetch={true}>
              <Logo variant="full" />
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-6">
              <LoginButton locale={locale} />
              <LanguageSwitcher locale={locale} className="hidden md:block" />
            </div>
            <button
              onClick={onMenuToggle}
              className="text-[#251C6B] hover:text-[#7057A0] transition-colors p-2"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 