'use client';

import { useTranslations } from 'next-intl';
import Logo from './Logo';

export default function Footer() {
  const t = useTranslations('common.footer');

  return (
    <footer className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center md:items-start justify-center">
            <div className="mb-4">
              <Logo variant="full" />
            </div>
            <p className="text-brand-primary text-base text-center md:text-left">
              {t('tagline')}
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end justify-center">
            <h3 className="text-xl font-bold mb-4 text-brand-primary text-center md:text-right">{t('connect')}</h3>
            <div className="text-brand-primary text-base text-center md:text-right">
              <p className="mb-1">{t('wave')}</p>
              <p>{t('linkedin')}{' '}
                <a 
                  href="https://www.linkedin.com/company/tsunaimi" 
                  className="text-brand-primary-light hover:text-brand-primary transition-colors font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
                .
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-brand-primary-light text-center text-brand-primary">
          <p>&copy; {new Date().getFullYear()} TsunAImi. {t('rights')}</p>
        </div>
      </div>
    </footer>
  );
} 