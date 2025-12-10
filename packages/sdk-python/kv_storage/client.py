import requests
from typing import Any, Dict, List, Optional


class KVClient:
    """Official Python client for KV Storage API."""
    
    def __init__(self, api_key: str, base_url: str = 'https://api.kv.vberkoz.com'):
        """
        Initialize KV Storage client.
        
        Args:
            api_key: Your API key from the dashboard
            base_url: Custom API base URL (optional)
        """
        self.api_key = api_key
        self.base_url = base_url
    
    def get(self, namespace: str, key: str) -> Dict[str, Any]:
        """
        Retrieve a value from storage.
        
        Args:
            namespace: The namespace to query
            key: The key to retrieve
            
        Returns:
            Dictionary with 'value' key containing the stored data
            
        Raises:
            requests.HTTPError: If the request fails
        """
        res = requests.get(
            f'{self.base_url}/v1/{namespace}/{key}',
            headers={'Authorization': f'Bearer {self.api_key}'}
        )
        res.raise_for_status()
        return res.json()
    
    def put(self, namespace: str, key: str, value: Any) -> Dict[str, str]:
        """
        Store or update a value.
        
        Args:
            namespace: The namespace to store in
            key: The key to store
            value: The value to store (must be JSON serializable)
            
        Returns:
            Dictionary with success message
            
        Raises:
            requests.HTTPError: If the request fails
        """
        res = requests.put(
            f'{self.base_url}/v1/{namespace}/{key}',
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            },
            json={'value': value}
        )
        res.raise_for_status()
        return res.json()
    
    def delete(self, namespace: str, key: str) -> None:
        """
        Delete a value from storage.
        
        Args:
            namespace: The namespace to delete from
            key: The key to delete
            
        Raises:
            requests.HTTPError: If the request fails
        """
        res = requests.delete(
            f'{self.base_url}/v1/{namespace}/{key}',
            headers={'Authorization': f'Bearer {self.api_key}'}
        )
        res.raise_for_status()
    
    def list(self, namespace: str, prefix: Optional[str] = None) -> Dict[str, List[str]]:
        """
        List all keys in a namespace, optionally filtered by prefix.
        
        Args:
            namespace: The namespace to list
            prefix: Optional prefix to filter keys
            
        Returns:
            Dictionary with 'keys' list
            
        Raises:
            requests.HTTPError: If the request fails
        """
        url = f'{self.base_url}/v1/{namespace}'
        params = {'prefix': prefix} if prefix else None
        
        res = requests.get(
            url,
            headers={'Authorization': f'Bearer {self.api_key}'},
            params=params
        )
        res.raise_for_status()
        return res.json()
