import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { validateApiKey } from './shared/auth';
import { successResponse, errorResponse } from './shared/response';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const apiKey = event.headers['x-api-key'];
    if (!apiKey) {
      return errorResponse('Missing API key', 401);
    }

    await validateApiKey(apiKey);

    const { namespace, key } = event.pathParameters || {};
    if (!namespace || !key) {
      return errorResponse('Missing namespace or key', 400);
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `NS#${namespace}`,
        SK: `KEY#${key}`
      }
    }));

    return successResponse({ message: 'Value deleted successfully' }, 204);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Invalid API key', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
