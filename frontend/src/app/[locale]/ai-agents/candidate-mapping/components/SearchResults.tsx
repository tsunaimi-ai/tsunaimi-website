import { SearchResult } from '@/lib/api/api-client';
import { useTranslations } from 'next-intl';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error?: string;
}

export default function SearchResults({ results, isLoading, error }: SearchResultsProps) {
  const t = useTranslations('ai_agents.candidate_mapping');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7057A0]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t('no_results')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#251C6B]">
          {t('results')} ({results.length})
        </h2>
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <div key={result.linkedin_id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {/* Profile Picture */}
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl text-gray-500">
                  {result.name.charAt(0)}
                </span>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[#251C6B] text-lg">
                      {result.name}
                    </h3>
                    <p className="text-gray-600">{result.title}</p>
                    <p className="text-gray-500">{result.company}</p>
                    <p className="text-gray-500">{result.location}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('relevance_score')}: {Math.round(result.relevance_score * 100)}%
                  </div>
                </div>

                {/* LinkedIn Link */}
                <a 
                  href={result.profile_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-4 text-[#7057A0] hover:text-[#251C6B]"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-.88-.02-2.05-1.248-2.05-1.248 0-1.438 1.014-1.438 1.984v5.67h-3v-11h2.9v1.56h.04c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.835z"/>
                  </svg>
                  {t('view_profile')}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 