export interface User {
  userId: string;
  email: string;
  apiKey: string;
  plan: 'free' | 'pro' | 'scale';
  createdAt: string;
}

export interface ApiKey {
  apiKeyId: string;
  userId: string;
  name: string;
  hashedKey: string;
  permissions: ('read' | 'write' | 'delete')[];
  expiresAt?: string;
  lastUsedAt?: string;
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

export interface APIGatewayEvent {
  pathParameters: { namespace: string; key: string } | null;
  headers: { authorization?: string; [key: string]: string | undefined };
  body: string | null;
  queryStringParameters?: { prefix?: string; [key: string]: string | undefined } | null;
}

export interface APIResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export interface AuthenticatedUser {
  userId: string;
  plan: 'free' | 'pro' | 'scale';
  apiKey: string;
  permissions?: ('read' | 'write' | 'delete')[];
}
