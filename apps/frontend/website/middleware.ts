import createIntlMiddleware from 'next-intl/middleware';
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

// List of paths that should show the coming soon page
const COMING_SOON_PATHS = [
  '/vision',
  '/team',
  '/approach',
];

// Main middleware function
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // First, handle internationalization
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware returned a redirect response, return it immediately
  if (intlResponse instanceof NextResponse && intlResponse.status !== 200) {
    return intlResponse;
  }

  // Handle coming soon redirects
  const locale = pathname.match(/^\/[a-z]{2}(?=\/|$)/)?.[0]?.slice(1) || 'en';
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
  
  const isComingSoonPath = COMING_SOON_PATHS.some(path => 
    pathWithoutLocale.includes(path)
  );
  
  if (isComingSoonPath) {
    return NextResponse.redirect(new URL(`/${locale}/coming-soon`, request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  // Match all pathnames except for:
  // - API routes (/api/*)
  // - Next.js specific files (_next/*)
  matcher: ['/((?!api|_next).*)']
}; 