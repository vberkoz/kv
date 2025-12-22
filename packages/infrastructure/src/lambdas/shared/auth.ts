import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, GSI_NAME } from './dynamodb';
import { AuthenticatedUser } from '@kv/shared';
import { createHash } from 'crypto';
import { checkRateLimit, incrementRequestCount } from './usage';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.USER_POOL_CLIENT_ID!
});

export async function validateToken(token: string): Promise<AuthenticatedUser> {
  try {
    console.log('Validating token:', token.substring(0, 50) + '...');
    const payload = await verifier.verify(token);
    console.log('JWT payload:', JSON.stringify(payload, null, 2));
    const userId = payload.sub;
    
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'PROFILE'
      }
    }));

    if (!result.Items || result.Items.length === 0) {
      const now = new Date().toISOString();
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
          entityType: 'USER',
          userId,
          email: payload.email || '',
          plan: 'free',
          createdAt: now,
          updatedAt: now
        }
      }));
      return {
        userId,
        plan: 'free',
        apiKey: ''
      };
    }

    const user = result.Items[0];
    return {
      userId: user.userId,
      plan: user.plan || 'free',
      apiKey: ''
    };
  } catch (error) {
    throw new Error('Unauthorized');
  }
}

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

  const apiKeyItem = result.Items[0];
  
  // Get user profile for email
  const userResult = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': `USER#${apiKeyItem.userId}`,
      ':sk': 'PROFILE'
    }
  }));

  const user = userResult.Items?.[0];
  const plan = user?.plan || apiKeyItem.plan || 'free';
  const email = user?.email || '';
  
  const allowed = await checkRateLimit(apiKeyItem.userId, plan, user?.trialEndsAt);
  if (!allowed) {
    throw new Error('RateLimitExceeded');
  }
  
  await incrementRequestCount(apiKeyItem.userId, email, plan);
  
  return {
    userId: apiKeyItem.userId,
    plan,
    apiKey
  };
}
