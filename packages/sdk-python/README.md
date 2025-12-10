# kv-storage

Official Python client for KV Storage API.

## Installation

```bash
pip install kv-storage
```

## Usage

```python
from kv_storage import KVClient

# Initialize client
kv = KVClient('your-api-key')

# Or with custom base URL
kv = KVClient('your-api-key', base_url='https://api.kv.vberkoz.com')

# Store a value
kv.put('myapp', 'user:123', {'name': 'John', 'email': 'john@example.com'})

# Retrieve a value
data = kv.get('myapp', 'user:123')
print(data['value'])  # {'name': 'John', 'email': 'john@example.com'}

# List keys
result = kv.list('myapp')
print(result['keys'])  # ['user:123', 'user:456']

# List keys with prefix
result = kv.list('myapp', prefix='user:')
print(result['keys'])  # ['user:123', 'user:456']

# Delete a value
kv.delete('myapp', 'user:123')
```

## API Reference

### `KVClient(api_key, base_url='https://api.kv.vberkoz.com')`

Create a new KV Storage client.

**Parameters:**
- `api_key` (str): Your API key from the dashboard
- `base_url` (str, optional): Custom API base URL

### `get(namespace, key) -> dict`

Retrieve a value from storage.

**Returns:** `{'value': <stored_data>}`

**Raises:** `requests.HTTPError` if the request fails

### `put(namespace, key, value) -> dict`

Store or update a value.

**Returns:** `{'message': 'Value stored successfully'}`

**Raises:** `requests.HTTPError` if the request fails

### `delete(namespace, key) -> None`

Delete a value from storage.

**Raises:** `requests.HTTPError` if the request fails

### `list(namespace, prefix=None) -> dict`

List all keys in a namespace, optionally filtered by prefix.

**Returns:** `{'keys': [...]}`

**Raises:** `requests.HTTPError` if the request fails

## Error Handling

```python
from requests.exceptions import HTTPError

try:
    kv.get('myapp', 'nonexistent')
except HTTPError as e:
    print(f"Error: {e}")  # 404 Client Error: Not Found
```

## Type Hints

The library includes full type hints for better IDE support:

```python
from typing import Dict, Any

data: Dict[str, Any] = kv.get('myapp', 'user:123')
```

## License

MIT
