---
title: JavaScript SDK
description: Official JavaScript/TypeScript SDK
---

Official client library for Node.js and browsers.

## Installation

```bash
npm install @kv-storage/client
```

## Usage

```javascript
import { KVClient } from '@kv-storage/client';

const kv = new KVClient('YOUR_API_KEY');
```

## Methods

### put(namespace, key, value)

Store a value.

```javascript
await kv.put('myapp', 'user:123', { name: 'John' });
```

### get(namespace, key)

Retrieve a value.

```javascript
const { value } = await kv.get('myapp', 'user:123');
```

### delete(namespace, key)

Delete a value.

```javascript
await kv.delete('myapp', 'user:123');
```

### list(namespace, prefix?)

List keys with optional prefix.

```javascript
const { keys } = await kv.list('myapp');
const { keys } = await kv.list('myapp', 'user:');
```

## TypeScript Support

Full TypeScript support with type inference:

```typescript
interface User {
  name: string;
  email: string;
}

const { value } = await kv.get<User>('myapp', 'user:123');
// value is typed as User
```

## Error Handling

```javascript
try {
  await kv.get('myapp', 'nonexistent');
} catch (error) {
  console.error(error.message);
}
```
