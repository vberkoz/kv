import { Link } from 'react-router-dom';

interface UpgradePromptProps {
  usage: { requests: number; storage: number };
  limits: { requests: number; storage: number };
}

export function UpgradePrompt({ usage, limits }: UpgradePromptProps) {
  const requestPercent = (usage.requests / limits.requests) * 100;
  const storagePercent = (usage.storage / limits.storage) * 100;
  const maxPercent = Math.max(requestPercent, storagePercent);
  
  if (maxPercent < 80) return null;
  
  const level = maxPercent >= 95 ? 'critical' : 'warning';
  const bgColor = level === 'critical' ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500';
  
  return (
    <div className={`${bgColor} border-l-4 p-4 mb-6 rounded`}>
      <p className="font-semibold mb-2">
        {level === 'critical' ? '⚠️ Critical: ' : '⚡ Warning: '}
        You've used {maxPercent.toFixed(0)}% of your plan limit
      </p>
      <p className="text-sm mb-2">
        {level === 'critical' 
          ? 'Your service may be interrupted. Upgrade now to continue.'
          : 'Consider upgrading to avoid service interruption.'}
      </p>
      <Link to="/pricing" className="text-blue-600 underline font-semibold">
        Upgrade now →
      </Link>
    </div>
  );
}
