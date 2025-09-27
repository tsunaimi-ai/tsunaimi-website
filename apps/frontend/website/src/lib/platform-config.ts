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

// Cache for runtime configuration
let configCache: PlatformConfig | null = null;

/**
 * Get platform configuration from runtime API
 * Fetches from server-side API to get environment-specific config
 */
async function fetchRuntimeConfig(): Promise<PlatformConfig> {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error(`Config API failed: ${response.status}`);
    }
    
    const data = await response.json();
    const baseUrl = data.platformUrl;
    
    if (!baseUrl) {
      throw new Error('Platform URL not configured');
    }
    
    return {
      baseUrl,
      loginUrl: `${baseUrl}/auth/signin`,
      dashboardUrl: `${baseUrl}/dashboard`,
      demoAgentUrl: `${baseUrl}/gateway/paul-calendar-demo`,
      consoleCalendarUrl: `${baseUrl}/console/calendar`,
      contactUrl: `${baseUrl}/contact`,
    };
  } catch (error) {
    console.error('Failed to fetch runtime config:', error);
    throw new Error('Failed to load platform configuration');
  }
}

/**
 * Get platform configuration (async)
 * Uses runtime API for environment-specific configuration
 */
export async function getPlatformConfig(): Promise<PlatformConfig> {
  if (configCache) {
    return configCache;
  }
  
  configCache = await fetchRuntimeConfig();
  return configCache;
}

/**
 * Get platform URL for different actions (async)
 */
export async function getPlatformUrl(type: 'signin' | 'dashboard' | 'demo' | 'console-calendar' | 'contact'): Promise<string> {
  const config = await getPlatformConfig();
  
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
