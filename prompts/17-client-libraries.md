# Agent Prompt 17: Client Libraries & SDKs

## Required Skills
- **SDK design**: Consistent APIs, error handling patterns, fluent interfaces
- **Package management**: npm/pip publishing, versioning, semantic versioning
- **Multi-language support**: TypeScript, Python, Go, language-specific patterns
- **Documentation**: API references, usage examples, inline documentation
- **Testing**: Unit tests, integration tests, test coverage, CI/CD
- **HTTP clients**: Request handling, retry logic, timeout management

## Context
From brainstorm growth hacks:
- Open source client libraries - npm, pip packages
- Build in public - Share metrics, learnings, progress

## Implementation Requirements

### 1. TypeScript SDK
```typescript
// packages/sdk-js/src/index.ts
export class KVClient {
  constructor(private apiKey: string, private baseUrl = 'https://api.kv.vberkoz.com') {}

  async get(namespace: string, key: string) {
    const res = await fetch(`${this.baseUrl}/v1/${namespace}/${key}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async put(namespace: string, key: string, value: any) {
    const res = await fetch(`${this.baseUrl}/v1/${namespace}/${key}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async delete(namespace: string, key: string) {
    const res = await fetch(`${this.baseUrl}/v1/${namespace}/${key}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
}

// Usage
const kv = new KVClient('your-api-key');
await kv.put('myapp', 'user:123', { name: 'John' });
const data = await kv.get('myapp', 'user:123');
```

### 2. Python SDK
```python
# packages/sdk-python/kv_storage/client.py
import requests

class KVClient:
    def __init__(self, api_key, base_url='https://api.kv.vberkoz.com'):
        self.api_key = api_key
        self.base_url = base_url
    
    def get(self, namespace, key):
        res = requests.get(
            f'{self.base_url}/v1/{namespace}/{key}',
            headers={'Authorization': f'Bearer {self.api_key}'}
        )
        res.raise_for_status()
        return res.json()
    
    def put(self, namespace, key, value):
        res = requests.put(
            f'{self.base_url}/v1/{namespace}/{key}',
            headers={'Authorization': f'Bearer {self.api_key}'},
            json={'value': value}
        )
        res.raise_for_status()
        return res.json()
    
    def delete(self, namespace, key):
        res = requests.delete(
            f'{self.base_url}/v1/{namespace}/{key}',
            headers={'Authorization': f'Bearer {self.api_key}'}
        )
        res.raise_for_status()

# Usage
kv = KVClient('your-api-key')
kv.put('myapp', 'user:123', {'name': 'John'})
data = kv.get('myapp', 'user:123')
```

### 3. Package Configuration

**package.json (JS)**
```json
{
  "name": "@kv-storage/client",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

**setup.py (Python)**
```python
from setuptools import setup

setup(
    name='kv-storage',
    version='1.0.0',
    packages=['kv_storage'],
    install_requires=['requests']
)
```

## Success Criteria
- [ ] TypeScript SDK published to npm
- [ ] Python SDK published to PyPI
- [ ] Both SDKs have same API surface
- [ ] Error handling works properly
- [ ] README with usage examples