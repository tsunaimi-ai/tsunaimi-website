export enum SearchField {
  KEYWORDS = "keywords",    // Search across all text fields
  TITLE = "title",         // Job title
  COMPANY = "company",     // Company name
  LOCATION = "location",   // Geographic location
  INDUSTRY = "industry"    // Industry sector
}

export enum SearchOperator {
  CONTAINS = "contains",       // Field contains the value
  EQUALS = "equals",          // Field exactly matches the value
  STARTS_WITH = "starts_with", // Field starts with the value
  ENDS_WITH = "ends_with"     // Field ends with the value
}

export interface SearchCriteria {
  field: SearchField;
  value: string;
  operator: SearchOperator;
}

export interface SearchQuery {
  criteria: SearchCriteria[];
  max_results?: number;      // Default: 100
  include_details?: boolean; // Default: true
  sort_by?: string;         // Optional: field to sort by
  sort_order?: string;      // Optional: "asc" or "desc"
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

export interface ApiError {
  detail: string;
  status_code: number;
}

export type SearchStatus = "idle" | "pending" | "running" | "completed" | "failed";

export interface SearchState {
  currentQuery: SearchQuery | null;
  queryId: string | null;
  results: SearchResult[];
  status: SearchStatus;
  error: string | null;
  totalResults: number;
  executionTime: number;
} 