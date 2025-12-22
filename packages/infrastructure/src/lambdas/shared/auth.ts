import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, GSI_NAME } from './dynamodb';
import { AuthenticatedUser } from '@kv/shared';
import { createHash } from 'crypto';
import { checkRateLimit, incrementRequestCount } from './usage';
import { checkRateLimitPerSecond } from './rate-limiter';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { UnauthorizedError, RateLimitError } from './errors';
import { logger } from './logger';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.USER_POOL_CLIENT_ID!
});

export async function validateToken(token: string): Promise<AuthenticatedUser> {
  try {
    logger.debug('Validating JWT token');
    const payload = await verifier.verify(token);
    const userId = payload.sub;
    
    logger.debug('JWT validated', { userId });
    
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'PROFILE'
      }
    }));

    if (!result.Items || result.Items.length === 0) {
      logger.info('Creating new user profile', { userId });
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
    logger.error('JWT validation failed', { error });
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export async function validateApiKey(apiKey: string): Promise<AuthenticatedUser & { rateLimitHeaders: Record<string, string> }> {
  const hashedKey = createHash('sha256').update(apiKey).digest('hex');
  
  logger.debug('Validating API key');
  
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
    logger.warn('Invalid API key attempt');
    throw new UnauthorizedError('Invalid API key');
  }

  const apiKeyItem = result.Items[0];
  const userId = apiKeyItem.userId;
  
  logger.debug('API key validated', { userId });
  
  const userResult = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'PROFILE'
    }
  }));

  const user = userResult.Items?.[0];
  const plan = user?.plan || apiKeyItem.plan || 'free';
  const email = user?.email || '';
  
  const rateLimitCheck = await checkRateLimitPerSecond(userId, plan);
  if (!rateLimitCheck.allowed) {
    const error = new RateLimitError();
    (error as any).rateLimitHeaders = rateLimitCheck.headers;
    throw error;
  }
  
  const allowed = await checkRateLimit(userId, plan, user?.trialEndsAt);
  if (!allowed) {
    logger.warn('Monthly quota exceeded', { userId, plan });
    throw new RateLimitError();
  }
  
  await incrementRequestCount(userId, email, plan);
  
  return {
    userId,
    plan,
    apiKey,
    rateLimitHeaders: rateLimitCheck.headers
  };
}
