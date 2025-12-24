import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse } from './shared/response';
import { ValidationError } from './shared/errors';
import { createDualAuthHandler } from './shared/middleware';

const baseHandler = async (event: any, context: any) => {
  try {
    const { namespace } = event.pathParameters || {};
    const headers = event.headers || {};
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
      },
      ProjectionExpression: 'SK, createdAt, updatedAt'
    }));

    const keys = (result.Items || []).map(item => ({
      key: item.SK.replace('KEY#', ''),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    const correlationId = headers['x-correlation-id'];
    const origin = headers.origin || headers.Origin;
    const rateLimitHeaders = (context as any).rateLimitHeaders || {};
    return successResponse({ keys }, 200, correlationId, rateLimitHeaders, origin);
  } catch (error) {
    console.error('List keys error:', error);
    throw error;
  }
};

export const handler = createDualAuthHandler(baseHandler);
