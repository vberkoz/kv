import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse } from './shared/response';
import { ValidationError, NotFoundError } from './shared/errors';
import { createHandler } from './shared/middleware';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

const baseHandler = async (event: any) => {
  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
  if (!userId) {
    throw new ValidationError('Invalid token - no user ID');
  }

  const { apiKeyId } = event.pathParameters || {};
  if (!apiKeyId) {
    throw new ValidationError('Missing apiKeyId');
  }

  const existing = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `APIKEY#${apiKeyId}`
    }
  }));

  if (!existing.Item) {
    throw new NotFoundError('API key not found');
  }

  const oldItem = existing.Item;
  const newApiKey = 'kv_' + uuidv4().replace(/-/g, '').substring(0, 24);
  const hashedApiKey = createHash('sha256').update(newApiKey).digest('hex');
  const now = new Date().toISOString();

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      ...oldItem,
      GSI1PK: `APIKEY#${hashedApiKey}`,
      rotatedAt: now,
      lastUsedAt: undefined
    }
  }));

  const correlationId = event.headers['x-correlation-id'];
  return successResponse({ 
    apiKey: newApiKey, 
    apiKeyId,
    message: 'API key rotated successfully'
  }, 200, correlationId);
};

export const handler = createHandler(baseHandler);
