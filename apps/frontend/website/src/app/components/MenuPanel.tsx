'use client';

import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { useState } from 'react';
import ContactFormWrapper from './ContactFormWrapper';
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

interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
  locale: string;
}

export default function MenuPanel({ isOpen, onClose, navigation, locale }: MenuPanelProps) {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const t = useTranslations('common.nav');

  const handleLinkClick = (href: string) => {
    if (href === '#contact') {
      setIsContactFormOpen(true);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[998] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-lg z-[999] transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#251C6B]">Menu</h2>
            <button 
              onClick={onClose}
              className="text-[#251C6B] hover:text-[#7057A0] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu content */}
          <div className="flex-1 overflow-y-auto">
            {navigation.map((item) => (
              item.submenu ? (
                <div key={item.name} className="mb-4">
                  <h3 className="text-xl font-semibold text-[#251C6B] mb-2">{item.name}</h3>
                  <div className="pl-4 space-y-2">
                    {item.submenu.map((subitem) => (
                      <Link 
                        key={subitem.name} 
                        href={subitem.href} 
                        className="text-lg text-[#251C6B] hover:text-[#7057A0] transition-colors block"
                        onClick={() => handleLinkClick(subitem.href)}
                      >
                        {subitem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div key={item.name} className="mb-4">
                  {item.href === '#contact' ? (
                    <button
                      onClick={() => handleLinkClick(item.href)}
                      className="text-xl font-semibold text-[#251C6B] hover:text-[#7057A0] transition-colors block w-full text-left"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link 
                      href={item.href} 
                      className="text-xl font-semibold text-[#251C6B] hover:text-[#7057A0] transition-colors block"
                      onClick={() => handleLinkClick(item.href)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              )
            ))}

            {/* Mobile-only options */}
            <div className="mt-8 pt-8 border-t border-[#E5E7EB]">
              <div className="flex flex-col gap-4">
                <LanguageSwitcher locale={locale} className="text-xl font-semibold" />
                <LoginButton locale={locale} className="text-xl font-semibold" onClick={onClose} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      {isContactFormOpen && (
        <ContactFormWrapper 
          isOpen={isContactFormOpen} 
          onClose={() => {
            setIsContactFormOpen(false);
            onClose();
          }} 
          locale={locale} 
          messages={null}
        />
      )}
    </>
  );
} 