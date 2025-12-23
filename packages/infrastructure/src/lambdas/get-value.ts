import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse } from './shared/response';
import { ValidationError, NotFoundError } from './shared/errors';
import { createApiKeyHandler } from './shared/middleware';

const baseHandler = async (event: any, context: any) => {
  const { namespace, key } = event.pathParameters || {};
  
  if (!namespace || !key) {
    throw new ValidationError('Missing namespace or key');
  }

  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `NS#${namespace}`,
      SK: `KEY#${key}`
    }
  }));

  if (!result.Item) {
    throw new NotFoundError('Key not found');
  }

  const correlationId = event.headers['x-correlation-id'];
  const origin = event.headers.origin || event.headers.Origin;
  const rateLimitHeaders = (context as any).rateLimitHeaders || {};
  return successResponse({ value: result.Item.value }, 200, correlationId, rateLimitHeaders, origin);
};

export const handler = createApiKeyHandler(baseHandler);
