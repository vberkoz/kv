import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    Paddle?: any;
  }
}

export default function PricingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initPaddle = () => {
    if (window.Paddle) return;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      window.Paddle?.Setup({
        vendor: parseInt(process.env.VITE_PADDLE_VENDOR_ID || '0'),
        eventCallback: (data: any) => {
          if (data.event === 'Checkout.Complete') {
            window.location.reload();
          }
        }
      });
    };
    document.body.appendChild(script);
  };

  const openCheckout = (priceId: string) => {
    setLoading(true);
    initPaddle();
    
    setTimeout(() => {
      if (window.Paddle) {
        window.Paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          customData: { userId: user?.userId }
        });
      }
      setLoading(false);
    }, 1000);
  };

  const plans = [
    {
      name: 'Trial',
      price: 'Free for 14 days',
      storage: '10GB',
      requests: '100K',
      features: ['All features', 'No credit card required', 'Cancel anytime'],
      current: user?.plan === 'trial',
      isTrial: true
    },
    {
      name: 'Starter',
      price: '$7',
      storage: '25GB',
      requests: '500K',
      features: ['Email support', 'Advanced analytics', 'Cancel anytime'],
      priceId: process.env.VITE_PADDLE_STARTER_PRICE_ID,
      current: user?.plan === 'starter'
    },
    {
      name: 'Pro',
      price: '$19',
      storage: '100GB',
      requests: '1M',
      features: ['Priority support', 'Custom domains', 'Advanced features'],
      priceId: process.env.VITE_PADDLE_PRO_PRICE_ID,
      current: user?.plan === 'pro',
      popular: true
    },
    {
      name: 'Scale',
      price: '$59',
      storage: '250GB',
      requests: '5M',
      features: ['SLA 99.9%', 'Dedicated support', 'Custom integrations'],
      priceId: process.env.VITE_PADDLE_SCALE_PRICE_ID,
      current: user?.plan === 'scale'
    },
    {
      name: 'Business',
      price: '$179',
      storage: '1TB',
      requests: '20M',
      features: ['SLA 99.95%', 'White-label', 'Custom SLA', 'Priority support'],
      priceId: process.env.VITE_PADDLE_BUSINESS_PRICE_ID,
      current: user?.plan === 'business'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex gap-6">
            <Link to="/dashboard" className="text-xl font-bold">KV Storage</Link>
            <Link to="/namespaces" className="text-gray-600 hover:text-gray-900">Namespaces</Link>
            <Link to="/explorer" className="text-gray-600 hover:text-gray-900">API Explorer</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
          </div>
          <button onClick={logout} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Pricing Plans</h1>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {plans.map((plan) => (
            <div key={plan.name} className={`bg-white p-6 rounded-lg shadow ${plan.current ? 'ring-2 ring-blue-600' : ''} ${plan.popular ? 'ring-2 ring-green-500' : ''}`}>
              {plan.current && <div className="text-blue-600 font-semibold mb-2">Current Plan</div>}
              {plan.popular && !plan.current && <div className="text-green-600 font-semibold mb-2">Most Popular</div>}
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="text-3xl font-bold mb-4">{plan.price}<span className="text-lg text-gray-600">/mo</span></div>
              <div className="mb-4">
                <div className="text-gray-600">Storage: {plan.storage}</div>
                <div className="text-gray-600">Requests: {plan.requests}/month</div>
              </div>
              <ul className="mb-6 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-gray-600">✓ {feature}</li>
                ))}
              </ul>
              {plan.isTrial && !plan.current && (
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
                >
                  Start Free Trial
                </button>
              )}
              {plan.priceId && !plan.current && !plan.isTrial && (
                <button
                  onClick={() => openCheckout(plan.priceId!)}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Upgrade'}
                </button>
              )}
              {plan.current && (
                <button disabled className="w-full bg-gray-300 text-gray-600 p-3 rounded cursor-not-allowed">
                  Current Plan
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
