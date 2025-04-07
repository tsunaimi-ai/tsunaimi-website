import { SearchResult, SearchResponse } from './api-client';

export const mockSearchResults: SearchResult[] = [
  {
    linkedin_id: "1",
    name: "John Doe",
    title: "Senior Software Engineer",
    company: "Google",
    location: "Mountain View, CA",
    profile_url: "https://linkedin.com/in/johndoe",
    relevance_score: 0.95,
    last_updated: "2024-03-20T10:00:00Z"
  },
  {
    linkedin_id: "2",
    name: "Jane Smith",
    title: "Full Stack Developer",
    company: "Microsoft",
    location: "Seattle, WA",
    profile_url: "https://linkedin.com/in/janesmith",
    relevance_score: 0.85,
    last_updated: "2024-03-19T15:30:00Z"
  },
  {
    linkedin_id: "3",
    name: "Alex Johnson",
    title: "Frontend Developer",
    company: "Amazon",
    location: "San Francisco, CA",
    profile_url: "https://linkedin.com/in/alexjohnson",
    relevance_score: 0.75,
    last_updated: "2024-03-18T09:15:00Z"
  }
];

export const generateMockResponse = (query: any): SearchResponse => {
  return {
    query_id: Math.random().toString(36).substring(7),
    total_results: mockSearchResults.length,
    results: mockSearchResults,
    execution_time: 0.5,
    created_at: new Date().toISOString()
  };
}; 