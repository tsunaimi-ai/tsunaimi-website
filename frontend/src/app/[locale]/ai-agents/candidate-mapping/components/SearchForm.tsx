import { useState } from 'react';
import { SearchField, SearchOperator, SearchQuery, SearchCriteria } from '@/lib/api/api-client';
import { useTranslations } from 'next-intl';

interface SearchFormProps {
  onSubmit: (query: SearchQuery) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function SearchForm({ onSubmit, isLoading, disabled }: SearchFormProps) {
  const t = useTranslations('ai_agents.candidate_mapping');
  const [criteria, setCriteria] = useState<SearchCriteria[]>([
    {
      field: SearchField.KEYWORDS,
      value: "",
      operator: SearchOperator.CONTAINS
    }
  ]);
  const [maxResults, setMaxResults] = useState(100);
  const [sortBy, setSortBy] = useState<string>('relevance_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleAddCriteria = () => {
    setCriteria([...criteria, {
      field: SearchField.KEYWORDS,
      value: "",
      operator: SearchOperator.CONTAINS
    }]);
  };

  const handleRemoveCriteria = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleCriteriaChange = (index: number, field: keyof SearchCriteria, value: string) => {
    const newCriteria = [...criteria];
    newCriteria[index] = {
      ...newCriteria[index],
      [field]: value
    };
    setCriteria(newCriteria);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query: SearchQuery = {
      criteria: criteria.filter(c => c.value.trim() !== ''),
      max_results: maxResults,
      sort_by: sortBy,
      sort_order: sortOrder,
      include_details: true
    };
    onSubmit(query);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Search Criteria */}
      <div className="space-y-4">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="flex-1">
              <select
                value={criterion.field}
                onChange={(e) => handleCriteriaChange(index, 'field', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7057A0] disabled:opacity-50"
                disabled={disabled}
              >
                {Object.values(SearchField).map((field) => (
                  <option key={field} value={field}>
                    {t(`fields.${field.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                value={criterion.operator}
                onChange={(e) => handleCriteriaChange(index, 'operator', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7057A0] disabled:opacity-50"
                disabled={disabled}
              >
                {Object.values(SearchOperator).map((operator) => (
                  <option key={operator} value={operator}>
                    {t(`operators.${operator.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={criterion.value}
                onChange={(e) => handleCriteriaChange(index, 'value', e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7057A0] disabled:opacity-50"
                disabled={disabled}
              />
            </div>
            {criteria.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveCriteria(index)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                disabled={disabled}
                aria-label={t('remove_criteria')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddCriteria}
          className="flex items-center gap-2 px-4 py-2 text-[#7057A0] hover:text-[#251C6B] hover:bg-[#7057A0]/5 rounded-md transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#7057A0] focus:ring-offset-2"
          disabled={disabled}
          aria-label={t('add_criteria')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span>{t('add_criteria')}</span>
        </button>
      </div>

      {/* Search Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('max_results')}
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={maxResults}
            onChange={(e) => setMaxResults(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7057A0] disabled:opacity-50"
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('sort_by')}
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7057A0] disabled:opacity-50"
            disabled={disabled}
          >
            <option value="relevance_score">{t('sort.relevance')}</option>
            <option value="name">{t('sort.name')}</option>
            <option value="title">{t('sort.title')}</option>
            <option value="company">{t('sort.company')}</option>
            <option value="location">{t('sort.location')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('sort_order')}
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7057A0] disabled:opacity-50"
            disabled={disabled}
          >
            <option value="desc">{t('sort.descending')}</option>
            <option value="asc">{t('sort.ascending')}</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || disabled}
          className="px-6 py-2 bg-[#7057A0] text-white rounded-md hover:bg-[#251C6B] transition-colors disabled:opacity-50"
        >
          {isLoading ? t('searching') : t('search')}
        </button>
      </div>
    </form>
  );
} 