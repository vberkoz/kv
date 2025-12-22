import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useNamespaces, useCreateNamespace, useApiKey } from '../hooks/useApi';
import NamespaceDetails from '../components/NamespaceDetails';

export default function NamespacesPage() {
  const [newName, setNewName] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { data, isLoading } = useNamespaces();
  const { data: apiKeyData } = useApiKey();
  const createMutation = useCreateNamespace();
  const namespaces = data?.namespaces || [];
  const apiKey = apiKeyData?.apiKey || '';

  const createNamespace = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(newName);
    setNewName('');
  };

  const toggleExpanded = (name: string) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <DashboardLayout>
        <h1 className="text-3xl font-bold mb-8">Namespaces</h1>
        <form onSubmit={createNamespace} className="mb-6 flex flex-col sm:flex-row gap-2">
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
            disabled={createMutation.isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Create
          </button>
        </form>
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-4 text-gray-600 text-center">Loading...</div>
          ) : namespaces.length === 0 ? (
            <div className="p-4 text-gray-600 text-center">No namespaces yet. Create one above.</div>
          ) : (
            namespaces.map((ns: { name: string; createdAt: string }) => (
              <div key={ns.name} className="border-b last:border-b-0">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                  onClick={() => toggleExpanded(ns.name)}
                >
                  <div>
                    <div className="font-semibold">{ns.name}</div>
                    <div className="text-sm text-gray-600">Created: {new Date(ns.createdAt).toLocaleDateString()}</div>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${expanded[ns.name] ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                {expanded[ns.name] && <NamespaceDetails namespace={ns.name} apiKey={apiKey} />}
              </div>
            ))
          )}
        </div>
    </DashboardLayout>
  );
}
