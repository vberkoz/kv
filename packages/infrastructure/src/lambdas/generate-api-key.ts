import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse, errorResponse } from './shared/response';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) return errorResponse('Missing token', 401);

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const apiKey = uuidv4().replace(/-/g, '');
    const hashedApiKey = createHash('sha256').update(apiKey).digest('hex');
    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: `APIKEY#${now}`,
        GSI1PK: `APIKEY#${hashedApiKey}`,
        GSI1SK: 'METADATA',
        entityType: 'APIKEY',
        userId,
        plan: decoded.plan,
        createdAt: now
      }
    }));

    return successResponse({ apiKey }, 201);
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse('Invalid token', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
