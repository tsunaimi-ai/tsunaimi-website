'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCreate } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterForm() {
  const t = useTranslations('auth.register');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<UserCreate>({
    email: '',
    password: '',
    full_name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('form.errors.registrationFailed'));
      }

      // Show success message
      setSuccess(t('form.success.registrationComplete'));
      
      // Automatically log in the user
      await login(formData.email, formData.password, true);
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push(`/${locale}`);
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : t('form.errors.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="text-green-500 text-sm p-3 bg-green-50 rounded-lg" role="alert">
          {success}
        </div>
      )}
      
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-[#251C6B] mb-1">
          {t('form.fullNameLabel')}
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7057A0]"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#251C6B] mb-1">
          {t('form.emailLabel')}
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7057A0]"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#251C6B] mb-1">
          {t('form.passwordLabel')}
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7057A0]"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-[#7057A0] hover:bg-[#251C6B] text-white font-bold py-3 px-6 rounded-lg transition-colors ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-busy={isLoading}
      >
        {isLoading ? t('form.submitting') : t('form.submit')}
      </button>

      <div className="mt-4 text-center text-sm text-[#251C6B]">
        {t('form.alreadyHaveAccount')}{' '}
        <Link href={`/${locale}/login`} className="text-[#7057A0] hover:text-[#251C6B] font-medium">
          {t('form.loginLink')}
        </Link>
      </div>
    </form>
  );
} 