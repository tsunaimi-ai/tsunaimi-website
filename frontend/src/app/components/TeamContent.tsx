'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Logo from './Logo';

export default function TeamContent() {
  const t = useTranslations('aboutus.team');

  const teamMembers = ['eric', 'CTO', 'CChatO', 'dev'];

  const getProfileImage = (memberId: string) => {
    // Use team-ech.jpg for the CEO and team-other.jpeg for everyone else
    return memberId === 'eric' ? '/assets/images/team-ech.jpg' : '/assets/images/team-other.jpeg';
  };

  const renderTeamMember = (memberId: string) => {
    // All members will have 2 description lines starting from index 1
    const descriptionCount = 2;
    const startIndex = 1;

    return (
      <div key={memberId} className="flex flex-col md:flex-row gap-4 items-start py-6 first:pt-0 border-t first:border-t-0">
        {/* Profile Image */}
        <div className="w-32 md:w-40 aspect-square rounded-2xl overflow-hidden relative">
          <Image 
            src={getProfileImage(memberId)}
            alt={t(`members.${memberId}.name`)}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 8rem, 10rem"
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-2">
          <h3 className="text-2xl font-bold text-[#251C6B]">
            {t(`members.${memberId}.name`)}
          </h3>
          <p className="text-xl text-[#7057A0]">
            {t(`members.${memberId}.role`)}
          </p>
          <div className="space-y-1">
            {Array.from({ length: descriptionCount }).map((_, index) => (
              <p key={index} className="text-lg text-[#111827]">
                {t(`members.${memberId}.desc.${index + startIndex}`)}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="h-48 bg-gradient-to-b from-[#7057A0] to-[#251C6B] flex items-center justify-center pt-14">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
          {t('title')}
        </h1>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="mb-16 text-center">
            <p className="text-2xl md:text-3xl text-[#251C6B] font-medium mb-8">
              {t('intro.line1')}<br />
              {t('intro.line2')}
            </p>
            <div className="text-xl text-[#111827]">
              <p>{t('intro.line3')}</p>
              <p>{t('intro.line4')}</p>
            </div>
          </div>

          {/* Team members */}
          <div className="space-y-4">
            {teamMembers.map(memberId => renderTeamMember(memberId))}
          </div>
        </div>
      </div>

      {/* Visual separator before footer */}
      <div className="h-24 bg-gradient-to-b from-white to-[#F3F4F6]" />
    </div>
  );
} 