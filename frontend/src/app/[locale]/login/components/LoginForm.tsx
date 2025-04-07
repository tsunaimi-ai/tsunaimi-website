'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const initialFormData: LoginFormData = {
  email: '',
  password: '',
  rememberMe: false,
};

export default function LoginForm() {
  const t = useTranslations('login');
  const { login } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const [formData, setFormData] = useState<LoginFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(formData.email, formData.password, formData.rememberMe);
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        // Handle specific error messages from the backend
        if (err.message.includes('Invalid credentials')) {
          setError(t('form.error_invalid_credentials'));
        } else if (err.message.includes('Email not verified')) {
          setError(t('form.error.emailNotVerified'));
        } else if (err.message.includes('Account locked')) {
          setError(t('form.error.accountLocked'));
        } else {
          setError(t('form.error.generic'));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#111827]">
            {t('field.email')}
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-[#7057A0] focus:border-[#7057A0] sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#111827]">
            {t('field.password')}
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-[#7057A0] focus:border-[#7057A0] sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-[#7057A0] focus:ring-[#7057A0] border-[#D1D5DB] rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-[#111827]">
              {t('form.rememberMe')}
            </label>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7057A0] hover:bg-[#5A4690] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7057A0] disabled:opacity-50"
          >
            {isLoading ? t('form.signingIn') : t('form.submit')}
          </button>
        </div>

        <div className="text-sm text-center">
          <span className="text-[#111827]">{t('noAccount')}</span>{' '}
          <a href={`/${locale}/register`} className="font-medium text-[#7057A0] hover:text-[#5A4690]">
            {t('registerLink')}
          </a>
        </div>
      </form>
    </div>
  );
} 