'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import NavigationClient from './NavigationClient';

interface NavigationProps {
  locale: string;
}

export default function Navigation({ locale }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('common.nav');

  const navigation = [
    { name: t('home'), href: '/' },
    { 
      name: t('about'), 
      href: '#',
      submenu: [
        { name: t('about_submenu.manifesto'), href: '/manifesto' },
        { name: t('about_submenu.story'), href: '/story' },
        { name: t('about_submenu.team'), href: '/team' }
      ]
    },
    {
      name: t('ai_agents'),
      href: '/ai-agents',
      submenu: [
        { name: t('ai_agents_submenu.overview'), href: '/ai-agents' },
        { name: t('ai_agents_submenu.release_notes'), href: '#release-notes' }
      ]
    },
    { name: t('contact'), href: '/contact' }
  ];

  return (
    <NavigationClient 
      locale={locale}
      navigation={navigation}
      isMenuOpen={isMenuOpen}
      onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
    />
  );
} 