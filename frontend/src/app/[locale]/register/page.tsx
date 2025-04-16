'use client';

import { useTranslations } from 'next-intl';
import RegisterForm from './components/RegisterForm';

export default function RegisterPage() {
  const t = useTranslations('auth.register');

  return (
    <div className="relative">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-8">
          <h2 className="text-2xl font-bold text-[#251C6B] mb-4">
            {t('title')}
          </h2>
          <p className="text-[#7057A0] mb-6">
            {t('description')}
          </p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
} 