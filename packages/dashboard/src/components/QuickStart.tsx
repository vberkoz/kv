import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function QuickStart() {
  const [apiKey, setApiKey] = useState('YOUR_API_KEY');
  const [exampleNamespace, setExampleNamespace] = useState('my-app');
  const [exampleKey, setExampleKey] = useState('user:demo');
  const { fetchApiKey, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      
      const data = await fetchApiKey();
      if (data) {
        setApiKey(data.apiKey);
        setExampleNamespace(data.exampleNamespace);
        setExampleKey(data.exampleKey);
      }
    };

    loadData();
  }, [fetchApiKey, isAuthenticated]);

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
      <h2 className="text-lg md:text-xl font-bold mb-4">Quick Start</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Store Data (PUT):</h3>
          <pre className="bg-gray-900 text-white p-3 md:p-4 rounded overflow-x-auto text-xs md:text-sm">
            <code>{`curl -X PUT "https://api.kv.vberkoz.com/v1/${exampleNamespace}/${exampleKey}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"value": {"message": "Hello World!"}}'`}</code>
          </pre>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Retrieve Data (GET):</h3>
          <pre className="bg-gray-900 text-white p-3 md:p-4 rounded overflow-x-auto text-xs md:text-sm">
            <code>{`curl "https://api.kv.vberkoz.com/v1/${exampleNamespace}/${exampleKey}" \\
  -H "Authorization: Bearer ${apiKey}"`}</code>
          </pre>
        </div>
      </div>
      <p className="mt-2 text-xs md:text-sm text-gray-600">
        Try these examples with your <code>{exampleNamespace}</code> namespace!
      </p>
    </div>
  );
}