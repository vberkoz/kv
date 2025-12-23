import { useState } from 'react';
import CodeExamples from './CodeExamples';
import { Button } from './ui/Button';

interface ApiTesterProps {
  namespace: string;
  apiKey: string;
  keys: string[];
  onRefresh: () => void;
}

export default function ApiTester({ namespace, apiKey, keys, onRefresh }: ApiTesterProps) {
  const [tab, setTab] = useState<'GET' | 'PUT' | 'DELETE' | 'LIST'>('PUT');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('{"name": "John"}');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const executeRequest = async (method: string, url: string, body?: any) => {
    setLoading(true);
    setResponse('');
    setError('');
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'x-api-key': apiKey,
          ...(body && { 'Content-Type': 'application/json' })
        },
        ...(body && { body: JSON.stringify(body) })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`${res.status} ${res.statusText}: ${data.error || 'Request failed'}`);
      } else {
        setResponse(JSON.stringify(data, null, 2));
      }
      onRefresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGet = () => {
    if (!key) return;
    executeRequest('GET', `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/${namespace}/${key}`);
  };

  const handlePut = () => {
    if (!key) return;
    try {
      const parsedValue = JSON.parse(value);
      executeRequest('PUT', `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/${namespace}/${key}`, { value: parsedValue });
    } catch {
      setError('Invalid JSON format');
    }
  };

  const handleDelete = () => {
    if (!key) return;
    executeRequest('DELETE', `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/${namespace}/${key}`);
  };

  const handleList = () => {
    executeRequest('GET', `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/${namespace}`);
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-semibold mb-3">API Tester</h3>
      
      <div className="flex gap-2 mb-4">
        {(['PUT', 'GET', 'DELETE', 'LIST'] as const).map(t => (
          <Button
            key={t}
            variant={tab === t ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {tab === 'PUT' && (
          <>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Key (e.g., user:123)"
              className="w-full p-2 border rounded text-sm"
            />
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Value (JSON)"
              className="w-full p-2 border rounded text-sm font-mono"
              rows={4}
            />
            <Button
              onClick={handlePut}
              disabled={loading || !key}
              className="w-full"
            >
              {loading ? 'Sending...' : 'PUT Value'}
            </Button>
          </>
        )}

        {tab === 'GET' && (
          <>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="">Select a key</option>
              {keys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <Button
              onClick={handleGet}
              disabled={loading || !key}
              className="w-full"
            >
              {loading ? 'Fetching...' : 'GET Value'}
            </Button>
          </>
        )}

        {tab === 'DELETE' && (
          <>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="">Select a key</option>
              {keys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <Button
              onClick={handleDelete}
              disabled={loading || !key}
              variant="destructive"
              className="w-full"
            >
              {loading ? 'Deleting...' : 'DELETE Value'}
            </Button>
          </>
        )}

        {tab === 'LIST' && (
          <Button
            onClick={handleList}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Fetching...' : 'LIST All Keys'}
          </Button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-start gap-2">
              <span className="text-red-600 text-lg">⚠</span>
              <div>
                <h4 className="font-semibold text-sm text-red-900 mb-1">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {response && (
          <div>
            <h4 className="font-semibold text-sm mb-1 text-green-700">✓ Response:</h4>
            <pre className="bg-gray-900 text-green-400 p-3 rounded overflow-x-auto text-xs max-h-60 font-mono">
              {response}
            </pre>
          </div>
        )}

        <CodeExamples
          namespace={namespace}
          apiKey={apiKey}
          operation={tab}
          keyName={key || 'user:123'}
        />
      </div>
    </div>
  );
}
