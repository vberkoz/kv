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
    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
      <h2 className="text-lg md:text-xl font-bold mb-4">API Key</h2>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={apiKey}
          readOnly
          className="flex-1 p-2 md:p-3 border rounded bg-gray-50 font-mono text-xs md:text-sm overflow-x-auto"
        />
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="mt-2 text-xs md:text-sm text-gray-600">Keep this key secret. Use it in the Authorization header.</p>
    </div>
  );
}
