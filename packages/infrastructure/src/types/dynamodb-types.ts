export interface UserEntity {
  PK: `USER#${string}`;
  SK: 'METADATA' | `NS#${string}`;
  entityType: 'USER' | 'NAMESPACE';
  userId?: string;
  email?: string;
  passwordHash?: string;
  apiKey?: string;
  plan?: 'free' | 'pro' | 'scale';
  requestCount?: number;
  storageBytes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KeyEntity {
  PK: `NS#${string}`;
  SK: `KEY#${string}` | 'METADATA';
  GSI1PK?: `APIKEY#${string}` | `NS#${string}`;
  GSI1SK?: 'METADATA' | `KEY#${string}`;
  entityType: 'KEY' | 'NAMESPACE';
  value?: any;
  ttl?: number;
  createdAt: string;
  updatedAt: string;
}
