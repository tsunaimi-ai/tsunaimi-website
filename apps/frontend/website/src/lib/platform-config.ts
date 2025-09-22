/**
 * Platform Configuration
 * Manages URLs and configuration for the TsunAImi platform
 */

export interface PlatformConfig {
  baseUrl: string;
  loginUrl: string;
  registerUrl: string;
  dashboardUrl: string;
}

/**
 * Get platform configuration from environment variables
 * Throws error if not configured - no fallbacks
 */
export function getPlatformConfig(): PlatformConfig {
  const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL;
  
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_PLATFORM_URL environment variable is required');
  }
  
  return {
    baseUrl,
    loginUrl: `${baseUrl}/auth/signin`,
    registerUrl: `${baseUrl}/auth/signup`, 
    dashboardUrl: `${baseUrl}/dashboard`,
  };
}

/**
 * Get platform URL for different actions
 */
export function getPlatformUrl(type: 'signin' | 'signup' | 'dashboard'): string {
  const config = getPlatformConfig();
  
  switch(type) {
    case 'signin': 
      return config.loginUrl;
    case 'signup': 
      return config.registerUrl;
    case 'dashboard': 
      return config.dashboardUrl;
    default:
      return config.baseUrl;
  }
}
