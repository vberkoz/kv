import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { validateApiKey } from './shared/auth';
import { successResponse, errorResponse, rateLimitResponse } from './shared/response';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const apiKey = event.headers.authorization?.replace('Bearer ', '');
    if (!apiKey) {
      return errorResponse('Missing API key', 401);
    }

    await validateApiKey(apiKey);

    const { namespace, key } = event.pathParameters || {};
    if (!namespace || !key) {
      return errorResponse('Missing namespace or key', 400);
    }

    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `NS#${namespace}`,
        SK: `KEY#${key}`
      }
    }));

    if (!result.Item) {
      return errorResponse('Key not found', 404);
    }

    return successResponse({ value: result.Item.value });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Invalid API key', 401);
    }
    if (error.message === 'RateLimitExceeded') {
      return rateLimitResponse();
    }
    return errorResponse('Internal server error', 500);
  }
}
