# Prompt Improvement Guide for Maximum Generation Accuracy

## 1. Add Specific File Paths & Structure

**Before:**
```
Create Lambda functions for CRUD operations
```

**After:**
```
Create these exact files:
- packages/infrastructure/src/lambdas/get-value.ts
- packages/infrastructure/src/lambdas/put-value.ts  
- packages/infrastructure/src/lambdas/delete-value.ts
- packages/infrastructure/src/lambdas/shared/auth.ts
```

## 2. Include Exact Code Snippets & Interfaces

**Before:**
```
Create user authentication system
```

**After:**
```
Create authentication with this exact interface:
```typescript
interface User {
  userId: string;
  email: string;
  passwordHash: string;
  apiKey: string;
  plan: 'free' | 'pro' | 'scale';
  createdAt: string;
}
```

## 3. Specify Dependencies & Versions

**Before:**
```
Use AWS CDK for infrastructure
```

**After:**
```
Use these exact dependencies in package.json:
- aws-cdk-lib: ^2.100.0
- @aws-cdk/aws-lambda-nodejs: ^2.100.0
- typescript: ^5.0.0
```

## 4. Add Environment Variables & Configuration

**Before:**
```
Set up DynamoDB table
```

**After:**
```
Use these environment variables:
- TABLE_NAME: kv-storage-data
- GSI_NAME: GSI1
- AWS_REGION: us-east-1

CDK context values:
- domain: kv.vberkoz.com
- certificateArn: (to be created)
```

## 5. Include Error Handling Patterns

**Before:**
```
Add error handling
```

**After:**
```
Use this exact error response format:
```json
{
  "error": "NAMESPACE_NOT_FOUND",
  "message": "Namespace 'xyz' does not exist",
  "statusCode": 404
}
```

## 6. Specify Testing Requirements

**Before:**
```
Create the component
```

**After:**
```
Create component with these test cases:
1. Successful API key creation
2. Invalid email format error
3. Duplicate namespace error
4. Rate limit exceeded (429 response)
```

## 7. Add Integration Points

**Before:**
```
Create API Gateway
```

**After:**
```
Integrate with existing:
- DynamoDB table from prompt 2
- Lambda functions from prompt 3
- Use shared types from packages/shared/types.ts
```

## 8. Include Performance Requirements

**Before:**
```
Implement caching
```

**After:**
```
Performance targets:
- API response time: <200ms
- DynamoDB read capacity: 5 RCU
- Lambda cold start: <1s
- Cache TTL: 300 seconds
```

## 9. Specify Security Requirements

**Before:**
```
Add authentication
```

**After:**
```
Security requirements:
- API keys: 32-character hex strings
- Password hashing: bcrypt with 12 rounds
- JWT expiry: 24 hours
- CORS origins: https://kv.vberkoz.com
```

## 10. Add Validation Rules

**Before:**
```
Validate input
```

**After:**
```
Validation rules:
- Namespace: /^[a-z0-9-]{1,50}$/
- Key: /^[a-zA-Z0-9:._-]{1,200}$/
- Value: JSON, max 1MB
- Email: RFC 5322 compliant
```

## Enhanced Prompt Template

```markdown
# Agent Prompt X: [Feature Name]

## Context & Dependencies
- Builds on: Prompt X-1 (specific files)
- Integrates with: [exact file paths]
- Uses shared types from: packages/shared/types.ts

## Exact File Structure
```
packages/[package]/
├── src/
│   ├── [specific-file].ts
│   └── [another-file].ts
└── package.json (add these deps)
```

## Required Interfaces
```typescript
interface ExactInterface {
  field: string;
}
```

## Environment Variables
- VAR_NAME=value
- ANOTHER_VAR=value

## Implementation Requirements
1. [Specific requirement with example]
2. [Another requirement with code snippet]

## Error Handling
- Error code: HTTP_STATUS
- Response format: [exact JSON]

## Testing Scenarios
1. Happy path: [specific input/output]
2. Error case: [specific error condition]

## Performance Targets
- Metric: <value
- Another metric: <value

## Security Requirements
- [Specific security rule]
- [Another security rule]

## Success Criteria (Testable)
- [ ] File X exists with function Y
- [ ] API returns status Z for input W
- [ ] Error handling works for case V
```

## Key Principles

1. **Be Specific**: Exact file names, not "create files"
2. **Show Examples**: Code snippets, not descriptions
3. **Define Interfaces**: TypeScript types for all data
4. **Specify Dependencies**: Exact versions and packages
5. **Include Tests**: Specific scenarios to verify
6. **Set Constraints**: Performance, security, validation rules
7. **Reference Previous Work**: Build on existing code
8. **Provide Context**: Why this step matters
9. **Make it Testable**: Clear success criteria
10. **Handle Errors**: Specific error cases and responses