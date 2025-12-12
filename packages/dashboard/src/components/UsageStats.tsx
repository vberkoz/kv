import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.kv.vberkoz.com';

interface Usage {
  usage: { requests: number; storage: number };
  limits: { requests: number; storage: number };
  plan: string;
}

interface UsageStatsProps {
  onUsageLoad?: (usage: Usage) => void;
}

export function UsageStats({ onUsageLoad }: UsageStatsProps) {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      const tokensStr = localStorage.getItem('cognitoTokens');
      if (!tokensStr) return;
      
      const tokens = JSON.parse(tokensStr);
      const res = await fetch(`${API_URL}/v1/usage`, {
        headers: { 'Authorization': `Bearer ${tokens.accessToken}` }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch usage:', res.status);
        return;
      }
      
      const data = await res.json();
      setUsage(data);
      if (onUsageLoad) onUsageLoad(data);
    };
    fetchUsage();
  }, [onUsageLoad]);

  if (!usage) return <div>Loading...</div>;

  const requestPercent = (usage.usage.requests / usage.limits.requests) * 100;
  const storagePercent = (usage.usage.storage / usage.limits.storage) * 100;

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
      <h2 className="text-lg md:text-xl font-bold mb-4">Usage Statistics</h2>
      <div className="mb-4">
        <div className="flex justify-between mb-2 text-sm md:text-base">
          <span>Requests</span>
          <span className="text-xs md:text-sm">{usage.usage.requests.toLocaleString()} / {usage.limits.requests.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${requestPercent}%` }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-2 text-sm md:text-base">
          <span>Storage</span>
          <span className="text-xs md:text-sm">{(usage.usage.storage / 1024 / 1024 / 1024).toFixed(2)} GB / {(usage.limits.storage / 1024 / 1024 / 1024).toFixed(0)} GB</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${storagePercent}%` }} />
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600">Plan: <span className="font-semibold">{usage.plan}</span></p>
    </div>
  );
}
