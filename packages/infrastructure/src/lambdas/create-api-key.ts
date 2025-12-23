import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse, errorResponse } from './shared/response';
import { ValidationError } from './shared/errors';
import { createHandler } from './shared/middleware';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

const baseHandler = async (event: any) => {
  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
  if (!userId) {
    throw new ValidationError('Invalid token - no user ID');
  }

  const body = JSON.parse(event.body || '{}');
  const { name, permissions = ['read', 'write', 'delete'], expiresInDays } = body;

  if (!name || name.length < 3) {
    throw new ValidationError('API key name must be at least 3 characters');
  }

  const validPermissions = ['read', 'write', 'delete'];
  if (!Array.isArray(permissions) || !permissions.every(p => validPermissions.includes(p))) {
    throw new ValidationError('Invalid permissions. Must be array of: read, write, delete');
  }

  const apiKeyId = uuidv4();
  const apiKey = 'kv_' + uuidv4().replace(/-/g, '').substring(0, 24);
  const hashedApiKey = createHash('sha256').update(apiKey).digest('hex');
  const now = new Date().toISOString();

  let expiresAt;
  if (expiresInDays && expiresInDays > 0) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiresInDays);
    expiresAt = expiry.toISOString();
  }

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${userId}`,
      SK: `APIKEY#${apiKeyId}`,
      GSI1PK: `APIKEY#${hashedApiKey}`,
      GSI1SK: 'METADATA',
      entityType: 'APIKEY',
      userId,
      apiKeyId,
      name,
      permissions,
      expiresAt,
      createdAt: now
    }
  }));

  const correlationId = event.headers['x-correlation-id'];
  return successResponse({ apiKey, apiKeyId, name, permissions, expiresAt }, 201, correlationId);
};

export const handler = createHandler(baseHandler);
