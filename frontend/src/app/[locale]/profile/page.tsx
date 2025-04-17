'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface UserProfile {
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  last_login?: string;
}

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const t = useTranslations('profile');
  const params = useParams();
  const locale = params.locale as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-48 bg-gradient-to-b from-[#7057A0] to-[#251C6B] flex items-center justify-center pt-14">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            {t('title')}
          </h1>
        </div>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7057A0]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-48 bg-gradient-to-b from-[#7057A0] to-[#251C6B] flex items-center justify-center pt-14">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            {t('title')}
          </h1>
        </div>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl text-red-500 mb-4">{t('error')}</h2>
            <p className="text-xl text-[#111827]">{error}</p>
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

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/2 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#7057A0] mb-2">{t('fullName')}</label>
                    <p className="text-2xl text-[#251C6B] font-medium">{profile?.full_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#7057A0] mb-2">{t('email')}</label>
                    <p className="text-2xl text-[#251C6B] font-medium">{profile?.email}</p>
                  </div>
                </div>

                <div className="w-full md:w-1/2 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#7057A0] mb-2">{t('status')}</label>
                    <p className="text-2xl">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                        profile?.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {profile?.is_active ? t('active') : t('inactive')}
                      </span>
                    </p>
                  </div>

                  {profile?.last_login && (
                    <div>
                      <label className="block text-sm font-medium text-[#7057A0] mb-2">Last Login</label>
                      <p className="text-2xl text-[#251C6B] font-medium">
                        {new Date(profile.last_login).toLocaleString(locale)}
                      </p>
                    </div>
                  )}
                </div>
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