import { useEffect, useState } from 'react';

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
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/usage', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Usage Statistics</h2>
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span>Requests</span>
          <span>{usage.usage.requests.toLocaleString()} / {usage.limits.requests.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${requestPercent}%` }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <span>Storage</span>
          <span>{(usage.usage.storage / 1024 / 1024 / 1024).toFixed(2)} GB / {(usage.limits.storage / 1024 / 1024 / 1024).toFixed(0)} GB</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${storagePercent}%` }} />
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600">Plan: <span className="font-semibold">{usage.plan}</span></p>
    </div>
  );
}
