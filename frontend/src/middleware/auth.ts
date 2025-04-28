import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that require authentication (without locale prefix)
const PROTECTED_PATHS: string[] = [
  // Add other protected paths here
];

// List of paths that should redirect to home if user is already authenticated
const AUTH_PATHS = [
  '/login',
  '/register',
  // Add other auth-related paths here
];

// List of paths that should show the coming soon page
const COMING_SOON_PATHS = [
  '/vision',
  '/team',
  '/approach',
  // Add other coming soon paths here
];

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has('access_token');

  // Get the locale from the pathname or default to 'en'
  const locale = pathname.match(/^\/[a-z]{2}(?=\/|$)/)?.[0]?.slice(1) || 'en';

  // Remove locale prefix for path matching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');

  // First, check if it's a protected route
  const isProtectedPath = PROTECTED_PATHS.some(path => 
    pathWithoutLocale.includes(path)
  );

  if (isProtectedPath && !isAuthenticated) {
    // Construct the redirect URL with locale prefix
    const redirectUrl = new URL(`/${locale}/login`, request.url);
    
    // Store the original URL to redirect back after login
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('redirectTo', pathname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5, // 5 minutes
    });
    
    return response;
  }

  // Then check if it's a coming soon path
  const isComingSoonPath = COMING_SOON_PATHS.some(path => 
    pathWithoutLocale.includes(path)
  );
  if (isComingSoonPath) {
    return NextResponse.redirect(new URL(`/${locale}/coming-soon`, request.url));
  }

  // Finally, check if trying to access auth pages while already authenticated
  const isAuthPath = AUTH_PATHS.some(path => 
    pathWithoutLocale.includes(path)
  );
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // If we get here, the path is valid and the user's auth state matches the requirements
  return NextResponse.next();
} 