'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatPage() {
  const t = useTranslations('chat');
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-48 bg-gradient-to-b from-[#7057A0] to-[#251C6B] flex items-center justify-center pt-14">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            {t('title')}
          </h1>
        </div>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-2xl text-[#251C6B] mb-4">{t('notAuthenticated')}</p>
            <p className="text-xl text-[#111827]">{t('pleaseLogin')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="h-48 bg-gradient-to-b from-[#7057A0] to-[#251C6B] flex items-center justify-center pt-14">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
          {t('title')}
        </h1>
      </div>

      {/* Chat Window */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Chat Messages Area */}
            <div className="h-[600px] overflow-y-auto p-6 space-y-4">
              {/* Messages will be rendered here */}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder={t('inputPlaceholder')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7057A0]"
                />
                <button
                  className="bg-[#7057A0] hover:bg-[#251C6B] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {t('send')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual separator before footer */}
      <div className="h-24 bg-gradient-to-b from-white to-[#F3F4F6]" />
    </div>
  );
} 