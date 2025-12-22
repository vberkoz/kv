import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { validateToken } from './shared/auth';
import { successResponse, errorResponse } from './shared/response';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Extract user ID from JWT claims provided by API Gateway authorizer
    const userId = (event as any).requestContext?.authorizer?.jwt?.claims?.sub;
    if (!userId) {
      return errorResponse('Invalid token - no user ID', 401);
    }
    
    console.log('User ID from JWT claims:', userId);

    // Check if user already has an API key
    const existingResult = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'APIKEY'
      }
    }));

    if (existingResult.Items && existingResult.Items.length > 0) {
      return successResponse({ 
        apiKey: existingResult.Items[0].apiKey,
        exampleNamespace: 'my-app',
        exampleKey: 'user:demo',
        message: 'Existing API key returned'
      });
    }

    const apiKey = 'kv_' + uuidv4().replace(/-/g, '').substring(0, 24);
    const hashedApiKey = createHash('sha256').update(apiKey).digest('hex');
    const exampleNamespace = 'my-app';
    const exampleKey = 'user:demo';
    const now = new Date().toISOString();

    // Store API key with actual key for retrieval
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: 'APIKEY',
        GSI1PK: `APIKEY#${hashedApiKey}`,
        GSI1SK: 'METADATA',
        entityType: 'APIKEY',
        userId,
        plan: 'free',
        apiKey,
        createdAt: now
      }
    }));

    // Create example namespace
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `NS#${exampleNamespace}`,
        SK: 'METADATA',
        GSI1PK: `USER#${userId}`,
        GSI1SK: `NS#${exampleNamespace}`,
        entityType: 'NAMESPACE',
        userId,
        name: exampleNamespace,
        createdAt: now,
        updatedAt: now
      }
    }));

    // Create example data
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `NS#${exampleNamespace}`,
        SK: `KEY#${exampleKey}`,
        entityType: 'KV_PAIR',
        namespace: exampleNamespace,
        key: exampleKey,
        value: { message: 'Hello World!', timestamp: now },
        createdAt: now,
        updatedAt: now
      }
    }));

    return successResponse({ 
      apiKey,
      exampleNamespace,
      exampleKey
    }, 201);
  } catch (error: any) {
    console.error('Error in generate-api-key:', error);
    return errorResponse('Internal server error', 500);
  }
}
