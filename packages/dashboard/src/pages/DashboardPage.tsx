import { useState } from 'react';
import { UsageStats } from '../components/UsageStats';
import { ApiKeyDisplay } from '../components/ApiKeyDisplay';
import { QuickStart } from '../components/QuickStart';
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
      <QuickStart />
    </DashboardLayout>
  );
}
