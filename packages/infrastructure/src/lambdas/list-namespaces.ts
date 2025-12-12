import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, GSI_NAME } from './shared/dynamodb';
import { validateToken } from './shared/auth';
import { successResponse, errorResponse } from './shared/response';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) return errorResponse('Missing token', 401);

    const user = await validateToken(token);

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${user.userId}`,
        ':sk': 'NS#'
      }
    }));

    const namespaces = (result.Items || []).map(item => ({
      name: item.name,
      createdAt: item.createdAt
    }));

    return successResponse({ namespaces });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
