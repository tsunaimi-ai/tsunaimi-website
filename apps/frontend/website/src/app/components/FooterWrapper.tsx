'use client';

import { NextIntlClientProvider } from 'next-intl';
import Footer from './Footer';

interface FooterWrapperProps {
  locale: string;
  messages: Record<string, any>;
}

export default function FooterWrapper({ locale, messages }: FooterWrapperProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Footer />
    </NextIntlClientProvider>
  );
} 