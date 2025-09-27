/**
 * Platform Configuration
 * Manages URLs and configuration for the TsunAImi platform
 */

export interface PlatformConfig {
  baseUrl: string;
  loginUrl: string;
  dashboardUrl: string;
  demoAgentUrl: string;
  consoleCalendarUrl: string;
  contactUrl: string;
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
    dashboardUrl: `${baseUrl}/dashboard`,
    demoAgentUrl: `${baseUrl}/gateway/demo-agent`,
    consoleCalendarUrl: `${baseUrl}/console/calendar`,
    contactUrl: `${baseUrl}/contact`,
  };
}

/**
 * Get platform URL for different actions
 */
export function getPlatformUrl(type: 'signin' | 'dashboard' | 'demo' | 'console-calendar' | 'contact'): string {
  const config = getPlatformConfig();
  
  switch(type) {
    case 'signin': 
      return config.loginUrl;
    case 'dashboard': 
      return config.dashboardUrl;
    case 'demo':
      return config.demoAgentUrl;
    case 'console-calendar':
      return config.consoleCalendarUrl;
    case 'contact':
      return config.contactUrl;
    default:
      return config.baseUrl;
  }
}
