import { useState } from 'react';

export function ApiKeyDisplay() {
  const [apiKey] = useState(localStorage.getItem('apiKey') || '');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">API Key</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={apiKey}
          readOnly
          className="flex-1 p-3 border rounded bg-gray-50 font-mono text-sm"
        />
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-600">Keep this key secret. Use it in the Authorization header.</p>
    </div>
  );
}
