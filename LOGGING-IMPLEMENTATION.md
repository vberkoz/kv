# Error Handling & Logging Implementation

**Status:** ✅ COMPLETE  
**Priority:** HIGH  
**Date:** 2024

## Overview

Implemented structured logging with correlation IDs, custom error classes, and comprehensive error tracking across all Lambda functions.

## What Was Implemented

### 1. Structured Logging (`logger.ts`)

**Location:** `/packages/infrastructure/src/lambdas/shared/logger.ts`

**Features:**
- AWS Lambda Powertools Logger integration
- Automatic correlation ID generation and tracking
- Request/response logging middleware
- Structured JSON logs for CloudWatch Logs Insights
- Configurable log levels via environment variables

**Key Functions:**
- `logger` - Powertools Logger instance with service context
- `generateCorrelationId()` - Generate unique UUID for requests
- `addCorrelationId(event)` - Extract or generate correlation ID
- `logRequest(operation, metadata)` - Log incoming requests
- `logResponse(operation, statusCode, metadata)` - Log responses

**Usage Example:**
```typescript
const correlationId = addCorrelationId(event);
logRequest('GET_VALUE', { userId, namespace, key });
// ... operation logic
logResponse('GET_VALUE', 200, { userId, namespace, key });
```

### 2. Custom Error Classes (`errors.ts`)

**Location:** `/packages/infrastructure/src/lambdas/shared/errors.ts`

**Error Classes:**
- `AppError` - Base class with statusCode, code, message, metadata
- `ValidationError` - 400 errors for invalid input
- `UnauthorizedError` - 401 errors for auth failures
- `ForbiddenError` - 403 errors for authorization failures
- `NotFoundError` - 404 errors for missing resources
- `RateLimitError` - 429 errors for rate limits
- `InternalError` - 500 errors for unexpected failures

**Benefits:**
- Type-safe error handling
- Consistent error responses
- Rich error metadata for debugging
- Automatic error code assignment

**Usage Example:**
```typescript
if (!apiKey) {
  throw new ValidationError('Missing API key');
}

if (!result.Item) {
  throw new NotFoundError('Key not found');
}
```

### 3. Enhanced Response Builders (`response.ts`)

**Location:** `/packages/infrastructure/src/lambdas/shared/response.ts`

**Updates:**
- Added correlation ID support in headers
- Automatic error logging
- Support for AppError instances
- Structured error responses with error codes
- Retry-After header for rate limit errors

**Response Format:**
```json
{
  "statusCode": 400,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "x-correlation-id": "uuid"
  },
  "body": {
    "error": "Error message",
    "statusCode": 400,
    "code": "VALIDATION_ERROR",
    "correlationId": "uuid"
  }
}
```

### 4. Updated Lambda Handlers

**Updated Files:**
- `get-value.ts` - GET operations with logging
- `put-value.ts` - PUT operations with logging
- `delete-value.ts` - DELETE operations with logging
- `list-keys.ts` - LIST operations with logging
- `shared/auth.ts` - Authentication with logging

**Pattern Applied:**
```typescript
export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  const correlationId = addCorrelationId(event);
  
  try {
    // Validate input
    if (!apiKey) throw new ValidationError('Missing API key');
    
    // Authenticate
    const user = await validateApiKey(apiKey);
    
    // Log request
    logRequest('OPERATION', { userId: user.userId, namespace, key });
    
    // Business logic
    const result = await performOperation();
    
    // Log response
    logResponse('OPERATION', 200, { userId: user.userId });
    
    return successResponse(result, 200, correlationId);
  } catch (error) {
    if (error instanceof AppError) {
      logResponse('OPERATION', error.statusCode, { error: error.message });
      return errorResponse(error, error.statusCode, correlationId);
    }
    logger.error('Unexpected error', { error });
    return errorResponse('Internal server error', 500, correlationId);
  }
}
```

## Dependencies Added

```json
{
  "@aws-lambda-powertools/logger": "^1.14.0",
  "@aws-lambda-powertools/tracer": "^1.14.0",
  "pino": "^8.16.0"
}
```

## Benefits

### 1. Request Tracing
- Correlation IDs enable end-to-end request tracking
- Client can pass `x-correlation-id` header
- Same ID returned in response headers
- All logs tagged with correlation ID

### 2. Better Debugging
- Structured logs queryable in CloudWatch Logs Insights
- Rich error metadata (userId, namespace, operation)
- Stack traces for unexpected errors
- Request/response logging for audit trail

### 3. Error Aggregation
- Consistent error format across all endpoints
- Error codes for programmatic handling
- HTTP status codes properly mapped
- Metadata for error context

### 4. Monitoring & Alerts
- Structured logs enable metric filters
- Error rates by operation type
- User-specific error tracking
- Performance monitoring via request/response logs

## CloudWatch Logs Insights Queries

### Find all errors for a user:
```
fields @timestamp, operation, error, statusCode
| filter userId = "user-123"
| filter statusCode >= 400
| sort @timestamp desc
```

### Track a specific request:
```
fields @timestamp, operation, statusCode, message
| filter correlationId = "uuid"
| sort @timestamp asc
```

### Error rate by operation:
```
fields operation, statusCode
| filter statusCode >= 400
| stats count() by operation, statusCode
```

### Rate limit violations:
```
fields @timestamp, userId, operation
| filter statusCode = 429
| sort @timestamp desc
```

## Migration Notes

### Breaking Changes
- None - all changes are backward compatible
- Existing error handling still works
- New features are additive

### Removed Code
- Replaced `console.log` with structured logger
- Removed generic `Error` throws
- Removed `rateLimitResponse()` function (merged into errorResponse)

### Environment Variables
- `LOG_LEVEL` - Optional, defaults to INFO (DEBUG, INFO, WARN, ERROR)
- `STAGE` - Already exists, used for environment tagging

## Next Steps (Optional Enhancements)

### 1. X-Ray Tracing
- Already installed `@aws-lambda-powertools/tracer`
- Add X-Ray tracing to Lambda functions
- Visualize request flow across services

### 2. Error Aggregation Service
- Send errors to external service (Sentry, Rollbar)
- Real-time error notifications
- Error grouping and deduplication

### 3. Metrics & Dashboards
- Create CloudWatch dashboards
- Custom metrics for business KPIs
- Automated alerting on error thresholds

### 4. Log Retention
- Configure CloudWatch log retention policies
- Archive old logs to S3
- Cost optimization

## Testing

### Manual Testing
```bash
# Test with correlation ID
curl -X GET https://api.domain.com/v1/myapp/key1 \
  -H "x-api-key: your-key" \
  -H "x-correlation-id: test-123" \
  -v

# Check response headers for correlation ID
# Check CloudWatch logs for structured entries
```

### CloudWatch Logs
1. Navigate to CloudWatch > Log Groups
2. Select Lambda function log group
3. Use Logs Insights to query structured logs
4. Verify correlation IDs present in all entries

## Documentation Updated

- ✅ PROJECT-CONTEXT.md - Added logging and error handling sections
- ✅ Shared utilities documented
- ✅ Error handling patterns documented
- ✅ CloudWatch Logs Insights queries included

## Files Created

1. `/packages/infrastructure/src/lambdas/shared/logger.ts` - Structured logging
2. `/packages/infrastructure/src/lambdas/shared/errors.ts` - Custom error classes
3. `/LOGGING-IMPLEMENTATION.md` - This document

## Files Modified

1. `/packages/infrastructure/src/lambdas/shared/response.ts` - Enhanced responses
2. `/packages/infrastructure/src/lambdas/shared/auth.ts` - Added logging
3. `/packages/infrastructure/src/lambdas/get-value.ts` - Applied pattern
4. `/packages/infrastructure/src/lambdas/put-value.ts` - Applied pattern
5. `/packages/infrastructure/src/lambdas/delete-value.ts` - Applied pattern
6. `/packages/infrastructure/src/lambdas/list-keys.ts` - Applied pattern
7. `/packages/infrastructure/package.json` - Added dependencies
8. `/PROJECT-CONTEXT.md` - Updated documentation

## Deployment

```bash
# Install dependencies
cd packages/infrastructure
npm install

# Build and deploy
npm run build
npm run deploy

# Verify logs in CloudWatch
aws logs tail /aws/lambda/KVLambdaStack-getValue --follow
```

## Success Criteria

- ✅ All Lambda functions use structured logging
- ✅ Correlation IDs in all requests/responses
- ✅ Custom error classes for all error types
- ✅ Request/response logging middleware
- ✅ CloudWatch Logs Insights queries work
- ✅ No console.log statements remain
- ✅ Documentation updated
- ✅ Zero breaking changes
