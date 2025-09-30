'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function AIAgentsOverview() {
  const t = useTranslations('ai_agents');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary-light to-brand-primary"></div>
          <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-20"></div>
        </div>
        <div className="container relative z-10 px-4 py-12">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <div className="space-y-6">
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

      {/* Section 1 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-brand-primary">
                  {t('section1.title')}
                </h2>
                <p className="text-lg text-tsunaimi-gray-dark leading-relaxed">
                  {t('section1.description')}
                </p>
              </div>
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/assets/images/1-AI Chatbot.png"
                  alt={t('section1.title')}
                  fill
                  className="object-contain bg-white"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="py-20 bg-tsunaimi-background-light">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-xl lg:order-1">
                <Image
                  src="/assets/images/2-PoC_AI Agent.png"
                  alt={t('section2.title')}
                  fill
                  className="object-contain bg-white"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="space-y-6 lg:order-2">
                <h2 className="text-2xl md:text-3xl font-bold text-brand-primary">
                  {t('section2.title')}
                </h2>
                <p className="text-lg text-tsunaimi-gray-dark leading-relaxed">
                  {t('section2.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-brand-primary">
                  {t('section3.title')}
                </h2>
                <p className="text-lg text-tsunaimi-gray-dark leading-relaxed">
                  {t('section3.description')}
                </p>
              </div>
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/assets/images/3-Prod-ready_AI Agent.png"
                  alt={t('section3.title')}
                  fill
                  className="object-contain bg-white"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="py-20 bg-tsunaimi-background-light">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-xl lg:order-1">
                <Image
                  src="/assets/images/4-TsunAImi platform.png"
                  alt={t('section4.title')}
                  fill
                  className="object-contain bg-white"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="space-y-6 lg:order-2">
                <h2 className="text-2xl md:text-3xl font-bold text-brand-primary">
                  {t('section4.title')}
                </h2>
                <p className="text-lg text-tsunaimi-gray-dark leading-relaxed">
                  {t('section4.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 