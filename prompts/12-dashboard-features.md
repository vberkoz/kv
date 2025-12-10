# Agent Prompt 12: Dashboard Core Features

## Required Skills
- **Data visualization**: Charts, metrics display, real-time updates, chart libraries
- **CRUD interfaces**: Create, read, update, delete operations, form handling
- **User experience**: Intuitive navigation, information hierarchy, responsive design
- **API integration**: Error handling, loading states, optimistic updates
- **React components**: Complex state management, component composition, hooks
- **Clipboard API**: Copy-to-clipboard functionality, user feedback

## Context
From brainstorm dashboard features:
- API key management (create, revoke, rotate)
- Usage statistics (requests, storage)
- Namespace management
- Plan details and billing

## Exact File Structure
```
packages/dashboard/
└── src/
    ├── pages/
    │   ├── DashboardPage.tsx
    │   └── NamespacesPage.tsx
    └── components/
        ├── UsageStats.tsx
        └── ApiKeyDisplay.tsx
```

## Implementation Requirements

### 1. src/components/UsageStats.tsx
```typescript
import { useEffect, useState } from 'react';

interface Usage {
  usage: { requests: number; storage: number };
  limits: { requests: number; storage: number };
  plan: string;
}

export function UsageStats() {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/usage`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsage(data);
    };
    fetchUsage();
  }, []);

  if (!usage) return <div>Loading...</div>;

  const requestPercent = (usage.usage.requests / usage.limits.requests) * 100;
  const storagePercent = (usage.usage.storage / usage.limits.storage) * 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Usage Statistics</h2>
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span>Requests</span>
          <span>{usage.usage.requests.toLocaleString()} / {usage.limits.requests.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${requestPercent}%` }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <span>Storage</span>
          <span>{(usage.usage.storage / 1024 / 1024 / 1024).toFixed(2)} GB / {(usage.limits.storage / 1024 / 1024 / 1024).toFixed(0)} GB</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${storagePercent}%` }} />
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600">Plan: <span className="font-semibold">{usage.plan}</span></p>
    </div>
  );
}
```

### 2. src/components/ApiKeyDisplay.tsx
```typescript
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
```

### 3. src/pages/DashboardPage.tsx
```typescript
import { UsageStats } from '../components/UsageStats';
import { ApiKeyDisplay } from '../components/ApiKeyDisplay';

export function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <UsageStats />
        <ApiKeyDisplay />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Quick Start</h2>
        <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto">
          <code>{`curl -X PUT "https://api.kv.vberkoz.com/v1/myapp/user:123" \\
  -H "Authorization: Bearer ${localStorage.getItem('apiKey') || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"value": {"name": "John"}}'`}</code>
        </pre>
      </div>
    </div>
  );
}
```

### 4. src/pages/NamespacesPage.tsx
```typescript
import { useState, useEffect } from 'react';

interface Namespace {
  name: string;
  createdAt: string;
}

export function NamespacesPage() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchNamespaces = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/namespaces`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setNamespaces(data.namespaces);
  };

  useEffect(() => {
    fetchNamespaces();
  }, []);

  const createNamespace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    await fetch(`${import.meta.env.VITE_API_URL}/v1/namespaces`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName })
    });
    setNewName('');
    setLoading(false);
    fetchNamespaces();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Namespaces</h1>
      <form onSubmit={createNamespace} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="namespace-name"
          pattern="[a-z0-9-]{1,50}"
          className="flex-1 p-3 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Create
        </button>
      </form>
      <div className="bg-white rounded-lg shadow">
        {namespaces.map((ns) => (
          <div key={ns.name} className="p-4 border-b last:border-b-0">
            <div className="font-semibold">{ns.name}</div>
            <div className="text-sm text-gray-600">Created: {new Date(ns.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Success Criteria
- [ ] Dashboard displays usage statistics
- [ ] API key can be copied to clipboard
- [ ] Usage bars show correct percentages
- [ ] Namespaces can be created and listed
- [ ] Quick start code example works
- [ ] All components responsive