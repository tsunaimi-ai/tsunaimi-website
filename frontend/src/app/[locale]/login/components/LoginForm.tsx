'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#251C6B] mb-1">
          {t('field.email')}
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7057A0]"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#251C6B] mb-1">
          {t('field.password')}
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7057A0]"
        />
      </div>

      <div className="flex items-center">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          checked={formData.rememberMe}
          onChange={handleChange}
          className="h-4 w-4 text-[#7057A0] focus:ring-[#7057A0] border-[#E5E7EB] rounded"
        />
        <label htmlFor="rememberMe" className="ml-2 block text-sm text-[#251C6B]">
          {t('form.rememberMe')}
        </label>
      </div>

      {error && (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-[#7057A0] hover:bg-[#251C6B] text-white font-bold py-3 px-6 rounded-lg transition-colors ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-busy={isLoading}
      >
        {isLoading ? t('form.signingIn') : t('form.submit')}
      </button>

      <div className="mt-4 text-center text-sm text-[#251C6B]">
        {t('noAccount')}{' '}
        <Link href={`/${locale}/register`} className="text-[#7057A0] hover:text-[#251C6B] font-medium">
          {t('registerLink')}
        </Link>
      </div>
    </form>
  );
} 