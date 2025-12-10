# Agent Prompt 2: DynamoDB Single Table Design

## Required Skills
- **AWS CDK v2**: Stack creation, constructs, TypeScript configuration
- **DynamoDB**: Single table design, partition/sort keys, GSI, access patterns
- **NoSQL data modeling**: Entity relationships, query optimization
- **IAM**: Least privilege policies, resource-based permissions
- **TypeScript**: Interfaces, type safety, module exports

## Context & Dependencies
- Builds on: Prompt 1 (monorepo structure)
- Integrates with: Lambda functions (Prompt 3), API Gateway (Prompt 4)
- Uses shared types from: packages/shared/types.ts

## Exact File Structure
```
packages/infrastructure/
├── src/
│   ├── stacks/
│   │   └── database-stack.ts
│   ├── app.ts
│   └── types/
│       └── dynamodb-types.ts
├── package.json
├── tsconfig.json
└── cdk.json
```

## Required Dependencies (package.json)
```json
{
  "name": "@kv/infrastructure",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "synth": "cdk synth",
    "deploy": "cdk deploy --all",
    "clean": "rm -rf dist cdk.out"
  },
  "dependencies": {
    "aws-cdk-lib": "^2.100.0",
    "constructs": "^10.0.0",
    "@kv/shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "aws-cdk": "^2.100.0"
  }
}
```

## Environment Variables & Configuration

### cdk.json
```json
{
  "app": "npx ts-node src/app.ts",
  "context": {
    "tableName": "kv-storage-data",
    "gsiName": "GSI1",
    "@aws-cdk/core:newStyleStackSynthesis": true
  }
}
```

## Required Interfaces (src/types/dynamodb-types.ts)
```typescript
export interface UserEntity {
  PK: `USER#${string}`;
  SK: 'METADATA' | `NS#${string}`;
  entityType: 'USER' | 'NAMESPACE';
  userId?: string;
  email?: string;
  passwordHash?: string;
  apiKey?: string;
  plan?: 'free' | 'pro' | 'scale';
  requestCount?: number;
  storageBytes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KeyEntity {
  PK: `NS#${string}`;
  SK: `KEY#${string}` | 'METADATA';
  GSI1PK?: `APIKEY#${string}` | `NS#${string}`;
  GSI1SK?: 'METADATA' | `KEY#${string}`;
  entityType: 'KEY' | 'NAMESPACE';
  value?: any;
  ttl?: number;
  createdAt: string;
  updatedAt: string;
}
```

## Implementation Requirements

### 1. src/stacks/database-stack.ts
```typescript
import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table, AttributeType, BillingMode, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';

export class DatabaseStack extends Stack {
  public readonly table: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const tableName = this.node.tryGetContext('tableName') || 'kv-storage-data';
    const gsiName = this.node.tryGetContext('gsiName') || 'GSI1';

    this.table = new Table(this, 'KVStorageTable', {
      tableName,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.RETAIN,
      encryption: TableEncryption.AWS_MANAGED
    });

    this.table.addGlobalSecondaryIndex({
      indexName: gsiName,
      partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL
    });
  }
}
```

### 2. src/app.ts
```typescript
import { App } from 'aws-cdk-lib';
import { DatabaseStack } from './stacks/database-stack';

const app = new App();

new DatabaseStack(app, 'KVDatabaseStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

app.synth();
```

### 3. Access Patterns to Support
1. Get user by userId: `PK=USER#123, SK=METADATA`
2. Get user by API key: `GSI1PK=APIKEY#abc, GSI1SK=METADATA`
3. List user namespaces: `PK=USER#123, SK begins_with NS#`
4. Get namespace metadata: `PK=NS#xyz, SK=METADATA`
5. CRUD key in namespace: `PK=NS#xyz, SK=KEY#mykey`
6. List keys by prefix: `GSI1PK=NS#xyz, GSI1SK begins_with KEY#prefix`

## Performance Targets
- Read latency: <10ms (single-digit milliseconds)
- Write latency: <10ms
- GSI eventual consistency: <1 second
- Auto-scaling: Not needed (pay-per-request)

## Security Requirements
- Encryption at rest: AWS managed keys
- Encryption in transit: TLS 1.2+
- IAM roles: Least privilege access
- VPC endpoints: Not required for this use case

## Success Criteria (Testable)
- [ ] `cdk synth` generates valid CloudFormation template
- [ ] `cdk deploy` creates table without errors
- [ ] Table has correct partition key (PK) and sort key (SK)
- [ ] GSI1 exists with GSI1PK and GSI1SK
- [ ] Billing mode is PAY_PER_REQUEST
- [ ] Point-in-time recovery is enabled
- [ ] All 6 access patterns can be demonstrated with sample queries
- [ ] TypeScript interfaces compile without errors
- [ ] Table exports are available for other stacks

## Sample Data for Testing
```typescript
// User entity example
{
  PK: "USER#user123",
  SK: "METADATA",
  entityType: "USER",
  userId: "user123",
  email: "test@example.com",
  apiKey: "abc123def456",
  plan: "free",
  requestCount: 0,
  storageBytes: 0,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}

// Namespace entity example
{
  PK: "NS#myapp",
  SK: "METADATA",
  GSI1PK: "USER#user123",
  GSI1SK: "NS#myapp",
  entityType: "NAMESPACE",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}

// Key-value entity example
{
  PK: "NS#myapp",
  SK: "KEY#user:123",
  GSI1PK: "NS#myapp",
  GSI1SK: "KEY#user:123",
  entityType: "KEY",
  value: {"name": "John", "email": "john@example.com"},
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

## Integration Points for Next Prompts
- Export table as public property: `public readonly table: Table`
- Lambda functions will reference: `databaseStack.table`
- Table name available via: `databaseStack.table.tableName`
- Table ARN available via: `databaseStack.table.tableArn`
- GSI name from context: `this.node.tryGetContext('gsiName')`