'use client';

import { useTranslations } from 'next-intl';

export default function ManifestoContent() {
  const t = useTranslations('aboutus.manifesto');

  const renderBlock = (blockNumber: number, lineCount: number) => {
    return (
      <div className="mb-6">
        {Array.from({ length: lineCount }).map((_, i) => (
          <p 
            key={`block${blockNumber}_line${i + 1}`}
            className="text-lg md:text-xl text-[#111827] leading-relaxed whitespace-pre-line"
          >
            {t(`block${blockNumber}.line${i + 1}`)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="h-48 bg-gradient-to-b from-[#7057A0] to-[#251C6B] flex items-center justify-center pt-14">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
          {t('page_title')}
        </h1>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <div className="mb-12">
            <p className="text-lg md:text-xl text-[#111827] italic">
              {t('title')}
            </p>
          </div>

          {/* Blocks */}
          <div className="space-y-8">
            {renderBlock(1, 2)}
            {renderBlock(2, 4)}
            {renderBlock(3, 4)}
            {renderBlock(4, 3)}
            {renderBlock(5, 3)}
            {renderBlock(6, 5)}
            {renderBlock(7, 2)}
          </div>
        </div>
      </div>

      {/* Visual separator before footer */}
      <div className="h-24 bg-gradient-to-b from-white to-[#F3F4F6]" />
    </div>
  );
} 