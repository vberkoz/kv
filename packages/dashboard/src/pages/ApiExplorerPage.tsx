import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const CODE_EXAMPLES = {
  curl: (ns: string, key: string, apiKey: string) => `curl -X PUT "https://api.kv.vberkoz.com/v1/${ns}/${key}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"value": {"name": "John"}}'`,
  javascript: (ns: string, key: string, apiKey: string) => `const response = await fetch('https://api.kv.vberkoz.com/v1/${ns}/${key}', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ value: { name: 'John' } })
});`,
  python: (ns: string, key: string, apiKey: string) => `import requests

response = requests.put(
    'https://api.kv.vberkoz.com/v1/${ns}/${key}',
    headers={'Authorization': 'Bearer ${apiKey}'},
    json={'value': {'name': 'John'}}
)`
};

export default function ApiExplorerPage() {
  const [namespace, setNamespace] = useState('myapp');
  const [key, setKey] = useState('user:123');
  const [value, setValue] = useState('{"name": "John"}');
  const [response, setResponse] = useState('');
  const [language, setLanguage] = useState<'curl' | 'javascript' | 'python'>('curl');
  const { logout } = useAuth();
  const apiKey = localStorage.getItem('apiKey') || '';

  const testApi = async () => {
    try {
      const res = await fetch(`/api/v1/${namespace}/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: JSON.parse(value) })
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
    }
  };

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
          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">API Explorer</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Test Request</h2>
            <input
              type="text"
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              placeholder="Namespace"
              className="w-full p-3 border rounded mb-3"
            />
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Key"
              className="w-full p-3 border rounded mb-3"
            />
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Value (JSON)"
              className="w-full p-3 border rounded mb-3 font-mono text-sm"
              rows={5}
            />
            <button
              onClick={testApi}
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
            >
              Send Request
            </button>
            {response && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Response:</h3>
                <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto text-sm">
                  {response}
                </pre>
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Code Examples</h2>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setLanguage('curl')}
                className={`px-4 py-2 rounded ${language === 'curl' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                cURL
              </button>
              <button
                onClick={() => setLanguage('javascript')}
                className={`px-4 py-2 rounded ${language === 'javascript' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                JavaScript
              </button>
              <button
                onClick={() => setLanguage('python')}
                className={`px-4 py-2 rounded ${language === 'python' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Python
              </button>
            </div>
            <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto text-sm">
              <code>{CODE_EXAMPLES[language](namespace, key, apiKey)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
