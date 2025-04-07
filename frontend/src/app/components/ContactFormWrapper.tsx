'use client';

import { NextIntlClientProvider, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import ContactForm with no SSR
const ContactForm = dynamic(() => import('./ContactForm'), {
  ssr: false,
  loading: () => null,
});

interface ContactFormWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  messages: any;
}

export default function ContactFormWrapper({ isOpen, onClose, locale, messages }: ContactFormWrapperProps) {
  // If messages is provided, use it directly
  // Otherwise, we're already inside a NextIntlClientProvider from the layout
  if (messages) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ContactForm isOpen={isOpen} onClose={onClose} locale={locale} />
      </NextIntlClientProvider>
    );
  }
  
  // If no messages provided, we're already in a provider context
  return <ContactForm isOpen={isOpen} onClose={onClose} locale={locale} />;
} 