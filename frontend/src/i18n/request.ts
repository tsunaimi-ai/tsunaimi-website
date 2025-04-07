import {getRequestConfig} from 'next-intl/server';

// Define supported locales and default locale
const defaultLocale = 'en';
const locales = ['en', 'fr'];

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`../messages/${locale || defaultLocale}.json`)).default,
  locale: locale || defaultLocale
})); 