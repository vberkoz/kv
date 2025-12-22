import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useNamespaces, useCreateNamespace, useApiKey } from '../hooks/useApi';
import NamespaceDetails from '../components/NamespaceDetails';
import { namespaceSchema, type NamespaceFormData } from '../lib/validation';

export default function NamespacesPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [keyCounts, setKeyCounts] = useState<Record<string, number>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const { data, isLoading } = useNamespaces();
  const { data: apiKeyData } = useApiKey();
  const createMutation = useCreateNamespace();
  const namespaces = data?.namespaces || [];
  const apiKey = apiKeyData?.apiKey || '';
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<NamespaceFormData>({
    resolver: zodResolver(namespaceSchema)
  });

  useEffect(() => {
    if (!apiKey || namespaces.length === 0) return;
    
    const fetchKeyCounts = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        namespaces.map(async (ns: { name: string }) => {
          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/${ns.name}`, {
              headers: { 'x-api-key': apiKey }
            });
            const data = await res.json();
            counts[ns.name] = data.keys?.length || 0;
          } catch {
            counts[ns.name] = 0;
          }
        })
      );
      setKeyCounts(counts);
    };
    
    fetchKeyCounts();
  }, [apiKey, namespaces.length]);

  const createNamespace = async (data: NamespaceFormData) => {
    await createMutation.mutateAsync(data.name);
    reset();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleExpanded = (name: string) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Namespaces</h1>
          <p className="text-gray-600">Organize your data with namespaces. Each namespace is isolated and has its own set of keys.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          {showSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fade-in">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-medium">Namespace created successfully!</span>
            </div>
          )}
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Namespace
          </h2>
          <form onSubmit={handleSubmit(createNamespace)} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                {...register('name')}
                type="text"
                placeholder="my-namespace"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name ? (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.name.message}
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Use lowercase letters, numbers, and hyphens only (1-50 characters)
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 justify-center font-medium"
            >
              {createMutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create
                </>
              )}
            </button>
          </form>
        </div>
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : namespaces.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No namespaces yet</h3>
              <p className="text-gray-600 mb-4">Create your first namespace to start storing data</p>
              <div className="inline-flex items-center gap-2 text-sm text-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Use the form above to get started
              </div>
            </div>
          ) : (
            namespaces.map((ns: { name: string; createdAt: string }) => {
              const keyCount = keyCounts[ns.name] ?? 0;
              const isActive = keyCount > 0;
              const daysSinceCreation = Math.floor((Date.now() - new Date(ns.createdAt).getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={ns.name} className="border-b last:border-b-0">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center border-l-4 border-transparent hover:border-blue-500"
                    onClick={() => toggleExpanded(ns.name)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold text-lg">{ns.name}</div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isActive ? 'Active' : 'Empty'}
                        </span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          {keyCount} {keyCount === 1 ? 'key' : 'keys'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Created {daysSinceCreation === 0 ? 'today' : `${daysSinceCreation} ${daysSinceCreation === 1 ? 'day' : 'days'} ago`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 text-gray-400 ${expanded[ns.name] ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  {expanded[ns.name] && <NamespaceDetails namespace={ns.name} apiKey={apiKey} />}
                </div>
              );
            })
          )}
        </div>
    </DashboardLayout>
  );
}
