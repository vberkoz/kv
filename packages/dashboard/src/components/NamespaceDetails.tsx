import { useState, useEffect } from 'react';
import StoredItems from './StoredItems';
import ApiTester from './ApiTester';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/Dialog';
import { Button } from './ui/Button';

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
            <Button variant="ghost" size="sm" onClick={() => setError('')}>✕</Button>
          </div>
        </div>
      )}

      <Dialog open={!!viewData} onOpenChange={(open) => !open && setViewData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Value: {viewData?.key}</DialogTitle>
            <DialogDescription>JSON value stored in this key</DialogDescription>
          </DialogHeader>
          <pre className="bg-gray-900 text-green-400 p-3 rounded overflow-x-auto text-xs max-h-60 font-mono">
            {JSON.stringify(viewData?.value, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <code className="bg-gray-100 px-1 rounded">{deleteConfirm?.key}</code>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
