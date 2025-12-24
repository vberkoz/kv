import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse } from './shared/response';
import { ValidationError } from './shared/errors';
import { createDualAuthHandler } from './shared/middleware';

const baseHandler = async (event: any, context: any) => {
  const { namespace, key } = event.pathParameters || {};
  const headers = event.headers || {};
  
  if (!namespace || !key) {
    throw new ValidationError('Missing namespace or key');
  }

  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `NS#${namespace}`,
      SK: `KEY#${key}`
    }
  }));

  const correlationId = headers['x-correlation-id'];
  const origin = headers.origin || headers.Origin;
  const rateLimitHeaders = (context as any).rateLimitHeaders || {};
  return successResponse({ message: 'Value deleted successfully' }, 204, correlationId, rateLimitHeaders, origin);
};

export const handler = createDualAuthHandler(baseHandler);
