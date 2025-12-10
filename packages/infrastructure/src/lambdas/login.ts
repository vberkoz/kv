import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, GSI_NAME } from './shared/dynamodb';
import { successResponse, errorResponse } from './shared/response';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password required', 400);
    }

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `EMAIL#${email}`,
        ':sk': 'METADATA'
      }
    }));

    if (!result.Items || result.Items.length === 0) {
      return errorResponse('Invalid credentials', 401);
    }

    const user = result.Items[0];
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return errorResponse('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email, plan: user.plan },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return successResponse({ token, userId: user.userId });
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}
