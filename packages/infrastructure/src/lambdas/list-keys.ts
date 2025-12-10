import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { validateApiKey } from './shared/auth';
import { successResponse, errorResponse } from './shared/response';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const apiKey = event.headers.authorization?.replace('Bearer ', '');
    if (!apiKey) return errorResponse('Missing API key', 401);

    await validateApiKey(apiKey);

    const { namespace } = event.pathParameters || {};
    const prefix = event.queryStringParameters?.prefix || '';

    if (!namespace) {
      return errorResponse('Missing namespace', 400);
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

    return successResponse({ keys });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Invalid API key', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
