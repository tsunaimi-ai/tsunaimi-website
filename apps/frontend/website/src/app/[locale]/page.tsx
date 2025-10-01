'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ScaleIcon, FoundationIcon, TargetIcon } from '../components/Icons';
import DemoCards from '../components/DemoCards';
import { getPlatformUrl } from '@/lib/platform-config';

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary-light to-brand-primary"></div>
        </div>
        <div className="container relative z-10 px-4 py-12">
          <div className="max-w-6xl mx-auto text-center space-y-12">
            {/* Headline placeholder */}
            <div className="space-y-6">
              <div className="h-16 bg-white/20 rounded-lg animate-pulse mx-auto max-w-4xl"></div>
              <div className="h-12 bg-white/20 rounded-lg animate-pulse mx-auto max-w-5xl"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any>(null);
  const t = useTranslations('home');
  const params = useParams();
  const locale = params.locale as string;

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = (await import(`../../messages/${locale}.json`)).default;
        setMessages(msgs);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };
    loadMessages();
  }, [locale]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading skeleton during initial load
  if (!mounted || !messages) {
    return <LoadingSkeleton />;
  }

  const handleContactClick = async () => {
    try {
      const platformContactUrl = await getPlatformUrl('contact');
      window.open(platformContactUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to get contact URL:', error);
      alert('Unable to connect to platform. Please try again.');
    }
  };

  const handleLinkedInClick = () => {
    window.open('https://www.linkedin.com/company/tsunaimi', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary-light to-brand-primary"></div>
          <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-20"></div>
        </div>
        <div className="container relative z-10 px-4 py-12">
          <div className="max-w-6xl mx-auto text-center space-y-12">
            {/* Main Headline */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="heading-1 text-white text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {t('hero.headline')}
                </h1>
                <p className="text-xl md:text-2xl text-tsunaimi-gray-light leading-relaxed max-w-4xl mx-auto">
                  {t('hero.subheadline')}
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleContactClick}
                  className="inline-block px-8 py-4 bg-white text-brand-primary hover:bg-tsunaimi-gray-light transition-colors font-bold rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  {t('hero.cta_button')}
                </button>
                <button 
                  onClick={() => window.location.href = `/${locale}/ai-agents`}
                  className="inline-block px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-primary transition-colors font-bold rounded-lg text-lg"
                >
                  {t('hero.secondary_button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="heading-2 text-brand-primary text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t('problem.main_title')}
              </h2>
              <p className="text-xl md:text-2xl text-brand-primary-light font-medium mb-6">
                {t('problem.subtitle')}
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 text-brand-primary-light">
                    <ScaleIcon className="w-full h-full" />
                  </div>
                  <p className="text-xl md:text-2xl text-tsunaimi-gray-dark">
                    {t('problem.point1')}
                  </p>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 text-brand-primary-light">
                    <FoundationIcon className="w-full h-full" />
                  </div>
                  <p className="text-xl md:text-2xl text-tsunaimi-gray-dark">
                    {t('problem.point2')}
                  </p>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 text-brand-primary-light">
                    <TargetIcon className="w-full h-full" />
                  </div>
                  <p className="text-xl md:text-2xl text-tsunaimi-gray-dark">
                    {t('problem.point3')}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16 bg-tsunaimi-background-light">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="heading-2 text-brand-primary text-3xl md:text-4xl lg:text-5xl font-bold">
                {t('offerings.section_title')}
              </h2>
              <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-brand-primary-light mt-4">
                {t('offerings.headline')}
              </p>
              <p className="text-xl md:text-2xl text-tsunaimi-gray-dark mt-2">
                {t('offerings.subheadline')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6 p-6 bg-white rounded-lg transition-all duration-300 cursor-pointer transform-gpu perspective-1000 hover:scale-105 shadow-lg hover:shadow-[0_25px_50px_-12px_rgba(112,87,160,0.25),0_0_0_1px_rgba(112,87,160,0.05)]">
                <h3 className="text-xl md:text-2xl font-bold text-brand-primary">{t('offerings.service1.title')}</h3>
                <p className="text-lg md:text-xl text-tsunaimi-gray-dark">{t('offerings.service1.desc')}</p>
                <p className="text-lg md:text-xl text-brand-primary-light">{t('offerings.service1.sub')}</p>
              </div>

              <div className="space-y-6 p-6 bg-white rounded-lg transition-all duration-300 cursor-pointer transform-gpu perspective-1000 hover:scale-105 shadow-lg hover:shadow-[0_25px_50px_-12px_rgba(112,87,160,0.25),0_0_0_1px_rgba(112,87,160,0.05)]">
                <h3 className="text-xl md:text-2xl font-bold text-brand-primary">{t('offerings.service2.title')}</h3>
                <p className="text-lg md:text-xl text-tsunaimi-gray-dark">{t('offerings.service2.desc')}</p>
                <p className="text-lg md:text-xl text-brand-primary-light">{t('offerings.service2.sub')}</p>
              </div>

              <div className="space-y-6 p-6 bg-white rounded-lg transition-all duration-300 cursor-pointer transform-gpu perspective-1000 hover:scale-105 shadow-lg hover:shadow-[0_25px_50px_-12px_rgba(112,87,160,0.25),0_0_0_1px_rgba(112,87,160,0.05)]">
                <h3 className="text-xl md:text-2xl font-bold text-brand-primary">{t('offerings.service3.title')}</h3>
                <p className="text-lg md:text-xl text-tsunaimi-gray-dark">{t('offerings.service3.desc')}</p>
                <p className="text-lg md:text-xl text-brand-primary-light">{t('offerings.service3.sub')}</p>
              </div>

              <div className="space-y-6 p-6 bg-white rounded-lg transition-all duration-300 cursor-pointer transform-gpu perspective-1000 hover:scale-105 shadow-lg hover:shadow-[0_25px_50px_-12px_rgba(112,87,160,0.25),0_0_0_1px_rgba(112,87,160,0.05)]">
                <h3 className="text-xl md:text-2xl font-bold text-brand-primary">{t('offerings.service4.title')}</h3>
                <p className="text-lg md:text-xl text-tsunaimi-gray-dark">{t('offerings.service4.desc')}</p>
                <p className="text-lg md:text-xl text-brand-primary-light">{t('offerings.service4.sub')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="heading-2 text-brand-primary text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {t('demo.section_title')}
              </h2>
              <p className="text-xl md:text-2xl text-brand-primary-light font-semibold mb-4">
                {t('demo.headline')}
              </p>
              <p className="text-lg md:text-xl text-tsunaimi-gray-dark">
                {t('demo.subheadline')}
              </p>
            </div>
            <div className="py-8">
              <DemoCards />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-b from-brand-primary-light to-brand-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-2 text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
              {t('final_cta.headline')}
            </h2>
            <div className="text-xl md:text-2xl text-tsunaimi-gray-light mb-8 space-y-2">
              <p>{t('final_cta.subheadline1')}</p>
              <p>{t('final_cta.subheadline2')}</p>
            </div>
            <button 
              onClick={handleContactClick}
              className="inline-block px-8 py-3 bg-white text-brand-primary hover:bg-tsunaimi-gray-light transition-colors font-bold rounded-lg"
            >
              {t('final_cta.button_text')}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
} 