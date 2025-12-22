import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { validateToken } from './shared/auth';
import { successResponse, errorResponse } from './shared/response';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Extract user ID from JWT claims provided by API Gateway authorizer
    const userId = (event as any).requestContext?.authorizer?.jwt?.claims?.sub;
    if (!userId) {
      return errorResponse('Invalid token - no user ID', 401);
    }
    
    console.log('User ID from JWT claims:', userId);

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'APIKEY'
      }
    }));

    if (!result.Items || result.Items.length === 0) {
      return errorResponse('No API key found', 404);
    }

    // Return actual API key and example data
    return successResponse({ 
      apiKey: result.Items[0].apiKey,
      exampleNamespace: 'my-app',
      exampleKey: 'user:demo',
      createdAt: result.Items[0].createdAt 
    });
  } catch (error: any) {
    console.error('Error in get-api-key:', error);
    return errorResponse('Internal server error', 500);
  }
}