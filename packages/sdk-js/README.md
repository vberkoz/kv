# @kv-storage/client

Official JavaScript/TypeScript client for KV Storage API.

## Installation

```bash
npm install @kv-storage/client
```

## Usage

```typescript
import { KVClient } from '@kv-storage/client';

// Initialize client
const kv = new KVClient('your-api-key');

// Or with custom base URL
const kv = new KVClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.kv.vberkoz.com'
});

// Store a value
await kv.put('myapp', 'user:123', { name: 'John', email: 'john@example.com' });

// Retrieve a value
const { value } = await kv.get('myapp', 'user:123');
console.log(value); // { name: 'John', email: 'john@example.com' }

// List keys
const { keys } = await kv.list('myapp');
console.log(keys); // ['user:123', 'user:456']

// List keys with prefix
const { keys } = await kv.list('myapp', 'user:');
console.log(keys); // ['user:123', 'user:456']

// Delete a value
await kv.delete('myapp', 'user:123');
```

## API Reference

### `new KVClient(options)`

Create a new KV Storage client.

**Parameters:**
- `options` (string | object): API key string or options object
  - `apiKey` (string): Your API key from the dashboard
  - `baseUrl` (string, optional): Custom API base URL

### `get<T>(namespace, key): Promise<KVResponse<T>>`

Retrieve a value from storage.

**Returns:** `{ value: T }`

### `put<T>(namespace, key, value): Promise<{ message: string }>`

Store or update a value.

**Returns:** `{ message: 'Value stored successfully' }`

### `delete(namespace, key): Promise<void>`

Delete a value from storage.

### `list(namespace, prefix?): Promise<{ keys: string[] }>`

List all keys in a namespace, optionally filtered by prefix.

**Returns:** `{ keys: string[] }`

## Error Handling

```typescript
try {
  await kv.get('myapp', 'nonexistent');
} catch (error) {
  console.error(error.message); // HTTP 404: Not Found
}
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

## License

MIT
