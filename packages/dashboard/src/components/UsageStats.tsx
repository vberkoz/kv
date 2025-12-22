import { useEffect } from 'react';
import { useUsage } from '../hooks/useApi';

interface Usage {
  usage: { requests: number; storage: number };
  limits: { requests: number; storage: number };
  plan: string;
}

interface UsageStatsProps {
  onUsageLoad?: (usage: Usage) => void;
}

export function UsageStats({ onUsageLoad }: UsageStatsProps) {
  const { data: usage, isLoading } = useUsage();

  useEffect(() => {
    if (usage && onUsageLoad) onUsageLoad(usage);
  }, [usage, onUsageLoad]);

  if (isLoading) return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-2 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-2 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  const requestPercent = (usage.usage.requests / usage.limits.requests) * 100;
  const storagePercent = (usage.usage.storage / usage.limits.storage) * 100;

  // Determine status colors based on usage
  const getStatusColor = (percent: number) => {
    if (percent >= 90) return 'red';
    if (percent >= 75) return 'yellow';
    return 'blue';
  };

  const requestColor = getStatusColor(requestPercent);
  const storageColor = getStatusColor(storagePercent);

  const colorClasses = {
    blue: { bar: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50' },
    yellow: { bar: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' },
    red: { bar: 'bg-red-600', text: 'text-red-600', bg: 'bg-red-50' }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h2 className="text-lg md:text-xl font-bold">Usage Statistics</h2>
      </div>
      
      <div className={`mb-4 p-3 rounded-lg ${colorClasses[requestColor].bg}`}>
        <div className="flex justify-between mb-2 text-sm md:text-base">
          <span className="font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Requests
          </span>
          <span className={`text-xs md:text-sm font-semibold ${colorClasses[requestColor].text}`}>
            {usage.usage.requests.toLocaleString()} / {usage.limits.requests.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`${colorClasses[requestColor].bar} h-2.5 rounded-full transition-all duration-500`} 
            style={{ width: `${Math.min(requestPercent, 100)}%` }} 
          />
        </div>
        <div className="mt-1 text-xs text-gray-600 text-right">
          {requestPercent.toFixed(1)}% used
        </div>
      </div>
      
      <div className={`p-3 rounded-lg ${colorClasses[storageColor].bg}`}>
        <div className="flex justify-between mb-2 text-sm md:text-base">
          <span className="font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            Storage
          </span>
          <span className={`text-xs md:text-sm font-semibold ${colorClasses[storageColor].text}`}>
            {(usage.usage.storage / 1024 / 1024 / 1024).toFixed(2)} GB / {(usage.limits.storage / 1024 / 1024 / 1024).toFixed(0)} GB
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`${colorClasses[storageColor].bar} h-2.5 rounded-full transition-all duration-500`} 
            style={{ width: `${Math.min(storagePercent, 100)}%` }} 
          />
        </div>
        <div className="mt-1 text-xs text-gray-600 text-right">
          {storagePercent.toFixed(1)}% used
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Plan</span>
          <span className="font-semibold text-base capitalize px-3 py-1 bg-gray-100 rounded-full">{usage.plan}</span>
        </div>
      </div>
    </div>
  );
}
