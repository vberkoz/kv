import { useState, useEffect } from 'react';
import StoredItems from './StoredItems';
import ApiTester from './ApiTester';

interface NamespaceDetailsProps {
  namespace: string;
  apiKey: string;
}

export default function NamespaceDetails({ namespace, apiKey }: NamespaceDetailsProps) {
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/${namespace}/${key}`, {
        headers: { 'x-api-key': apiKey }
      });
      const data = await res.json();
      alert(JSON.stringify(data, null, 2));
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteValue = async (key: string) => {
    if (!confirm(`Delete ${key}?`)) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/${namespace}/${key}`, {
        method: 'DELETE',
        headers: { 'x-api-key': apiKey }
      });
      fetchKeys();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-50 border-t">
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
