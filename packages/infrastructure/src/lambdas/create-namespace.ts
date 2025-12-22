import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { validateToken } from './shared/auth';
import { successResponse, errorResponse } from './shared/response';
import { createNamespaceSchema, validate } from './shared/validation';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) return errorResponse('Missing token', 401);

    const user = await validateToken(token);
    const body = JSON.parse(event.body || '{}');
    
    const validation = validate(createNamespaceSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }
    
    const { name } = validation.data;

    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `NS#${name}`,
        SK: 'METADATA',
        GSI1PK: `USER#${user.userId}`,
        GSI1SK: `NS#${name}`,
        entityType: 'NAMESPACE',
        userId: user.userId,
        name,
        createdAt: now,
        updatedAt: now
      },
      ConditionExpression: 'attribute_not_exists(PK)'
    }));

    return successResponse({ namespace: name }, 201);
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return errorResponse('Namespace already exists', 409);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Invalid API key', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
