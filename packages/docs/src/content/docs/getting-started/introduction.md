---
title: Introduction
description: Get started with KV Storage - Serverless key-value storage API
---

KV Storage is a serverless key-value database with a simple REST API. Store any JSON data and retrieve it instantly from anywhere in the world.

## Features

- **Simple REST API** - Store, retrieve, list, and delete JSON data
- **Namespace Isolation** - Organize data with namespaces
- **API Key Authentication** - Secure access with API keys
- **Usage Tracking** - Monitor API calls and storage usage
- **Multiple Plans** - Free tier and paid plans for scaling
- **Official SDKs** - JavaScript/TypeScript client library

## Quick Example

```bash
# Store a value
curl -X PUT "https://api.kv.vberkoz.com/v1/myapp/user:123" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value":{"name":"John","email":"john@example.com"}}'

# Retrieve a value
curl "https://api.kv.vberkoz.com/v1/myapp/user:123" \
  -H "x-api-key: YOUR_API_KEY"
```

## Use Cases

- User sessions and preferences
- Feature flags and configuration
- Cache layer for APIs
- Real-time counters and analytics
- Temporary data storage

## Next Steps

- [Quick Start](/getting-started/quickstart) - Get started in 2 minutes
- [REST API](/api/rest) - Complete API reference
- [JavaScript SDK](/api/javascript) - Use the official SDK
