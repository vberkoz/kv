export interface KVClientOptions {
  apiKey: string;
  baseUrl?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export interface KVResponse<T = any> {
  value: T;
}

export interface BatchOperation {
  type: 'get' | 'put' | 'delete';
  namespace: string;
  key: string;
  value?: any;
}

export interface BatchResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class KVClient {
  private apiKey: string;
  private baseUrl: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(options: KVClientOptions | string) {
    if (typeof options === 'string') {
      this.apiKey = options;
      this.baseUrl = 'https://api.kv.vberkoz.com';
      this.maxRetries = 3;
      this.retryDelay = 1000;
    } else {
      this.apiKey = options.apiKey;
      this.baseUrl = options.baseUrl || 'https://api.kv.vberkoz.com';
      this.maxRetries = options.maxRetries ?? 3;
      this.retryDelay = options.retryDelay ?? 1000;
    }
  }

  private async retry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;
    for (let i = 0; i <= this.maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < this.maxRetries && this.isRetryable(error)) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, i)));
        } else {
          throw error;
        }
      }
    }
    throw lastError!;
  }

  private isRetryable(error: any): boolean {
    if (error.message?.includes('429')) return true;
    if (error.message?.includes('500')) return true;
    if (error.message?.includes('503')) return true;
    return false;
  }

  async get<T = any>(namespace: string, key: string): Promise<KVResponse<T>> {
    return this.retry(async () => {
      const res = await fetch(`${this.baseUrl}/v1/${namespace}/${key}`, {
        headers: { 'x-api-key': this.apiKey }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    });
  }

  async put<T = any>(namespace: string, key: string, value: T): Promise<{ message: string }> {
    return this.retry(async () => {
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
    });
  }

  async delete(namespace: string, key: string): Promise<void> {
    return this.retry(async () => {
      const res = await fetch(`${this.baseUrl}/v1/${namespace}/${key}`, {
        method: 'DELETE',
        headers: { 'x-api-key': this.apiKey }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    });
  }

  async list(namespace: string, prefix?: string): Promise<{ keys: string[] }> {
    return this.retry(async () => {
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
    });
  }

  async batch(operations: BatchOperation[]): Promise<BatchResult[]> {
    return Promise.all(
      operations.map(async (op) => {
        try {
          let data: any;
          if (op.type === 'get') {
            data = await this.get(op.namespace, op.key);
          } else if (op.type === 'put') {
            data = await this.put(op.namespace, op.key, op.value);
          } else if (op.type === 'delete') {
            await this.delete(op.namespace, op.key);
            data = { message: 'Deleted' };
          }
          return { success: true, data };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      })
    );
  }

  async *listStream(namespace: string, prefix?: string): AsyncGenerator<string> {
    const { keys } = await this.list(namespace, prefix);
    for (const key of keys) {
      yield key;
    }
  }

  async *getStream<T = any>(namespace: string, keys: string[]): AsyncGenerator<{ key: string; value: T | null; error?: string }> {
    for (const key of keys) {
      try {
        const { value } = await this.get<T>(namespace, key);
        yield { key, value };
      } catch (error) {
        yield { key, value: null, error: (error as Error).message };
      }
    }
  }
}
