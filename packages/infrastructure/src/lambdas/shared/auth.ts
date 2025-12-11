import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, GSI_NAME } from './dynamodb';
import { AuthenticatedUser } from '@kv/shared';
import { createHash } from 'crypto';
import { checkRateLimit, incrementRequestCount } from './usage';

export async function validateApiKey(apiKey: string): Promise<AuthenticatedUser> {
  const hashedKey = createHash('sha256').update(apiKey).digest('hex');
  
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: GSI_NAME,
    KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
    ExpressionAttributeValues: {
      ':pk': `APIKEY#${hashedKey}`,
      ':sk': 'METADATA'
    }
  }));

  if (!result.Items || result.Items.length === 0) {
    throw new Error('Unauthorized');
  }

  const user = result.Items[0];
  
  const allowed = await checkRateLimit(user.userId, user.plan, user.trialEndsAt);
  if (!allowed) {
    throw new Error('RateLimitExceeded');
  }
  
  await incrementRequestCount(user.userId, user.email, user.plan);
  
  return {
    userId: user.userId,
    plan: user.plan,
    apiKey
  };
}
