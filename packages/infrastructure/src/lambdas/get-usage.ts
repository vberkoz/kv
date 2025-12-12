import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse, errorResponse } from './shared/response';
import * as jwt from 'jsonwebtoken';

const PLAN_LIMITS = {
  free: { requests: 100000, storage: 25 * 1024 * 1024 * 1024 },
  pro: { requests: 1000000, storage: 100 * 1024 * 1024 * 1024 },
  scale: { requests: 10000000, storage: 500 * 1024 * 1024 * 1024 }
};

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) return errorResponse('Missing token', 401);

    const decoded = jwt.decode(token) as any;
    if (!decoded) return errorResponse('Invalid token', 401);
    
    const userId = decoded.email || decoded.sub;
    const plan = 'free';
    const month = new Date().toISOString().slice(0, 7);

    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `USAGE#${month}`
      }
    }));

    const requestCount = result.Item?.requestCount || 0;
    const storageBytes = result.Item?.storageBytes || 0;
    const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

    return successResponse({
      usage: {
        requests: requestCount,
        storage: storageBytes
      },
      limits: {
        requests: limits.requests,
        storage: limits.storage
      },
      plan
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse('Invalid token', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
