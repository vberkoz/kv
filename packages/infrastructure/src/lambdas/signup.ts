import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse, errorResponse } from './shared/response';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse('Invalid email', 400);
    }

    if (!password || password.length < 8) {
      return errorResponse('Password must be at least 8 characters', 400);
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 12);
    const apiKey = uuidv4().replace(/-/g, '');
    const hashedApiKey = createHash('sha256').update(apiKey).digest('hex');
    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: 'METADATA',
        GSI1PK: `EMAIL#${email}`,
        GSI1SK: 'METADATA',
        entityType: 'USER',
        userId,
        email,
        passwordHash,
        plan: 'trial',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        requestCount: 0,
        storageBytes: 0,
        createdAt: now,
        updatedAt: now
      },
      ConditionExpression: 'attribute_not_exists(PK)'
    }));

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: 'APIKEY',
        GSI1PK: `APIKEY#${hashedApiKey}`,
        GSI1SK: 'METADATA',
        entityType: 'APIKEY',
        userId,
        plan: 'trial',
        createdAt: now
      }
    }));

    const token = jwt.sign({ userId, email, plan: 'trial' }, JWT_SECRET, { expiresIn: '24h' });

    return successResponse({ token, apiKey, userId }, 201);
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return errorResponse('Email already registered', 409);
    }
    return errorResponse('Internal server error', 500);
  }
}
