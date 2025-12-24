---
title: REST API
description: Complete REST API reference
---

Base URL: `https://api.kv.vberkoz.com/v1`

## Endpoints

### Store Value

```http
PUT /{namespace}/{key}
```

**Headers:**
- `x-api-key: YOUR_API_KEY`
- `Content-Type: application/json`

**Body:**
```json
{
  "value": { "any": "json data" }
}
```

### Get Value

```http
GET /{namespace}/{key}
```

**Headers:**
- `x-api-key: YOUR_API_KEY`

**Response:**
```json
{
  "value": { "any": "json data" }
}
```

### Delete Value

```http
DELETE /{namespace}/{key}
```

**Headers:**
- `x-api-key: YOUR_API_KEY`

### List Keys

```http
GET /{namespace}?prefix=optional
```

**Headers:**
- `x-api-key: YOUR_API_KEY`

**Response:**
```json
{
  "keys": ["key1", "key2"]
}
```

## Error Responses

- `400` - Invalid input
- `401` - Invalid API key
- `404` - Key not found
- `429` - Rate limit exceeded
- `500` - Server error
