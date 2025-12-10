import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Namespace {
  name: string;
  createdAt: string;
}

export default function NamespacesPage() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const fetchNamespaces = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/v1/namespaces', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setNamespaces(data.namespaces);
  };

  useEffect(() => {
    fetchNamespaces();
  }, []);

  const createNamespace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    await fetch('/api/v1/namespaces', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName })
    });
    setNewName('');
    setLoading(false);
    fetchNamespaces();
  };

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
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Namespaces</h1>
        <form onSubmit={createNamespace} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="namespace-name"
            pattern="[a-z0-9-]{1,50}"
            className="flex-1 p-3 border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Create
          </button>
        </form>
        <div className="bg-white rounded-lg shadow">
          {namespaces.length === 0 ? (
            <div className="p-4 text-gray-600 text-center">No namespaces yet. Create one above.</div>
          ) : (
            namespaces.map((ns) => (
              <div key={ns.name} className="p-4 border-b last:border-b-0">
                <div className="font-semibold">{ns.name}</div>
                <div className="text-sm text-gray-600">Created: {new Date(ns.createdAt).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
