# Agent Prompt 6: User Management & Authentication

## Required Skills
- **Password security**: Hashing (bcrypt), salt generation, validation, strength requirements
- **JWT tokens**: Generation, validation, expiration handling, refresh tokens
- **User management**: Registration, login, session management, account lifecycle
- **Security patterns**: Rate limiting, input validation, brute force protection
- **DynamoDB**: User entity storage, query patterns, unique constraints
- **Email validation**: RFC 5322 compliance, domain verification

## Context
From brainstorm: User signup and authentication with API key management.

**User Flow:**
1. User signs up with email/password
2. Generate API key for API access
3. JWT tokens for dashboard authentication

## Exact File Structure
```
packages/infrastructure/
└── src/
    └── lambdas/
        ├── signup.ts
        ├── login.ts
        └── generate-api-key.ts
```

## Required Dependencies (update package.json)
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/uuid": "^9.0.2"
  }
}
```

## Environment Variables
```bash
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=24h
```

## Implementation Requirements

### 1. src/lambdas/signup.ts
```typescript
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
        plan: 'free',
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
        createdAt: now
      }
    }));

    const token = jwt.sign({ userId, email, plan: 'free' }, JWT_SECRET, { expiresIn: '24h' });

    return successResponse({ token, apiKey, userId }, 201);
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return errorResponse('Email already registered', 409);
    }
    return errorResponse('Internal server error', 500);
  }
}
```

### 2. src/lambdas/login.ts
```typescript
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
```

### 3. src/lambdas/generate-api-key.ts
```typescript
import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse, errorResponse } from './shared/response';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) return errorResponse('Missing token', 401);

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const apiKey = uuidv4().replace(/-/g, '');
    const hashedApiKey = createHash('sha256').update(apiKey).digest('hex');
    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: `APIKEY#${now}`,
        GSI1PK: `APIKEY#${hashedApiKey}`,
        GSI1SK: 'METADATA',
        entityType: 'APIKEY',
        userId,
        createdAt: now
      }
    }));

    return successResponse({ apiKey }, 201);
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse('Invalid token', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
```

### 4. Update Lambda Stack and API Stack
Add new functions to lambda-stack.ts and routes to api-stack.ts:
```typescript
// In api-stack.ts:
const auth = v1.addResource('auth');
auth.addResource('signup').addMethod('POST', new LambdaIntegration(props.signup));
auth.addResource('login').addMethod('POST', new LambdaIntegration(props.login));

const apiKeys = v1.addResource('api-keys');
apiKeys.addMethod('POST', new LambdaIntegration(props.generateApiKey));
```

## Validation Rules
- Email: RFC 5322 compliant
- Password: Minimum 8 characters
- Bcrypt rounds: 12
- JWT expiry: 24 hours

## Success Criteria
- [ ] Users can signup with email/password
- [ ] Duplicate email returns 409
- [ ] Users can login and receive JWT
- [ ] API key generated on signup
- [ ] Users can generate additional API keys
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens validated correctly