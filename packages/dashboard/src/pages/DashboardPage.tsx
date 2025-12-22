import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsageStats } from '../components/UsageStats';
import { ApiKeyDisplay } from '../components/ApiKeyDisplay';
import { QuickStart } from '../components/QuickStart';
import { UpgradePrompt } from '../components/UpgradePrompt';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useNamespaces } from '../hooks/useApi';

const ONBOARDING_KEY = 'kv_onboarding_completed';

export default function DashboardPage() {
  const [usage, setUsage] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { data } = useNamespaces();
  const navigate = useNavigate();
  const namespaces = data?.namespaces || [];

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed && namespaces.length === 0) {
      setShowOnboarding(true);
    }
  }, [namespaces.length]);

  const handleStartOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
    navigate('/namespaces');
  };

  const handleDismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Dashboard</h1>
      {usage && <UpgradePrompt usage={usage.usage} limits={usage.limits} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <UsageStats onUsageLoad={setUsage} />
        <ApiKeyDisplay />
      </div>
      <QuickStart />

      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to KV Storage!</h2>
              <p className="text-gray-600 mb-6">Let's get you started in 3 simple steps:</p>
              <div className="text-left space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <div className="font-semibold">Create a Namespace</div>
                    <div className="text-sm text-gray-600">Organize your data with namespaces</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <div className="font-semibold">Get Your API Key</div>
                    <div className="text-sm text-gray-600">Use it to authenticate your requests</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <div className="font-semibold">Start Storing Data</div>
                    <div className="text-sm text-gray-600">Use our API or SDK to store key-value pairs</div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleStartOnboarding}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                Create Your First Namespace
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
