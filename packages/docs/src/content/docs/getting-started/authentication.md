---
title: Authentication
description: How to authenticate with KV Storage API
---

KV Storage uses API keys for authentication.

## API Keys

API keys are used for all KV operations (GET, PUT, DELETE, LIST).

### Getting Your API Key

1. Sign up at [dashboard.kv.vberkoz.com](https://dashboard.kv.vberkoz.com)
2. Your API key is automatically generated
3. Copy it from the dashboard

### Using API Keys

Include your API key in the `x-api-key` header:

```bash
curl "https://api.kv.vberkoz.com/v1/myapp/key" \
  -H "x-api-key: YOUR_API_KEY"
```

## Security Best Practices

- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Use different keys for dev/staging/prod
