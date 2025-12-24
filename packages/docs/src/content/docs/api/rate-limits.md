---
title: Rate Limits
description: Understanding rate limits and quotas
---

KV Storage enforces rate limits based on your plan.

## Monthly Quotas

| Plan | Requests/Month | Storage |
|------|----------------|---------|
| Free | 10K | 100MB |
| Starter | 100K | 1GB |
| Pro | 1M | 10GB |
| Scale | 10M | 100GB |
| Business | Custom | Custom |

## Per-Second Limits

| Plan | Requests/Second |
|------|-----------------|
| Free | 10 |
| Starter | 50 |
| Pro | 100 |
| Scale | 500 |
| Business | 1000 |

## Rate Limit Headers

All responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Handling Rate Limits

When you exceed limits, you'll receive a `429` response:

```json
{
  "error": "Rate limit exceeded",
  "statusCode": 429
}
```

**Best Practices:**
- Implement exponential backoff
- Cache responses when possible
- Monitor rate limit headers
- Upgrade plan if needed
