import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse } from './shared/response';
import { ValidationError, NotFoundError } from './shared/errors';
import { createHandler } from './shared/middleware';
import { logger } from './shared/logger';

const baseHandler = async (event: any, context: any) => {
  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
  if (!userId) {
    throw new ValidationError('Invalid token - no user ID');
  }

  logger.info('Fetching API keys for user', { userId });

  // Query for all API keys for this user
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'APIKEY#'
    }
  }));

  if (!result.Items || result.Items.length === 0) {
    logger.info('No API keys found for user', { userId });
    throw new NotFoundError('No API key found');
  }

  // Return the first (primary) API key - never return the hashed key
  const primaryKey = result.Items[0];
  const correlationId = event.headers['x-correlation-id'];
  
  return successResponse({ 
    apiKey: primaryKey.apiKey,
    apiKeyId: primaryKey.apiKeyId,
    name: primaryKey.name,
    permissions: primaryKey.permissions,
    expiresAt: primaryKey.expiresAt,
    lastUsedAt: primaryKey.lastUsedAt,
    createdAt: primaryKey.createdAt
  }, 200, correlationId);
};

export const handler = createHandler(baseHandler);