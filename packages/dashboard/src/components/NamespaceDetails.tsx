import { useState, useEffect } from 'react';
import StoredItems from './StoredItems';
import ApiTester from './ApiTester';

interface ViewData {
  key: string;
  value: any;
}

interface DeleteConfirm {
  key: string;
}

interface NamespaceDetailsProps {
  namespace: string;
  apiKey: string;
}

export default function NamespaceDetails({ namespace, apiKey }: NamespaceDetailsProps) {
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewData, setViewData] = useState<ViewData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null);
  const [error, setError] = useState('');

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/${namespace}`, {
        headers: { 'x-api-key': apiKey }
      });
      const data = await res.json();
      setKeys(data.keys?.map((k: any) => k.key) || []);
    } catch (error) {
      console.error('Failed to fetch keys:', error);
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [namespace]);

  const handleGetValue = async (key: string) => {
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/${namespace}/${key}`, {
        headers: { 'x-api-key': apiKey }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch value');
      } else {
        setViewData({ key, value: data.value });
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteValue = (key: string) => {
    setDeleteConfirm({ key });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/${namespace}/${deleteConfirm.key}`, {
        method: 'DELETE',
        headers: { 'x-api-key': apiKey }
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete');
      } else {
        fetchKeys();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="p-4 bg-gray-50 border-t">
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded p-3">
          <div className="flex items-start gap-2">
            <span className="text-red-600 text-lg">⚠</span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-red-900 mb-1">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        </div>
      )}

      {viewData && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded p-3">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-sm text-blue-900">Value: {viewData.key}</h4>
            <button onClick={() => setViewData(null)} className="text-blue-400 hover:text-blue-600">✕</button>
          </div>
          <pre className="bg-gray-900 text-green-400 p-3 rounded overflow-x-auto text-xs max-h-60 font-mono">
            {JSON.stringify(viewData.value, null, 2)}
          </pre>
        </div>
      )}

      {deleteConfirm && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded p-3">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-lg">⚠</span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-yellow-900 mb-1">Confirm Delete</h4>
              <p className="text-sm text-yellow-700 mb-3">Delete <code className="bg-yellow-100 px-1 rounded">{deleteConfirm.key}</code>?</p>
              <div className="flex gap-2">
                <button onClick={confirmDelete} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-600 text-sm">Loading...</div>
      ) : (
        <>
          <StoredItems
            keys={keys}
            onGetValue={handleGetValue}
            onDeleteValue={handleDeleteValue}
          />
          <ApiTester
            namespace={namespace}
            apiKey={apiKey}
            keys={keys}
            onRefresh={fetchKeys}
          />
        </>
      )}
    </div>
  );
}
