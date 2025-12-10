# Agent Prompt 14: Paddle Payment Integration

## Required Skills
- **Payment processing**: Subscription management, webhook handling, payment flows
- **Security**: Webhook validation, signature verification, secure payment flows
- **Business logic**: Plan upgrades, billing cycles, prorations, grace periods
- **Error handling**: Payment failures, retry logic, user notifications
- **Webhook processing**: Event handling, idempotency, async processing
- **Database transactions**: Atomic updates, consistency, rollback handling

## Context
From brainstorm pricing:
- Free: 25GB storage, 100K requests/month
- Pro ($10/mo): 100GB storage, 1M requests/month
- Scale ($30/mo): 500GB storage, 10M requests/month

**Paddle Webhook Events:**
- `subscription.created` - Activate paid plan
- `subscription.updated` - Handle plan changes
- `subscription.canceled` - Downgrade to free
- `subscription.payment_failed` - Send notification

## Implementation Requirements

### 1. Paddle Integration (dashboard)
```typescript
// Install: npm install @paddle/paddle-js
import { initializePaddle } from '@paddle/paddle-js';

const paddle = await initializePaddle({
  environment: 'sandbox',
  token: 'YOUR_CLIENT_TOKEN'
});

function upgradeToPro() {
  paddle.Checkout.open({
    items: [{ priceId: 'pri_pro_monthly', quantity: 1 }]
  });
}
```

### 2. Webhook Handler (Lambda)
```typescript
import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { createHmac } from 'crypto';

const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET!;

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  const signature = event.headers['paddle-signature'];
  const body = event.body!;
  
  // Verify webhook signature
  const hmac = createHmac('sha256', PADDLE_WEBHOOK_SECRET);
  const digest = hmac.update(body).digest('hex');
  if (digest !== signature) {
    return { statusCode: 401, body: 'Invalid signature' };
  }

  const payload = JSON.parse(body);
  const { event_type, data } = payload;

  if (event_type === 'subscription.created' || event_type === 'subscription.updated') {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${data.custom_data.userId}`, SK: 'METADATA' },
      UpdateExpression: 'SET plan = :plan',
      ExpressionAttributeValues: { ':plan': data.items[0].price.product.name.toLowerCase() }
    }));
  }

  return { statusCode: 200, body: 'OK' };
}
```

## Success Criteria
- [ ] Paddle checkout opens in dashboard
- [ ] Webhooks update user plan in DynamoDB
- [ ] Signature verification works
- [ ] Plan changes reflected immediately