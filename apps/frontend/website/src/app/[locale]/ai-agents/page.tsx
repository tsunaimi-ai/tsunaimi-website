'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function AIAgentsOverview() {
  const t = useTranslations('ai_agents');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 pt-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary-light to-brand-primary"></div>
          <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-20"></div>
        </div>
        <div className="container relative z-10 px-4">
          <div className="max-w-6xl mx-auto text-center space-y-6">
            <div className="space-y-4">
              <h1 className="heading-1 text-white text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {t('title')}
              </h1>
              <p className="text-xl md:text-2xl text-tsunaimi-gray-light leading-relaxed max-w-4xl mx-auto">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-6 order-1 lg:order-1">
                <h2 className="text-2xl md:text-3xl font-bold text-brand-primary">
                  {t('section1.title')}
                </h2>
                <div className="space-y-4 text-lg text-tsunaimi-gray-dark leading-relaxed">
                  <p>{t('section1.part1')}</p>
                  <p>{t('section1.part2')}</p>
                  <p className="font-medium text-brand-primary-light">{t('section1.part3')}</p>
                  <p className="font-medium">{t('section1.part4')}</p>
                </div>
              </div>
              
              {/* Image */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl order-2 lg:order-2">
                <Image
                  src="/assets/images/from_build_to_value.png"
                  alt={t('section1.title')}
                  fill
                  className="object-contain bg-white"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 