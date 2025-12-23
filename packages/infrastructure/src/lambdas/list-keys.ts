import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse } from './shared/response';
import { ValidationError } from './shared/errors';
import { createApiKeyHandler } from './shared/middleware';

const baseHandler = async (event: any, context: any) => {
  const { namespace } = event.pathParameters || {};
  const prefix = event.queryStringParameters?.prefix || '';

  if (!namespace) {
    throw new ValidationError('Missing namespace');
  }

  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `NS#${namespace}`,
      ':sk': `KEY#${prefix}`
    }
  }));

  const keys = (result.Items || []).map(item => ({
    key: item.SK.replace('KEY#', ''),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));

  const correlationId = event.headers['x-correlation-id'];
  const origin = event.headers.origin || event.headers.Origin;
  const rateLimitHeaders = (context as any).rateLimitHeaders || {};
  return successResponse({ keys }, 200, correlationId, rateLimitHeaders, origin);
};

export const handler = createApiKeyHandler(baseHandler);
