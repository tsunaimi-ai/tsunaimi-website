'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import ContactFormWrapper from '../components/ContactFormWrapper';
import { RobotIcon, BrainIcon, ClockIcon, RocketIcon } from '../components/Icons';

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#7057A0] to-[#251C6B]"></div>
        </div>
        <div className="container relative z-10 px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Image placeholder */}
            <div className="w-full lg:w-1/2 relative aspect-square lg:aspect-auto lg:h-[600px] bg-[#7057A0]/50 rounded-2xl animate-pulse"></div>
            {/* Content placeholder */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="h-12 bg-white/20 rounded-lg animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-8 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="h-8 bg-white/20 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-14 w-48 bg-white/20 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
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

  const handleContactClick = () => {
    setIsContactFormOpen(true);
  };

  const handleLinkedInClick = () => {
    window.open('https://www.linkedin.com/company/tsunaimi', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#7057A0] to-[#251C6B]"></div>
          <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-20"></div>
        </div>
        <div className="container relative z-10 px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Image on the left */}
            <div className="w-full lg:w-1/2 relative aspect-square lg:aspect-auto lg:h-[600px]">
              <Image
                src="/assets/images/hero1.jpeg"
                alt="Futuristic AI Scene"
                fill
                className="object-cover rounded-2xl"
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Content on the right */}
            <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
              <h1 className="heading-1 text-[#FFFFFF] text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {t('hero.headline')}
              </h1>
              <div className="text-xl md:text-2xl lg:text-3xl text-[#E5E7EB] leading-relaxed space-y-4">
                <p>{t('hero.subheadline1')}</p>
                <p>{t('hero.subheadline2')}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-8">
                <button 
                  onClick={handleLinkedInClick}
                  className="bg-[#7057A0] hover:bg-[#251C6B] text-white text-xl font-bold py-4 px-8 rounded-lg transition-colors"
                >
                  {t('hero.cta_button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="heading-2 text-[#251C6B] text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {t('different.section_title')}
              </h2>
              <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#7057A0]">
                {t('different.headline')}
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 text-[#7057A0]">
                    <RobotIcon className="w-full h-full" />
                  </div>
                  <p className="text-xl md:text-2xl text-[#111827]">
                    {t('different.subheadline1')}
                  </p>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 text-[#7057A0]">
                    <BrainIcon className="w-full h-full" />
                  </div>
                  <p className="text-xl md:text-2xl text-[#111827]">
                    {t('different.subheadline2')}
                  </p>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 text-[#7057A0]">
                    <ClockIcon className="w-full h-full" />
                  </div>
                  <p className="text-xl md:text-2xl text-[#111827]">
                    {t('different.subheadline3')}
                  </p>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 text-[#7057A0]">
                    <RocketIcon className="w-full h-full" />
                  </div>
                  <p className="text-xl md:text-2xl text-[#111827]">
                    {t('different.subheadline4')}
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-12">
                <button 
                  onClick={handleLinkedInClick}
                  className="bg-[#7057A0] hover:bg-[#251C6B] text-white text-xl font-bold py-4 px-8 rounded-lg transition-colors"
                >
                  {t('different.cta_button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="heading-2 text-[#251C6B] text-3xl md:text-4xl lg:text-5xl font-bold">
                {t('offerings.section_title')}
              </h2>
              <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#7057A0] mt-4">
                {t('offerings.headline')}
              </p>
              <p className="text-xl md:text-2xl text-[#111827] mt-2">
                {t('offerings.subheadline')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
                <h3 className="text-xl md:text-2xl font-bold text-[#251C6B]">{t('offerings.service1.title')}</h3>
                <p className="text-lg md:text-xl text-[#111827]">{t('offerings.service1.desc')}</p>
                <p className="text-lg md:text-xl text-[#7057A0]">{t('offerings.service1.sub')}</p>
              </div>

              <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
                <h3 className="text-xl md:text-2xl font-bold text-[#251C6B]">{t('offerings.service2.title')}</h3>
                <p className="text-lg md:text-xl text-[#111827]">{t('offerings.service2.desc')}</p>
                <p className="text-lg md:text-xl text-[#7057A0]">{t('offerings.service2.sub')}</p>
              </div>

              <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
                <h3 className="text-xl md:text-2xl font-bold text-[#251C6B]">{t('offerings.service3.title')}</h3>
                <p className="text-lg md:text-xl text-[#111827]">{t('offerings.service3.desc')}</p>
                <p className="text-lg md:text-xl text-[#7057A0]">{t('offerings.service3.sub')}</p>
              </div>

              <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
                <h3 className="text-xl md:text-2xl font-bold text-[#251C6B]">{t('offerings.service4.title')}</h3>
                <p className="text-lg md:text-xl text-[#111827]">{t('offerings.service4.desc')}</p>
                <p className="text-lg md:text-xl text-[#7057A0]">{t('offerings.service4.sub')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              {/* Content on the left */}
              <div className="w-full lg:w-1/2 space-y-12 text-center lg:text-left">
                <h2 className="heading-2 text-[#251C6B] text-3xl md:text-4xl lg:text-5xl font-bold">
                  {t('why_us.section_title')}
                </h2>
                
                <div className="space-y-4">
                  <p className="text-xl md:text-2xl lg:text-3xl text-[#111827] leading-[1.4]">
                    {t('why_us.headline1')}
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl text-[#111827] leading-[1.4]">
                    {t('why_us.headline2')}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#7057A0] leading-[1.4]">
                    {t('why_us.subheadline1')}
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#7057A0] leading-[1.4]">
                    {t('why_us.subheadline2')}
                  </p>
                </div>
              </div>
              {/* Image on the right */}
              <div className="w-full lg:w-1/2 relative aspect-[3/4] lg:aspect-[2/3]">
                <Image
                  src="/assets/images/whyus1.jpeg"
                  alt="Futuristic Startup Working Scene"
                  fill
                  className="object-cover rounded-2xl"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="eager"
                  fetchPriority="auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-b from-[#7057A0] to-[#251C6B]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-2 text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
              {t('final_cta.headline')}
            </h2>
            <div className="text-xl md:text-2xl text-[#E5E7EB] mb-8 space-y-2">
              <p>{t('final_cta.subheadline1')}</p>
              <p>{t('final_cta.subheadline2')}</p>
            </div>
            <button 
              onClick={handleContactClick}
              className="inline-block px-8 py-3 bg-white text-[#251C6B] hover:bg-[#E5E7EB] transition-colors font-bold rounded-lg"
            >
              {t('final_cta.button_text')}
            </button>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      {mounted && isContactFormOpen && (
        <ContactFormWrapper 
          isOpen={isContactFormOpen} 
          onClose={() => setIsContactFormOpen(false)} 
          locale={locale} 
          messages={null}
        />
      )}
    </div>
  );
} 