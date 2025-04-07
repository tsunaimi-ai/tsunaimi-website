import { useTranslations } from 'next-intl';

interface SearchStatusProps {
  queryId: string;
  status: "idle" | "pending" | "running" | "completed" | "failed";
  totalResults?: number;
  error?: string;
  executionTime?: number;
  remainingQuota?: number;
  resetTime?: number;
}

export default function SearchStatus({ 
  queryId, 
  status, 
  totalResults, 
  error,
  executionTime,
  remainingQuota,
  resetTime
}: SearchStatusProps) {
  const t = useTranslations('ai_agents.candidate_mapping');

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return t('status.running');
      case 'completed':
        return t('status.completed');
      case 'failed':
        return t('status.failed');
      default:
        return t('status.pending');
    }
  };

  const formatTimeUntilReset = () => {
    if (!resetTime) return '';
    const now = Date.now();
    const timeLeft = resetTime - now;
    if (timeLeft <= 0) return '';
    
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="space-y-4">
        {/* Status and Query ID */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            {status === 'running' && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#7057A0]"></div>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {t('query_id')}: {queryId}
          </div>
        </div>

        {/* Progress Bar */}
        {status === 'running' && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#7057A0] h-2 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Results Count, Execution Time, and Rate Limit */}
        {(status === 'completed' || status === 'running') && (
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="space-y-1">
              {totalResults !== undefined && (
                <div>{t('total_results')}: {totalResults}</div>
              )}
              {remainingQuota !== undefined && (
                <div>
                  {t('remaining_quota')}: {remainingQuota}
                  {resetTime && (
                    <span className="ml-2 text-gray-500">
                      ({formatTimeUntilReset()})
                    </span>
                  )}
                </div>
              )}
            </div>
            {executionTime !== undefined && (
              <div>
                {t('execution_time')}: {executionTime.toFixed(2)}s
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 