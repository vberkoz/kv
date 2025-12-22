# Error Handling & Logging - Quick Reference

## For Lambda Function Development

### 1. Import Required Utilities

```typescript
import { logger, addCorrelationId, logRequest, logResponse } from './shared/logger';
import { AppError, ValidationError, UnauthorizedError, NotFoundError, RateLimitError } from './shared/errors';
import { successResponse, errorResponse } from './shared/response';
```

### 2. Handler Pattern

```typescript
export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
  const correlationId = addCorrelationId(event);
  
  try {
    // 1. Validate input
    if (!requiredField) {
      throw new ValidationError('Missing required field');
    }
    
    // 2. Authenticate
    const user = await validateApiKey(apiKey);
    
    // 3. Log request
    logRequest('OPERATION_NAME', { 
      userId: user.userId, 
      namespace, 
      key 
    });
    
    // 4. Business logic
    const result = await performOperation();
    
    // 5. Log success
    logResponse('OPERATION_NAME', 200, { 
      userId: user.userId 
    });
    
    // 6. Return response
    return successResponse(result, 200, correlationId);
    
  } catch (error) {
    // Handle known errors
    if (error instanceof AppError) {
      logResponse('OPERATION_NAME', error.statusCode, { 
        error: error.message 
      });
      return errorResponse(error, error.statusCode, correlationId);
    }
    
    // Handle unexpected errors
    logger.error('Unexpected error in OPERATION_NAME', { error });
    logResponse('OPERATION_NAME', 500);
    return errorResponse('Internal server error', 500, correlationId);
  }
}
```

### 3. Error Classes

```typescript
// 400 - Bad Request
throw new ValidationError('Invalid input');
throw new ValidationError('Missing field', { field: 'email' });

// 401 - Unauthorized
throw new UnauthorizedError('Invalid API key');
throw new UnauthorizedError(); // Default message

// 404 - Not Found
throw new NotFoundError('Key not found');
throw new NotFoundError(); // Default message

// 429 - Rate Limit
throw new RateLimitError();
throw new RateLimitError('Daily limit exceeded');

// 500 - Internal Error
throw new InternalError('Database connection failed');
```

### 4. Logging

```typescript
// Debug logs (only in DEBUG mode)
logger.debug('Processing request', { userId, namespace });

// Info logs (default level)
logger.info('User created', { userId, email });

// Warning logs
logger.warn('Rate limit approaching', { userId, usage: 9500, limit: 10000 });

// Error logs
logger.error('Operation failed', { error, userId, operation });

// Request/Response logging
logRequest('GET_VALUE', { userId, namespace, key });
logResponse('GET_VALUE', 200, { userId, keyCount: 5 });
```

### 5. Correlation IDs

```typescript
// Add correlation ID at start of handler
const correlationId = addCorrelationId(event);

// It's automatically added to:
// - All logger calls
// - Response headers
// - Error responses

// Client can provide correlation ID:
// x-correlation-id: custom-trace-id
```

## CloudWatch Logs Insights Queries

### All errors for a user
```
fields @timestamp, operation, error, statusCode
| filter userId = "user-123" and statusCode >= 400
| sort @timestamp desc
```

### Trace a request
```
fields @timestamp, operation, statusCode, message
| filter correlationId = "uuid"
| sort @timestamp asc
```

### Error rate by operation
```
stats count() by operation, statusCode
| filter statusCode >= 400
```

### Slow requests (>1s)
```
fields @timestamp, operation, @duration
| filter @duration > 1000
| sort @duration desc
```

### Rate limit violations
```
fields @timestamp, userId, operation, plan
| filter statusCode = 429
| sort @timestamp desc
```

## Environment Variables

```bash
# Optional - defaults to INFO
LOG_LEVEL=DEBUG  # DEBUG | INFO | WARN | ERROR

# Already exists
STAGE=prod  # Used for environment tagging in logs
```

## Response Format

### Success Response
```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "x-correlation-id": "uuid"
  },
  "body": "{\"data\":\"value\"}"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "x-correlation-id": "uuid"
  },
  "body": {
    "error": "Missing required field",
    "statusCode": 400,
    "code": "VALIDATION_ERROR",
    "correlationId": "uuid"
  }
}
```

## Testing

### Local Testing
```typescript
// Mock event with correlation ID
const event = {
  headers: {
    'x-correlation-id': 'test-123',
    'x-api-key': 'test-key'
  },
  pathParameters: { namespace: 'test', key: 'key1' }
};

const response = await handler(event);
console.log(response.headers['x-correlation-id']); // test-123
```

### CloudWatch Testing
```bash
# Tail logs in real-time
aws logs tail /aws/lambda/KVLambdaStack-getValue --follow

# Filter by correlation ID
aws logs tail /aws/lambda/KVLambdaStack-getValue \
  --filter-pattern "test-123" \
  --follow
```

## Best Practices

1. **Always add correlation ID first**
   ```typescript
   const correlationId = addCorrelationId(event);
   ```

2. **Log request at start, response at end**
   ```typescript
   logRequest('OPERATION', metadata);
   // ... logic
   logResponse('OPERATION', statusCode, metadata);
   ```

3. **Use specific error classes**
   ```typescript
   // Good
   throw new ValidationError('Invalid email format');
   
   // Bad
   throw new Error('Invalid email format');
   ```

4. **Include context in logs**
   ```typescript
   // Good
   logger.info('User created', { userId, email, plan });
   
   // Bad
   logger.info('User created');
   ```

5. **Handle both known and unknown errors**
   ```typescript
   catch (error) {
     if (error instanceof AppError) {
       // Handle known errors
     }
     // Always handle unexpected errors
     logger.error('Unexpected error', { error });
   }
   ```

6. **Don't log sensitive data**
   ```typescript
   // Bad
   logger.info('Auth attempt', { password, apiKey });
   
   // Good
   logger.info('Auth attempt', { userId, method: 'api-key' });
   ```

## Migration Checklist

When updating existing Lambda functions:

- [ ] Import logger, errors, and response utilities
- [ ] Add `addCorrelationId(event)` at start
- [ ] Replace `console.log` with `logger.info/debug/warn/error`
- [ ] Replace generic `Error` with specific error classes
- [ ] Add `logRequest()` after authentication
- [ ] Add `logResponse()` before returning
- [ ] Pass `correlationId` to response functions
- [ ] Update error handling to use `AppError` instanceof check
- [ ] Remove any `console.log` statements
- [ ] Test with CloudWatch Logs Insights queries
