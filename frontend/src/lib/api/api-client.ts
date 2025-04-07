// API Client for candidate-mapping-agent backend
const BACKEND_URL = 'http://localhost:3001'; // Middleware API URL
const API_PREFIX = '/api/v1';

// Search types
export enum SearchField {
  KEYWORDS = "keywords",
  TITLE = "title",
  COMPANY = "company",
  LOCATION = "location",
  INDUSTRY = "industry"
}

export enum SearchOperator {
  CONTAINS = "contains",
  EQUALS = "equals",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with"
}

export interface SearchCriteria {
  field: SearchField;
  value: string;
  operator: SearchOperator;
}

export interface SearchQuery {
  criteria: SearchCriteria[];
  max_results?: number;
  include_details?: boolean;
  sort_by?: string;
  sort_order?: string;
}

export interface SearchResult {
  linkedin_id: string;
  name: string;
  title?: string;
  company?: string;
  location?: string;
  profile_url: string;
  relevance_score: number;
  last_updated: string;
}

export interface SearchResponse {
  query_id: string;
  total_results: number;
  results: SearchResult[];
  execution_time: number;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    };

    // Only set Content-Type if not already set
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${BACKEND_URL}${API_PREFIX}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API request failed: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
    }

    return response.json() as Promise<T>;
  }

  private async fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${this.token}`,
    };

    console.log('Debug - Request headers:', headers);
    console.log('Debug - Token being used:', this.token);

    return this.fetch<T>(endpoint, {
      ...options,
      headers,
    });
  }

  // Search endpoints
  async search(query: SearchQuery): Promise<SearchResponse> {
    return this.fetchWithAuth<SearchResponse>('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });
  }

  async getSearchResults(queryId: string): Promise<SearchResponse> {
    return this.fetchWithAuth<SearchResponse>(`/search/${queryId}`);
  }

  async getProfile(profileId: string): Promise<any> {
    return this.fetchWithAuth(`/search/profiles/${profileId}`);
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Create form data for OAuth2 password flow
      const formData = new URLSearchParams();
      formData.append('username', email);  // OAuth2 requires 'username' field
      formData.append('password', password);
      
      // Send request with form data
      const response = await fetch(`${BACKEND_URL}${API_PREFIX}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Middleware API not found. Please make sure the middleware service is running at ' + BACKEND_URL);
        }
        const error = await response.json() as { detail?: string };
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json() as LoginResponse;
      this.setToken(data.access_token);
      return data;
    } catch (error: unknown) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to middleware API. Please make sure the middleware service is running at ' + BACKEND_URL);
      }
      throw error;
    }
  }

  async register(email: string, password: string): Promise<void> {
    // Registration can use JSON as it's not OAuth2
    const response = await fetch(`${BACKEND_URL}${API_PREFIX}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json() as { detail?: string };
      throw new Error(error.detail || 'Registration failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const response = await this.fetch<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    this.setToken(response.access_token);
    return response;
  }

  // LinkedIn auth endpoints
  async getLinkedInAuthUrl(redirectUri: string): Promise<{ url: string }> {
    return this.fetch<{ url: string }>(`/auth/linkedin/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`);
  }

  async handleLinkedInCallback(code: string, state: string): Promise<{ access_token: string; refresh_token: string }> {
    const response = await this.fetch<{ access_token: string; refresh_token: string }>('/auth/linkedin/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
    this.setToken(response.access_token);
    return response;
  }
}

// Export a singleton instance
export const apiClient = new ApiClient(); 