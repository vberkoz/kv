import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamodb';
import { sendUsageAlert } from '../send-usage-alert';

const PLAN_LIMITS = {
  trial: { requests: 100000, storage: 10 * 1024 * 1024 * 1024 },
  starter: { requests: 500000, storage: 25 * 1024 * 1024 * 1024 },
  pro: { requests: 1000000, storage: 100 * 1024 * 1024 * 1024 },
  scale: { requests: 5000000, storage: 250 * 1024 * 1024 * 1024 },
  business: { requests: 20000000, storage: 1024 * 1024 * 1024 * 1024 }
};

export async function incrementRequestCount(userId: string, email: string, plan: string): Promise<void> {
  const month = new Date().toISOString().slice(0, 7);
  
  const result = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `USAGE#${month}`
    },
    UpdateExpression: 'ADD requestCount :inc SET updatedAt = :now',
    ExpressionAttributeValues: {
      ':inc': 1,
      ':now': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  }));

  const requestCount = result.Attributes?.requestCount || 0;
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.requests || PLAN_LIMITS.trial.requests;
  const percent = (requestCount / limit) * 100;
  
  if (percent >= 80 && percent < 81 && email) {
    await sendUsageAlert(email, Math.floor(percent), plan);
  }
}

export async function checkRateLimit(userId: string, plan: string): Promise<boolean> {
  const month = new Date().toISOString().slice(0, 7);
  
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `USAGE#${month}`
    }
  }));

  const requestCount = result.Item?.requestCount || 0;
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.requests || PLAN_LIMITS.trial.requests;
  
  return requestCount < limit;
}

export function calculateStorageSize(value: any): number {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}
