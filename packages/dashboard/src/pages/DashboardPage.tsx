import { useState } from 'react';
import { UsageStats } from '../components/UsageStats';
import { ApiKeyDisplay } from '../components/ApiKeyDisplay';
import { UpgradePrompt } from '../components/UpgradePrompt';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function DashboardPage() {
  const [usage, setUsage] = useState<any>(null);

  return (
    <DashboardLayout>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Dashboard</h1>
      {usage && <UpgradePrompt usage={usage.usage} limits={usage.limits} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <UsageStats onUsageLoad={setUsage} />
        <ApiKeyDisplay />
      </div>
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <h2 className="text-lg md:text-xl font-bold mb-4">Quick Start</h2>
        <pre className="bg-gray-900 text-white p-3 md:p-4 rounded overflow-x-auto text-xs md:text-sm">
          <code>{`curl -X PUT "https://api.kv.vberkoz.com/v1/myapp/user:123" \\
  -H "Authorization: Bearer ${localStorage.getItem('apiKey') || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"value": {"name": "John"}}'`}</code>
        </pre>
      </div>
    </DashboardLayout>
  );
}
