import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse } from './shared/response';
import { ValidationError, NotFoundError } from './shared/errors';
import { createHandler } from './shared/middleware';

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

  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `APIKEY#${apiKeyId}`
    }
  }));

  const correlationId = event.headers['x-correlation-id'];
  return successResponse({ message: 'API key revoked' }, 200, correlationId);
};

export const handler = createHandler(baseHandler);
