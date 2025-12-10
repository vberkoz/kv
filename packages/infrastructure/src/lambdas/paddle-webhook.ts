import { APIGatewayEvent } from '@kv/shared';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { createHmac } from 'crypto';
import { successResponse, errorResponse } from './shared/response';

const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || '';

export async function handler(event: APIGatewayEvent) {
  try {
    const signature = event.headers['paddle-signature'] || event.headers['Paddle-Signature'];
    const body = event.body!;
    
    if (PADDLE_WEBHOOK_SECRET) {
      const hmac = createHmac('sha256', PADDLE_WEBHOOK_SECRET);
      const digest = hmac.update(body).digest('hex');
      if (digest !== signature) {
        return errorResponse('Invalid signature', 401);
      }
    }

    const payload = JSON.parse(body);
    const { event_type, data } = payload;

    if (event_type === 'subscription.created' || event_type === 'subscription.updated') {
      const userId = data.custom_data?.userId;
      const plan = data.items?.[0]?.price?.product?.name?.toLowerCase() || 'free';
      
      if (userId) {
        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${userId}`, SK: 'METADATA' },
          UpdateExpression: 'SET plan = :plan',
          ExpressionAttributeValues: { ':plan': plan as string }
        }));
      }
    }

    if (event_type === 'subscription.canceled') {
      const userId = data.custom_data?.userId;
      
      if (userId) {
        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${userId}`, SK: 'METADATA' },
          UpdateExpression: 'SET plan = :plan',
          ExpressionAttributeValues: { ':plan': 'free' as string }
        }));
      }
    }

    return successResponse({ message: 'Webhook processed' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return errorResponse(error.message, 500);
  }
}
