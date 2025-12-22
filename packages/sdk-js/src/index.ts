export interface KVClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface KVResponse<T = any> {
  value: T;
}

export class KVClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: KVClientOptions | string) {
    if (typeof options === 'string') {
      this.apiKey = options;
      this.baseUrl = 'https://api.kv.vberkoz.com';
    } else {
      this.apiKey = options.apiKey;
      this.baseUrl = options.baseUrl || 'https://api.kv.vberkoz.com';
    }
  }

  async get<T = any>(namespace: string, key: string): Promise<KVResponse<T>> {
    const res = await fetch(`${this.baseUrl}/v1/${namespace}/${key}`, {
      headers: { 'x-api-key': this.apiKey }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }

  async put<T = any>(namespace: string, key: string, value: T): Promise<{ message: string }> {
    const res = await fetch(`${this.baseUrl}/v1/${namespace}/${key}`, {
      method: 'PUT',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value })
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }

  async delete(namespace: string, key: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/v1/${namespace}/${key}`, {
      method: 'DELETE',
      headers: { 'x-api-key': this.apiKey }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
  }

  async list(namespace: string, prefix?: string): Promise<{ keys: string[] }> {
    const url = prefix 
      ? `${this.baseUrl}/v1/${namespace}?prefix=${encodeURIComponent(prefix)}`
      : `${this.baseUrl}/v1/${namespace}`;
    
    const res = await fetch(url, {
      headers: { 'x-api-key': this.apiKey }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }
}
