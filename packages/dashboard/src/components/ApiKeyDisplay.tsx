import { useState } from 'react';
import { useApiKey } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';

export function ApiKeyDisplay() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { data, isLoading } = useApiKey();
  const apiKey = data?.apiKey || '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast({
      title: 'API key copied to clipboard!',
      variant: 'success',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <h2 className="text-lg md:text-xl font-bold">API Key</h2>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={isLoading ? 'Loading...' : apiKey}
            readOnly
            className={`w-full p-2 md:p-3 border rounded font-mono text-xs md:text-sm overflow-x-auto transition-all duration-300 ${
              copied ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-300 bg-gray-50'
            }`}
          />
          {copied && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 animate-scale-in">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        <button
          onClick={copyToClipboard}
          disabled={isLoading || !apiKey}
          className={`px-4 py-2 rounded whitespace-nowrap disabled:opacity-50 transition-all duration-300 flex items-center gap-2 ${
            copied 
              ? 'bg-green-600 hover:bg-green-700 text-white scale-105' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="mt-3 flex items-start gap-2 text-xs md:text-sm text-gray-600 bg-blue-50 p-3 rounded">
        <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Keep this key secret. Use it in the <code className="bg-white px-1 py-0.5 rounded text-blue-600">x-api-key</code> header.</span>
      </div>
    </div>
  );
}
