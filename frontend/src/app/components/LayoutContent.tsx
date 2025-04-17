'use client';

import { useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import NavigationClient from './NavigationClient';
import MenuPanel from './MenuPanel';
import FooterWrapper from './FooterWrapper';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

interface LayoutContentProps {
  locale: string;
  messages: any;
  children: React.ReactNode;
}

function NavigationContent({ locale, messages, children }: LayoutContentProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const navigation = [
    { name: messages.common.nav.home, href: `/${locale}` },
    { 
      name: messages.common.nav.about, 
      href: '#',
      submenu: [
        { name: messages.common.nav.about_submenu.manifesto, href: `/${locale}/manifesto` },
        { name: messages.common.nav.about_submenu.story, href: `/${locale}/story` },
        { name: messages.common.nav.about_submenu.team, href: `/${locale}/team` }
      ]
    },
    {
      name: messages.common.nav.ai_agents,
      href: `/${locale}/ai-agents`,
      submenu: [
        { name: messages.common.nav.ai_agents_submenu.overview, href: `/${locale}/ai-agents` }
      ]
    },
    { name: messages.common.nav.contact, href: '#contact' }
  ];

  // Add profile link if authenticated
  if (isAuthenticated) {
    navigation.push({ name: messages.common.nav.profile, href: `/${locale}/profile` });
  }

  return (
    <>
      <NavigationClient 
        locale={locale} 
        navigation={navigation}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      />
      <main>
        {children}
      </main>
      <MenuPanel 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        navigation={navigation}
        locale={locale}
      />
      <FooterWrapper locale={locale} messages={messages} />
    </>
  );
}

export default function LayoutContent({ locale, messages, children }: LayoutContentProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Paris">
      <AuthProvider>
        <NavigationContent locale={locale} messages={messages}>
          {children}
        </NavigationContent>
      </AuthProvider>
    </NextIntlClientProvider>
  );
} 