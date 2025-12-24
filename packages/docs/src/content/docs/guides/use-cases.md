---
title: Use Cases
description: Common use cases for KV Storage
---

## User Sessions

Store session data with automatic expiration:

```javascript
await kv.put('myapp', `session:${sessionId}`, {
  userId: '123',
  loginTime: Date.now()
});
```

## Feature Flags

Toggle features dynamically:

```javascript
const { value } = await kv.get('myapp', 'config:features');
if (value.newFeature) {
  // Show new feature
}
```

## Cache Layer

Cache API responses:

```javascript
const cacheKey = `cache:api:${endpoint}`;
let data = await kv.get('myapp', cacheKey).catch(() => null);

if (!data) {
  data = await fetchFromAPI(endpoint);
  await kv.put('myapp', cacheKey, data);
}
```

## User Preferences

Store user settings:

```javascript
await kv.put('myapp', `user:${userId}:settings`, {
  theme: 'dark',
  notifications: true
});
```

## Real-time Counters

Track analytics:

```javascript
const date = new Date().toISOString().split('T')[0];
const key = `stats:daily:${date}`;
const { value } = await kv.get('myapp', key);
await kv.put('myapp', key, { count: (value?.count || 0) + 1 });
```
