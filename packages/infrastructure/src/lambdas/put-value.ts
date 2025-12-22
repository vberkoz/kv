import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
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

    const body = JSON.parse(event.body || '{}');
    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `NS#${namespace}`,
        SK: `KEY#${key}`,
        GSI1PK: `NS#${namespace}`,
        GSI1SK: `KEY#${key}`,
        entityType: 'KEY',
        value: body.value,
        createdAt: now,
        updatedAt: now
      }
    }));

    return successResponse({ message: 'Value stored successfully' }, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Invalid API key', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
