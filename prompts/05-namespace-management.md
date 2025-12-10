# Agent Prompt 5: Namespace Management

## Required Skills
- **DynamoDB queries**: Prefix queries, begins_with operations, query optimization
- **Multi-tenancy**: Data isolation, access control patterns, namespace design
- **Input validation**: Regex patterns, sanitization, business rule enforcement
- **REST API design**: Resource naming, HTTP semantics, endpoint structure
- **AWS Lambda**: Extended handler patterns, shared middleware, error handling
- **TypeScript**: Type guards, validation functions, error types

## Context
From brainstorm API design:
```
POST   /v1/namespaces                    # Create namespace
GET    /v1/namespaces                    # List user namespaces
GET    /v1/{namespace}?prefix=user:      # List keys with prefix
```

## Exact File Structure
```
packages/infrastructure/
└── src/
    └── lambdas/
        ├── create-namespace.ts
        ├── list-namespaces.ts
        └── list-keys.ts
```

## Implementation Requirements

### 1. src/lambdas/create-namespace.ts
```typescript
import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { validateApiKey } from './shared/auth';
import { successResponse, errorResponse } from './shared/response';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const apiKey = event.headers.authorization?.replace('Bearer ', '');
    if (!apiKey) return errorResponse('Missing API key', 401);

    const user = await validateApiKey(apiKey);
    const body = JSON.parse(event.body || '{}');
    const { name } = body;

    if (!name || !/^[a-z0-9-]{1,50}$/.test(name)) {
      return errorResponse('Invalid namespace name', 400);
    }

    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `NS#${name}`,
        SK: 'METADATA',
        GSI1PK: `USER#${user.userId}`,
        GSI1SK: `NS#${name}`,
        entityType: 'NAMESPACE',
        userId: user.userId,
        name,
        createdAt: now,
        updatedAt: now
      },
      ConditionExpression: 'attribute_not_exists(PK)'
    }));

    return successResponse({ namespace: name }, 201);
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return errorResponse('Namespace already exists', 409);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Invalid API key', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
```

### 2. src/lambdas/list-namespaces.ts
```typescript
import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, GSI_NAME } from './shared/dynamodb';
import { validateApiKey } from './shared/auth';
import { successResponse, errorResponse } from './shared/response';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const apiKey = event.headers.authorization?.replace('Bearer ', '');
    if (!apiKey) return errorResponse('Missing API key', 401);

    const user = await validateApiKey(apiKey);

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${user.userId}`,
        ':sk': 'NS#'
      }
    }));

    const namespaces = (result.Items || []).map(item => ({
      name: item.name,
      createdAt: item.createdAt
    }));

    return successResponse({ namespaces });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Invalid API key', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
```

### 3. src/lambdas/list-keys.ts
```typescript
import { APIGatewayEvent, APIResponse } from '@kv/shared';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { validateApiKey } from './shared/auth';
import { successResponse, errorResponse } from './shared/response';

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  try {
    const apiKey = event.headers.authorization?.replace('Bearer ', '');
    if (!apiKey) return errorResponse('Missing API key', 401);

    await validateApiKey(apiKey);

    const { namespace } = event.pathParameters || {};
    const prefix = event.queryStringParameters?.prefix || '';

    if (!namespace) {
      return errorResponse('Missing namespace', 400);
    }

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `NS#${namespace}`,
        ':sk': `KEY#${prefix}`
      }
    }));

    const keys = (result.Items || []).map(item => ({
      key: item.SK.replace('KEY#', ''),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    return successResponse({ keys });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Invalid API key', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
```

### 4. Update src/stacks/lambda-stack.ts
```typescript
// Add to LambdaStack class:
public readonly createNamespace: NodejsFunction;
public readonly listNamespaces: NodejsFunction;
public readonly listKeys: NodejsFunction;

// In constructor, add:
this.createNamespace = new NodejsFunction(this, 'CreateNamespaceFunction', {
  entry: 'src/lambdas/create-namespace.ts',
  handler: 'handler',
  runtime: Runtime.NODEJS_18_X,
  timeout: Duration.seconds(10),
  environment
});

this.listNamespaces = new NodejsFunction(this, 'ListNamespacesFunction', {
  entry: 'src/lambdas/list-namespaces.ts',
  handler: 'handler',
  runtime: Runtime.NODEJS_18_X,
  timeout: Duration.seconds(10),
  environment
});

this.listKeys = new NodejsFunction(this, 'ListKeysFunction', {
  entry: 'src/lambdas/list-keys.ts',
  handler: 'handler',
  runtime: Runtime.NODEJS_18_X,
  timeout: Duration.seconds(10),
  environment
});

props.table.grantReadWriteData(this.createNamespace);
props.table.grantReadData(this.listNamespaces);
props.table.grantReadData(this.listKeys);
```

### 5. Update src/stacks/api-stack.ts
```typescript
// Update ApiStackProps interface:
interface ApiStackProps extends StackProps {
  getValue: NodejsFunction;
  putValue: NodejsFunction;
  deleteValue: NodejsFunction;
  createNamespace: NodejsFunction;
  listNamespaces: NodejsFunction;
  listKeys: NodejsFunction;
}

// In constructor, add routes:
const namespaces = v1.addResource('namespaces');
namespaces.addMethod('POST', new LambdaIntegration(props.createNamespace));
namespaces.addMethod('GET', new LambdaIntegration(props.listNamespaces));

namespace.addMethod('GET', new LambdaIntegration(props.listKeys));
```

## Validation Rules
- Namespace name: `/^[a-z0-9-]{1,50}$/`
- Only lowercase alphanumeric and hyphens
- 1-50 characters length

## Success Criteria
- [ ] Users can create namespaces
- [ ] Duplicate namespace returns 409
- [ ] Users can list their namespaces
- [ ] Namespace isolation enforced
- [ ] Prefix queries work correctly
- [ ] Invalid namespace names rejected