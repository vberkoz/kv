# Agent Prompt 7: Usage Tracking & Limits

## Required Skills
- **Metrics collection**: Request counting, storage calculation, data aggregation
- **Rate limiting**: Quota enforcement, HTTP 429 responses, retry-after headers
- **Data aggregation**: Monthly rollups, usage statistics, efficient queries
- **Performance optimization**: Caching strategies, atomic counters, batch operations
- **DynamoDB**: Conditional writes, atomic updates, efficient query patterns
- **Business logic**: Plan limits, threshold detection, usage reset scheduling

## Context
From brainstorm pricing tiers:
- Free: 25GB storage, 100K requests/month
- Pro ($10/mo): 100GB storage, 1M requests/month
- Scale ($30/mo): 500GB storage, 10M requests/month

## Exact File Structure
```
packages/infrastructure/
└── src/
    └── lambdas/
        ├── shared/
        │   └── usage.ts
        └── get-usage.ts
```

## Plan Limits
```typescript
const PLAN_LIMITS = {
  free: { requests: 100000, storage: 25 * 1024 * 1024 * 1024 },
  pro: { requests: 1000000, storage: 100 * 1024 * 1024 * 1024 },
  scale: { requests: 10000000, storage: 500 * 1024 * 1024 * 1024 }
};
```

## Implementation Requirements

### 1. src/lambdas/shared/usage.ts
```typescript
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamodb';

const PLAN_LIMITS = {
  free: { requests: 100000, storage: 25 * 1024 * 1024 * 1024 },
  pro: { requests: 1000000, storage: 100 * 1024 * 1024 * 1024 },
  scale: { requests: 10000000, storage: 500 * 1024 * 1024 * 1024 }
};

export async function incrementRequestCount(userId: string): Promise<void> {
  const month = new Date().toISOString().slice(0, 7);
  
  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `USAGE#${month}`
    },
    UpdateExpression: 'ADD requestCount :inc SET updatedAt = :now',
    ExpressionAttributeValues: {
      ':inc': 1,
      ':now': new Date().toISOString()
    }
  }));
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
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.requests || PLAN_LIMITS.free.requests;
  
  return requestCount < limit;
}

export function calculateStorageSize(value: any): number {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}
```

### 2. Update src/lambdas/shared/auth.ts
```typescript
// Add rate limit check after validateApiKey:
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
  
  // Check rate limit
  const allowed = await checkRateLimit(user.userId, user.plan);
  if (!allowed) {
    throw new Error('RateLimitExceeded');
  }
  
  // Increment request count
  await incrementRequestCount(user.userId);
  
  return {
    userId: user.userId,
    plan: user.plan,
    apiKey
  };
}
```

### 3. Update Lambda handlers to handle rate limits
```typescript
// In all Lambda handlers, update error handling:
catch (error: any) {
  if (error.message === 'Unauthorized') {
    return errorResponse('Invalid API key', 401);
  }
  if (error.message === 'RateLimitExceeded') {
    return {
      statusCode: 429,
      headers: { 
        'Content-Type': 'application/json',
        'Retry-After': '3600'
      },
      body: JSON.stringify({ error: 'Rate limit exceeded', statusCode: 429 })
    };
  }
  return errorResponse('Internal server error', 500);
}
```

### 4. src/lambdas/get-usage.ts
```typescript
import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse, errorResponse } from './shared/response';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const PLAN_LIMITS = {
  free: { requests: 100000, storage: 25 * 1024 * 1024 * 1024 },
  pro: { requests: 1000000, storage: 100 * 1024 * 1024 * 1024 },
  scale: { requests: 10000000, storage: 500 * 1024 * 1024 * 1024 }
};

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) return errorResponse('Missing token', 401);

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;
    const plan = decoded.plan;
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
```

## Success Criteria
- [ ] Request counts increment on each API call
- [ ] Rate limiting returns 429 when exceeded
- [ ] Storage calculations accurate
- [ ] Usage data queryable by month
- [ ] Different limits enforced per plan
- [ ] Retry-After header included in 429 responses