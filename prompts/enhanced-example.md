# Enhanced Prompt Example: DynamoDB Table (Improved Version of Prompt 2)

## Context & Dependencies
- First infrastructure component
- Will be used by: Lambda functions (Prompt 3), API Gateway (Prompt 4)
- Integrates with: None (foundational)

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
  "dependencies": {
    "aws-cdk-lib": "^2.100.0",
    "constructs": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

## Environment Variables & Configuration
```bash
# CDK context (cdk.json)
TABLE_NAME=kv-storage-data
GSI_NAME=GSI1
BILLING_MODE=PAY_PER_REQUEST
REGION=us-east-1
```

## Required Interfaces (dynamodb-types.ts)
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

### 1. DynamoDB Table Configuration
```typescript
const table = new Table(this, 'KVStorageTable', {
  tableName: 'kv-storage-data',
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  pointInTimeRecovery: true,
  removalPolicy: RemovalPolicy.RETAIN
});
```

### 2. Global Secondary Index
```typescript
table.addGlobalSecondaryIndex({
  indexName: 'GSI1',
  partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
  sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL
});
```

### 3. Access Patterns to Support
1. Get user by userId: `PK=USER#123, SK=METADATA`
2. Get user by API key: `GSI1PK=APIKEY#abc, GSI1SK=METADATA`
3. List user namespaces: `PK=USER#123, SK begins_with NS#`
4. Get namespace metadata: `PK=NS#xyz, SK=METADATA`
5. CRUD key in namespace: `PK=NS#xyz, SK=KEY#mykey`
6. List keys by prefix: `GSI1PK=NS#xyz, GSI1SK begins_with KEY#prefix`

## Error Handling
- Stack deployment failure: Check IAM permissions
- Table already exists: Use `RemovalPolicy.RETAIN`
- Invalid attribute types: Validate against interfaces

## Testing Scenarios
1. **CDK Synth**: `cdk synth` produces valid CloudFormation
2. **Deploy**: `cdk deploy` creates table successfully
3. **Access Patterns**: All 6 patterns can be queried
4. **GSI**: Secondary index supports API key lookups

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

## Validation Rules
- PK format: Must match entity patterns
- SK format: Must match sort key patterns
- Required fields: PK, SK, entityType, createdAt, updatedAt
- Optional fields: Based on entity type

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

## Integration Points for Next Prompts
- Export table name as: `this.tableName`
- Export table ARN as: `this.tableArn`
- Export GSI name as: `this.gsiName`
- Lambda functions will import these values
- IAM roles will reference table ARN

## Sample Data for Testing
```typescript
// User entity
{
  PK: "USER#user123",
  SK: "METADATA",
  entityType: "USER",
  userId: "user123",
  email: "test@example.com",
  apiKey: "abc123...",
  plan: "free",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}

// Key entity
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