'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface Agent {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

export default function AIAgentsPage() {
  const t = useTranslations('ai_agents');
  const params = useParams();
  const locale = params.locale as string;

  const agents: Agent[] = [
    {
      id: 'candidate-mapping',
      title: t('candidate_mapping.title'),
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      image: '/images/agents/candidate-mapping.jpg',
      link: `/${locale}/ai-agents/candidate-mapping`
    },
    // Add more agents here as they become available
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="h-48 bg-gradient-to-b from-[#7057A0] to-[#251C6B] flex items-center justify-center pt-14">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
          {t('title')}
        </h1>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Description */}
          <div className="mb-12">
            <p className="text-lg md:text-xl text-[#111827]">
              {t('description')}
            </p>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {agents.map((agent) => (
              <Link 
                key={agent.id} 
                href={agent.link}
                className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={agent.image}
                    alt={agent.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-[#251C6B] mb-4 group-hover:text-[#7057A0] transition-colors">
                    {agent.title}
                  </h2>
                  <p className="text-gray-600">
                    {agent.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Visual separator before footer */}
      <div className="h-24 bg-gradient-to-b from-white to-[#F3F4F6]" />
    </div>
  );
} 