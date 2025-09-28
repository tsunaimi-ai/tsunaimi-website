'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { getPlatformUrl } from '@/lib/platform-config';
import Image from 'next/image';

interface DemoCardProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  image?: React.ReactNode;
  isHovered?: boolean;
  onHover?: (hovered: boolean) => void;
}

function DemoCard({ title, description, buttonText, onClick, image, isHovered, onHover }: DemoCardProps) {
  return (
    <div 
      className="bg-tsunaimi-background-light rounded-lg p-6 transition-all duration-300 cursor-pointer transform-gpu perspective-1000"
      style={{
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(112, 87, 160, 0.25), 0 0 0 1px rgba(112, 87, 160, 0.05)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        transformStyle: 'preserve-3d'
      }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onClick={onClick}
    >
      {/* Image/Icon Section */}
      <div className="flex justify-center mb-6">
        {image || (
          <div className="w-32 h-32 bg-gradient-to-br from-brand-primary-light to-brand-primary rounded-xl flex items-center justify-center">
            <div className="w-16 h-16 bg-white/20 rounded-lg"></div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="text-center space-y-4">
        <h3 className="text-xl md:text-2xl font-bold text-brand-primary">{title}</h3>
        <p className="text-tsunaimi-gray-dark leading-relaxed">{description}</p>
        <button 
          className={`inline-flex items-center text-brand-primary-light font-semibold transition-colors ${
            isHovered ? 'text-brand-primary' : 'hover:text-brand-primary'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {buttonText}
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function DemoCards() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const t = useTranslations('home.demo');

  const handleTryDemo = async () => {
    try {
      // Redirect to the demo agent (environment-dependent)
      const demoUrl = await getPlatformUrl('demo');
      window.open(demoUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to get demo URL:', error);
      alert('Unable to connect to platform. Please try again.');
    }
  };

  const handleDeployAgent = async () => {
    try {
      // Redirect to console calendar
      const consoleUrl = await getPlatformUrl('console-calendar');
      window.open(consoleUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to get console URL:', error);
      alert('Unable to connect to platform. Please try again.');
    }
  };

  // Demo Image Component
         const DemoImage = () => (
           <div className="w-80 h-80 relative rounded-xl overflow-hidden shadow-inner bg-gray-50">
             <Image
               src="/assets/images/gateway-qr-paul-calendar-demo.png"
               alt="Demo Agent QR Code"
               fill
               className="object-contain p-4"
             />
           </div>
         );

  // Deploy Image Component
  const DeployImage = () => (
    <div className="w-80 h-80 relative rounded-xl overflow-hidden shadow-inner bg-gray-50">
      <Image
        src="/assets/images/hybrid-operating-model.jpeg"
        alt="Hybrid Operating Model"
        fill
        className="object-contain p-4"
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <DemoCard
        title={t('try_demo.title')}
        description={t('try_demo.description')}
        buttonText={t('try_demo.button')}
        onClick={handleTryDemo}
        image={<DemoImage />}
        isHovered={hoveredCard === 'demo'}
        onHover={(hovered) => setHoveredCard(hovered ? 'demo' : null)}
      />
      
      <DemoCard
        title={t('deploy_agent.title')}
        description={t('deploy_agent.description')}
        buttonText={t('deploy_agent.button')}
        onClick={handleDeployAgent}
        image={<DeployImage />}
        isHovered={hoveredCard === 'deploy'}
        onHover={(hovered) => setHoveredCard(hovered ? 'deploy' : null)}
      />
    </div>
  );
}
