import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
const PRICE_IDS = {
  starter: import.meta.env.VITE_PADDLE_STARTER_PRICE_ID,
  pro: import.meta.env.VITE_PADDLE_PRO_PRICE_ID,
  scale: import.meta.env.VITE_PADDLE_SCALE_PRICE_ID,
  business: import.meta.env.VITE_PADDLE_BUSINESS_PRICE_ID
};

const PLANS = [
  { id: 'starter', name: 'Starter', price: '$9', requests: '100K', storage: '1GB' },
  { id: 'pro', name: 'Pro', price: '$29', requests: '1M', storage: '10GB' },
  { id: 'scale', name: 'Scale', price: '$99', requests: '10M', storage: '100GB' },
  { id: 'business', name: 'Business', price: '$299', requests: 'Custom', storage: 'Custom' }
];

export default function PricingPage() {
  const { user } = useAuth();

  useEffect(() => {
    if ((window as any).Paddle) {
      (window as any).Paddle.Environment.set('sandbox');
      (window as any).Paddle.Initialize({
        token: PADDLE_CLIENT_TOKEN
      });
    }
  }, []);

  const handleSubscribe = (planId: string) => {
    const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS];
    
    (window as any).Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email: user?.email },
      successCallback: () => {
        window.location.href = '/dashboard?subscribed=true';
      }
    });
  };

  return (
    <DashboardLayout>
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Pricing Plans</h1>
      
      <div className="grid md:grid-cols-4 gap-6">
        {PLANS.map(plan => (
          <div key={plan.id} className="border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <p className="text-3xl font-bold mb-4">{plan.price}<span className="text-sm text-gray-500">/mo</span></p>
            <ul className="space-y-2 mb-6">
              <li>✓ {plan.requests} requests/month</li>
              <li>✓ {plan.storage} storage</li>
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
    </DashboardLayout>
  );
}
