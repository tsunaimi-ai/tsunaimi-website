import createIntlMiddleware from 'next-intl/middleware';
import { authMiddleware } from './src/middleware/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Create the intl middleware
const intlMiddleware = createIntlMiddleware({
  // Configure the supported locales
  locales: ['en', 'fr'],
  
  // Use English as the default locale
  defaultLocale: 'en',

  // Always require locale prefix
  localePrefix: 'always'
});

// Main middleware function
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Debug logging
  console.error('DEBUG - Main Middleware - Pathname:', pathname);
  
  // First, handle internationalization
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware returned a redirect response, return it immediately
  if (intlResponse instanceof NextResponse && intlResponse.status !== 200) {
    console.error('DEBUG - Main Middleware - Intl Redirect:', intlResponse.status, intlResponse.headers.get('location'));
    return intlResponse;
  }

  // Then handle authentication
  const authResponse = authMiddleware(request);
  
  // Debug logging for auth response
  if (authResponse instanceof NextResponse) {
    console.error('DEBUG - Main Middleware - Auth Response Status:', authResponse.status);
    console.error('DEBUG - Main Middleware - Auth Response Headers:', Object.fromEntries(authResponse.headers.entries()));
    console.error('DEBUG - Main Middleware - Auth Response URL:', authResponse.url);
    // Add a custom header to make it visible in the browser
    authResponse.headers.set('X-Main-Middleware', 'processed');
  }
  
  return authResponse;
}

export const config = {
  // Match all pathnames except for:
  // - API routes (/api/*)
  // - Next.js specific files (_next/*)
  matcher: ['/((?!api|_next).*)']
}; 