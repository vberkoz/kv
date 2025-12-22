import { API_URL, STORAGE_KEYS } from '../constants/config';

const getAuthHeaders = () => {
  const tokensStr = localStorage.getItem(STORAGE_KEYS.COGNITO_TOKENS);
  if (!tokensStr) throw new Error('Not authenticated');
  const tokens = JSON.parse(tokensStr);
  return { 'Authorization': `Bearer ${tokens.accessToken}` };
};

export const api = {
  async getUsage() {
    const res = await fetch(`${API_URL}/v1/usage`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch usage');
    return res.json();
  },

  async getApiKey() {
    const res = await fetch(`${API_URL}/v1/api-keys`, {
      headers: getAuthHeaders()
    });
    if (res.status === 404) {
      return this.createApiKey();
    }
    if (!res.ok) throw new Error('Failed to fetch API key');
    return res.json();
  },

  async createApiKey() {
    const res = await fetch(`${API_URL}/v1/api-keys`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to create API key');
    return res.json();
  },

  async getNamespaces() {
    const res = await fetch(`${API_URL}/v1/namespaces`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch namespaces');
    return res.json();
  },

  async createNamespace(name: string) {
    const res = await fetch(`${API_URL}/v1/namespaces`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Failed to create namespace');
    return res.json();
  }
};
