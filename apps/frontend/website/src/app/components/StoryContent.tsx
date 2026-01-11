'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function StoryContent() {
  const t = useTranslations('aboutus.ourstory');

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
      {/* Header with Image */}
      <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/assets/images/ourstory1.jpeg"
            alt="Our Story"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#251C6B]/70 to-[#7057A0]/70" />
        </div>
        
        {/* Title */}
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            {t('title')}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* First block with special styling */}
          <div className="mb-12 text-xl md:text-2xl text-[#251C6B] font-medium">
            {renderBlock(1, 2)}
          </div>

          {/* Rest of the blocks */}
          <div className="space-y-8">
            {renderBlock(2, 4)}
            {renderBlock(3, 3)}
            {renderBlock(4, 1)}
            {renderBlock(5, 2)}
            {renderBlock(6, 3)}
            {renderBlock(7, 2)}
            {renderBlock(8, 3)}
            {renderBlock(9, 2)}
            {renderBlock(10, 2)}
          </div>
        </div>
      </div>

      {/* Visual separator before footer */}
      <div className="h-24 bg-gradient-to-b from-white to-[#F3F4F6]" />
    </div>
  );
} 