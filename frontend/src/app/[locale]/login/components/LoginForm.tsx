'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFeatures } from '@/contexts/FeatureContext';

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
  const { login, logout, isAuthenticated, isLoading } = useAuth();
  const { showRegistration } = useFeatures();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [formData, setFormData] = useState<LoginFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

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
    setSuccess(null);

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      setSuccess(t('success.login'));
      // Redirect to home page after successful login
      setTimeout(() => {
        router.push(`/${locale}`);
      }, 2000);
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
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
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setSuccess(t('success.logout'));
    } catch (err) {
      setError(t('form.error.logoutFailed'));
    }
  };

  if (isAuthenticated) {
    return (
      <div className="space-y-4">
        {success && (
          <div className="text-green-500 text-sm p-3 bg-green-50 rounded-lg animate-fade-out" role="alert">
            {success}
          </div>
        )}
        <div className="text-center">
          <p className="text-[#251C6B] mb-4">{t('alreadyLoggedIn')}</p>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full bg-[#7057A0] hover:bg-[#251C6B] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? t('form.signingOut') : t('form.logout')}
          </button>
        </div>
      </div>
    );
  }

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

      {success && (
        <div className="text-green-500 text-sm p-3 bg-green-50 rounded-lg animate-fade-out" role="alert">
          {success}
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
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('form.signingIn')}
          </span>
        ) : (
          t('form.submit')
        )}
      </button>

      {showRegistration && (
        <div className="mt-4 text-center text-sm text-[#251C6B]">
          {t('noAccount')}{' '}
          <Link href={`/${locale}/register`} className="text-[#7057A0] hover:text-[#251C6B] font-medium">
            {t('registerLink')}
          </Link>
        </div>
      )}
    </form>
  );
} 