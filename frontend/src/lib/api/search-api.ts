import { apiClient, SearchQuery, SearchResult, SearchResponse } from './api-client';

// Error types
export interface ApiError {
  detail: string;
  status_code: number;
}

export class SearchApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'SearchApiError';
  }
}

// Rate limiting
interface RateLimitState {
  calls: number;
  resetTime: number;
  quota: number;
}

class RateLimiter {
  private state: RateLimitState = {
    calls: 0,
    resetTime: Date.now(),
    quota: 100 // Default quota per hour
  };

  private readonly RESET_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

  canMakeRequest(): boolean {
    this.checkReset();
    return this.state.calls < this.state.quota;
  }

  recordRequest(): void {
    this.state.calls++;
  }

  private checkReset(): void {
    if (Date.now() - this.state.resetTime >= this.RESET_INTERVAL) {
      this.state = {
        calls: 0,
        resetTime: Date.now(),
        quota: 100
      };
    }
  }

  getRemainingQuota(): number {
    this.checkReset();
    return this.state.quota - this.state.calls;
  }

  getResetTime(): number {
    return this.state.resetTime;
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// API functions
export const createSearch = async (query: SearchQuery): Promise<string> => {
  if (!rateLimiter.canMakeRequest()) {
    throw new SearchApiError(
      'Rate limit exceeded. Please try again later.',
      429,
      {
        resetTime: rateLimiter.getResetTime(),
        remainingQuota: rateLimiter.getRemainingQuota()
      }
    );
  }

  try {
    rateLimiter.recordRequest();
    const response = await apiClient.search(query);
    return response.query_id;
  } catch (error) {
    if (error instanceof SearchApiError) {
      throw error;
    }
    throw new SearchApiError(
      'Failed to create search query',
      500,
      error
    );
  }
};

export const fetchResults = async (queryId: string): Promise<SearchResponse> => {
  try {
    return await apiClient.getSearchResults(queryId);
  } catch (error) {
    if (error instanceof SearchApiError) {
      throw error;
    }
    throw new SearchApiError(
      'Failed to fetch search results',
      500,
      error
    );
  }
};

export const pollResults = async (
  queryId: string,
  maxAttempts: number = 30,
  interval: number = 2000
): Promise<SearchResponse> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const results = await fetchResults(queryId);
      return results;
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw new SearchApiError(
          'Timeout waiting for results',
          408,
          error
        );
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  throw new SearchApiError('Polling failed', 500);
};

// Cache implementation
interface CacheEntry {
  data: SearchResponse;
  timestamp: number;
}

class SearchCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: SearchResponse): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): SearchResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const searchCache = new SearchCache(); 