---
title: Quick Start
description: Get started with KV Storage in 2 minutes
---

Get your first API call working in under 2 minutes.

## 1. Create Account

Sign up at [dashboard.kv.vberkoz.com](https://dashboard.kv.vberkoz.com/signup)

## 2. Get API Key

Your API key is automatically generated on the dashboard. Copy it.

## 3. Create Namespace

```bash
# Via dashboard or API
POST /v1/namespaces
{ "name": "myapp" }
```

## 4. Store Data

```bash
curl -X PUT "https://api.kv.vberkoz.com/v1/myapp/user:123" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value":{"name":"John","email":"john@example.com"}}'
```

## 5. Retrieve Data

```bash
curl "https://api.kv.vberkoz.com/v1/myapp/user:123" \
  -H "x-api-key: YOUR_API_KEY"
```

## Using JavaScript SDK

```bash
npm install @kv-storage/client
```

```javascript
import { KVClient } from '@kv-storage/client';

const kv = new KVClient('YOUR_API_KEY');

await kv.put('myapp', 'user:123', { name: 'John' });
const { value } = await kv.get('myapp', 'user:123');
```

## Next Steps

- [Authentication](/getting-started/authentication)
- [REST API Reference](/api/rest)
- [JavaScript SDK](/api/javascript)
