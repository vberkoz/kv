# Agent Prompt 4: API Gateway Setup

## Required Skills
- **AWS API Gateway**: REST API configuration, CORS, routing, request validation
- **Lambda integration**: Proxy integration, request/response mapping, error handling
- **HTTP methods**: GET, POST, PUT, DELETE handling, proper status codes
- **AWS CDK**: API Gateway constructs, integration patterns, deployment stages
- **CORS configuration**: Headers, origins, methods, credentials handling
- **Authentication**: API key validation, authorization patterns

## Context
From brainstorm: REST API with the following endpoints:
```
GET    /v1/{namespace}/{key}             # Get value
PUT    /v1/{namespace}/{key}             # Set value
DELETE /v1/{namespace}/{key}             # Delete value
```

## Exact File Structure
```
packages/infrastructure/
└── src/
    └── stacks/
        └── api-stack.ts
```

## Implementation Requirements

### 1. src/stacks/api-stack.ts
```typescript
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RestApi, LambdaIntegration, Cors } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

interface ApiStackProps extends StackProps {
  getValue: NodejsFunction;
  putValue: NodejsFunction;
  deleteValue: NodejsFunction;
}

export class ApiStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.api = new RestApi(this, 'KVStorageApi', {
      restApiName: 'KV Storage API',
      description: 'Serverless key-value storage API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    const v1 = this.api.root.addResource('v1');
    const namespace = v1.addResource('{namespace}');
    const key = namespace.addResource('{key}');

    key.addMethod('GET', new LambdaIntegration(props.getValue));
    key.addMethod('PUT', new LambdaIntegration(props.putValue));
    key.addMethod('DELETE', new LambdaIntegration(props.deleteValue));
  }
}
```

### 2. Update src/app.ts
```typescript
import { App } from 'aws-cdk-lib';
import { DatabaseStack } from './stacks/database-stack';
import { LambdaStack } from './stacks/lambda-stack';
import { ApiStack } from './stacks/api-stack';

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

const apiStack = new ApiStack(app, 'KVApiStack', {
  getValue: lambdaStack.getValue,
  putValue: lambdaStack.putValue,
  deleteValue: lambdaStack.deleteValue,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

lambdaStack.addDependency(databaseStack);
apiStack.addDependency(lambdaStack);

app.synth();
```

## CORS Configuration
- Allow all origins (restrict in production)
- Allow methods: GET, PUT, DELETE, OPTIONS
- Allow headers: Content-Type, Authorization

## Testing
Test API endpoints:
```bash
# Get API URL from CDK output
API_URL=$(aws cloudformation describe-stacks --stack-name KVApiStack --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text)

# PUT value
curl -X PUT "$API_URL/v1/myapp/user:123" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value": {"name": "John"}}'

# GET value
curl "$API_URL/v1/myapp/user:123" \
  -H "Authorization: Bearer YOUR_API_KEY"

# DELETE value
curl -X DELETE "$API_URL/v1/myapp/user:123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Success Criteria
- [ ] API Gateway deploys via CDK
- [ ] Routes properly connect to Lambda functions
- [ ] CORS headers present in responses
- [ ] GET/PUT/DELETE methods work correctly
- [ ] Authorization header passed to Lambda
- [ ] Error responses properly formatted
- [ ] API URL output available from stack