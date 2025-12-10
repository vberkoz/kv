# Agent Prompt 3: Core Lambda CRUD Functions

## Required Skills
- **AWS Lambda**: Node.js runtime, handler patterns, environment variables
- **DynamoDB SDK**: DocumentClient, query/scan operations, error handling
- **TypeScript**: Async/await, type definitions, error types
- **HTTP APIs**: Status codes, request/response patterns, middleware
- **Authentication**: Bearer tokens, API key validation, security patterns
- **Error handling**: Try/catch, custom errors, logging

## Context & Dependencies
- Builds on: Prompt 2 (DynamoDB table)
- Integrates with: API Gateway (Prompt 4), User Auth (Prompt 6)
- Uses shared types from: packages/shared/types.ts
- Uses DynamoDB table from: DatabaseStack exports

## Exact File Structure
```
packages/infrastructure/
├── src/
│   ├── lambdas/
│   │   ├── get-value.ts
│   │   ├── put-value.ts
│   │   ├── delete-value.ts
│   │   └── shared/
│   │       ├── auth.ts
│   │       ├── response.ts
│   │       └── dynamodb.ts
│   └── stacks/
│       └── lambda-stack.ts
└── package.json (add AWS SDK)
```

## Required Dependencies (update package.json)
```json
{
  "name": "@kv/infrastructure",
  "version": "1.0.0",
  "dependencies": {
    "aws-cdk-lib": "^2.100.0",
    "constructs": "^10.0.0",
    "@aws-sdk/client-dynamodb": "^3.400.0",
    "@aws-sdk/lib-dynamodb": "^3.400.0",
    "@aws-sdk/util-dynamodb": "^3.400.0",
    "@kv/shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "aws-cdk": "^2.100.0",
    "esbuild": "^0.19.0"
  }
}
```

## Environment Variables & Configuration
```bash
# Lambda environment variables
TABLE_NAME=kv-storage-data
GSI_NAME=GSI1
NODE_ENV=production
LOG_LEVEL=info
```

## Required Interfaces (add to packages/shared/src/types.ts)
```typescript
export interface APIGatewayEvent {
  pathParameters: { namespace: string; key: string } | null;
  headers: { authorization?: string; [key: string]: string | undefined };
  body: string | null;
}

export interface APIResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export interface AuthenticatedUser {
  userId: string;
  plan: 'free' | 'pro' | 'scale';
  apiKey: string;
}
```

## Implementation Requirements

### 1. src/lambdas/shared/dynamodb.ts
```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);
export const TABLE_NAME = process.env.TABLE_NAME!;
export const GSI_NAME = process.env.GSI_NAME!;
```

### 2. src/lambdas/shared/response.ts
```typescript
import { APIResponse } from '@kv/shared';

export function successResponse(data: any, statusCode = 200): APIResponse {
  return {
    statusCode,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(data)
  };
}

export function errorResponse(error: string, statusCode = 400): APIResponse {
  return {
    statusCode,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ error, statusCode })
  };
}
```

### 3. src/lambdas/shared/auth.ts
```typescript
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, GSI_NAME } from './dynamodb';
import { AuthenticatedUser } from '@kv/shared';
import { createHash } from 'crypto';

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
  return {
    userId: user.userId,
    plan: user.plan,
    apiKey
  };
}
```

### 4. src/lambdas/get-value.ts
```typescript
import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { validateApiKey } from './shared/auth';
import { successResponse, errorResponse } from './shared/response';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const apiKey = event.headers.authorization?.replace('Bearer ', '');
    if (!apiKey) {
      return errorResponse('Missing API key', 401);
    }

    await validateApiKey(apiKey);

    const { namespace, key } = event.pathParameters || {};
    if (!namespace || !key) {
      return errorResponse('Missing namespace or key', 400);
    }

    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `NS#${namespace}`,
        SK: `KEY#${key}`
      }
    }));

    if (!result.Item) {
      return errorResponse('Key not found', 404);
    }

    return successResponse({ value: result.Item.value });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Invalid API key', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
```

### 5. src/lambdas/put-value.ts
```typescript
import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { validateApiKey } from './shared/auth';
import { successResponse, errorResponse } from './shared/response';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const apiKey = event.headers.authorization?.replace('Bearer ', '');
    if (!apiKey) {
      return errorResponse('Missing API key', 401);
    }

    await validateApiKey(apiKey);

    const { namespace, key } = event.pathParameters || {};
    if (!namespace || !key) {
      return errorResponse('Missing namespace or key', 400);
    }

    const body = JSON.parse(event.body || '{}');
    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `NS#${namespace}`,
        SK: `KEY#${key}`,
        GSI1PK: `NS#${namespace}`,
        GSI1SK: `KEY#${key}`,
        entityType: 'KEY',
        value: body.value,
        createdAt: now,
        updatedAt: now
      }
    }));

    return successResponse({ message: 'Value stored successfully' }, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Invalid API key', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
```

### 6. src/lambdas/delete-value.ts
```typescript
import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { validateApiKey } from './shared/auth';
import { successResponse, errorResponse } from './shared/response';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const apiKey = event.headers.authorization?.replace('Bearer ', '');
    if (!apiKey) {
      return errorResponse('Missing API key', 401);
    }

    await validateApiKey(apiKey);

    const { namespace, key } = event.pathParameters || {};
    if (!namespace || !key) {
      return errorResponse('Missing namespace or key', 400);
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `NS#${namespace}`,
        SK: `KEY#${key}`
      }
    }));

    return successResponse({ message: 'Value deleted successfully' }, 204);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Invalid API key', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
```

### 7. src/stacks/lambda-stack.ts
```typescript
import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

interface LambdaStackProps extends StackProps {
  table: Table;
}

export class LambdaStack extends Stack {
  public readonly getValue: NodejsFunction;
  public readonly putValue: NodejsFunction;
  public readonly deleteValue: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const environment = {
      TABLE_NAME: props.table.tableName,
      GSI_NAME: 'GSI1',
      NODE_ENV: 'production'
    };

    this.getValue = new NodejsFunction(this, 'GetValueFunction', {
      entry: 'src/lambdas/get-value.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment
    });

    this.putValue = new NodejsFunction(this, 'PutValueFunction', {
      entry: 'src/lambdas/put-value.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment
    });

    this.deleteValue = new NodejsFunction(this, 'DeleteValueFunction', {
      entry: 'src/lambdas/delete-value.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment
    });

    props.table.grantReadWriteData(this.getValue);
    props.table.grantReadWriteData(this.putValue);
    props.table.grantReadWriteData(this.deleteValue);
  }
}
```

### 8. Update src/app.ts
```typescript
import { App } from 'aws-cdk-lib';
import { DatabaseStack } from './stacks/database-stack';
import { LambdaStack } from './stacks/lambda-stack';

const app = new App();

const databaseStack = new DatabaseStack(app, 'KVDatabaseStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

const lambdaStack = new LambdaStack(app, 'KVLambdaStack', {
  table: databaseStack.table,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

lambdaStack.addDependency(databaseStack);

app.synth();
```

## Error Handling
- **401 Unauthorized**: Invalid/missing API key
- **403 Forbidden**: Namespace access denied
- **404 Not Found**: Key doesn't exist (GET/DELETE)
- **400 Bad Request**: Invalid JSON, validation errors
- **500 Internal Error**: DynamoDB errors, unexpected failures

## Testing Scenarios
1. **Happy path**: Valid API key, existing namespace/key
2. **Auth failure**: Missing/invalid API key
3. **Not found**: Non-existent key (GET/DELETE)
4. **Validation**: Invalid namespace/key format
5. **DynamoDB errors**: Connection failures, throttling

## Performance Targets
- Lambda cold start: <1 second
- Warm execution: <100ms
- DynamoDB query: <10ms
- Memory usage: 128MB sufficient

## Security Requirements
- API key hashing: SHA-256
- Input validation: Sanitize namespace/key
- Namespace isolation: Users can only access their namespaces
- Request logging: No sensitive data in logs

## Success Criteria (Testable)
- [ ] All Lambda functions deploy via CDK
- [ ] GET returns 200 for existing keys, 404 for missing
- [ ] PUT creates/updates keys, returns 201/200
- [ ] DELETE removes keys, returns 204
- [ ] Invalid API key returns 401
- [ ] Cross-namespace access blocked (403)
- [ ] Error responses follow standard format
- [ ] All functions complete within timeout

## Integration Points for Next Prompts
- Export Lambda function ARNs for API Gateway
- Auth middleware will be used by namespace functions
- Response helpers used across all endpoints
- DynamoDB client shared with user management