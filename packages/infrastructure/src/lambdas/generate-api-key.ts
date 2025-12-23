import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse } from './shared/response';
import { ValidationError } from './shared/errors';
import { createHandler } from './shared/middleware';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

const baseHandler = async (event: any) => {
  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
  if (!userId) {
    throw new ValidationError('Invalid token - no user ID');
  }

  const existingResult = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'APIKEY#'
    }
  }));

  if (existingResult.Items && existingResult.Items.length > 0) {
    const key = existingResult.Items[0];
    const correlationId = event.headers['x-correlation-id'];
    return successResponse({ 
      apiKey: key.apiKey,
      apiKeyId: key.apiKeyId,
      name: key.name,
      permissions: key.permissions,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt
    }, 200, correlationId);
  }

  const apiKeyId = uuidv4();
  const apiKey = 'kv_' + uuidv4().replace(/-/g, '').substring(0, 24);
  const hashedApiKey = createHash('sha256').update(apiKey).digest('hex');
  const now = new Date().toISOString();

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
      name: 'Default API Key',
      apiKey,
      permissions: ['read', 'write', 'delete'],
      createdAt: now
    }
  }));

  const correlationId = event.headers['x-correlation-id'];
  return successResponse({ apiKey, apiKeyId, name: 'Default API Key', permissions: ['read', 'write', 'delete'] }, 201, correlationId);
};

export const handler = createHandler(baseHandler);
