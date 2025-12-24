import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse } from './shared/response';
import { ValidationError } from './shared/errors';
import { createHandler } from './shared/middleware';

const baseHandler = async (event: any) => {
  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
  if (!userId) {
    throw new ValidationError('Invalid token - no user ID');
  }

  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'APIKEY#'
    },
    ProjectionExpression: 'apiKeyId, #name, permissions, expiresAt, lastUsedAt, createdAt',
    ExpressionAttributeNames: {
      '#name': 'name'
    }
  }));

  const keys = (result.Items || []).map(item => ({
    apiKeyId: item.apiKeyId,
    name: item.name,
    permissions: item.permissions,
    expiresAt: item.expiresAt,
    lastUsedAt: item.lastUsedAt,
    createdAt: item.createdAt
  }));

  const correlationId = event.headers['x-correlation-id'];
  return successResponse({ keys }, 200, correlationId);
};

export const handler = createHandler(baseHandler);
