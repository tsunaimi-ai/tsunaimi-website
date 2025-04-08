'use client';

import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { useState } from 'react';
import ContactFormWrapper from './ContactFormWrapper';

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

  const handleLinkClick = (href: string) => {
    if (href === '#contact') {
      setIsContactFormOpen(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-[998] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-lg transform transition-transform z-[999] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button 
              onClick={onClose}
              className="text-[#251C6B] hover:text-[#7057A0] transition-colors p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu content */}
          <div className="flex-1 overflow-y-auto px-4">
            {navigation.map((item) => (
              item.submenu ? (
                <div key={item.name} className="mb-4">
                  <h2 className="text-xl font-semibold text-[#251C6B] mb-2">{item.name}</h2>
                  <ul className="space-y-2">
                    {item.submenu.map((subitem) => (
                      <li key={subitem.name}>
                        <Link 
                          href={subitem.href} 
                          className="text-[#7057A0] hover:text-[#251C6B] transition-colors block"
                          onClick={() => handleLinkClick(subitem.href)}
                        >
                          {subitem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
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