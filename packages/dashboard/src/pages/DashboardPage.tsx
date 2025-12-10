import { useAuth } from '../context/AuthContext';
import { UsageStats } from '../components/UsageStats';
import { ApiKeyDisplay } from '../components/ApiKeyDisplay';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex gap-6">
            <Link to="/dashboard" className="text-xl font-bold">KV Storage</Link>
            <Link to="/namespaces" className="text-gray-600 hover:text-gray-900">Namespaces</Link>
            <Link to="/explorer" className="text-gray-600 hover:text-gray-900">API Explorer</Link>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <UsageStats />
          <ApiKeyDisplay />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Quick Start</h2>
          <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto">
            <code>{`curl -X PUT "https://api.kv.vberkoz.com/v1/myapp/user:123" \\
  -H "Authorization: Bearer ${localStorage.getItem('apiKey') || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"value": {"name": "John"}}'`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
