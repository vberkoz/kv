export interface User {
  userId: string;
  email: string;
  apiKey: string;
  plan: 'free' | 'pro' | 'scale';
  createdAt: string;
}

export interface Namespace {
  namespaceId: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface KeyValue {
  key: string;
  value: any;
  namespace: string;
  createdAt: string;
  updatedAt: string;
}
