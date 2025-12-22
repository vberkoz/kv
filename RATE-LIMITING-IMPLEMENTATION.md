# API Rate Limiting Implementation

## Overview

Implemented two-tier rate limiting system with token bucket algorithm for per-second limits and DynamoDB-based monthly quota tracking.

## Implementation Details

### 1. Per-Second Rate Limiting (Token Bucket)

**File:** `/packages/infrastructure/src/lambdas/shared/rate-limiter.ts`

**Features:**
- Token bucket algorithm using `rate-limiter-flexible` library
- In-memory sliding window for accurate rate limiting
- Plan-based limits with burst allowance
- Returns rate limit headers for client-side throttling

**Rate Limits by Plan:**
- **Free:** 10 req/s (burst: 20)
- **Starter:** 50 req/s (burst: 100)
- **Pro:** 100 req/s (burst: 200)
- **Scale:** 500 req/s (burst: 1000)
- **Business:** 1000 req/s (burst: 2000)

### 2. Monthly Quota Tracking

**File:** `/packages/infrastructure/src/lambdas/shared/usage.ts`

**Features:**
- DynamoDB-based usage tracking
- Monthly request count per user
- 80% threshold alerts
- Plan-based monthly limits

### 3. Rate Limit Headers

All API responses include standard rate limit headers:

```
X-RateLimit-Limit: 100          # Max requests per second
X-RateLimit-Remaining: 87       # Remaining in current window
X-RateLimit-Reset: 1704067200   # Unix timestamp when limit resets
Retry-After: 1                  # Seconds to wait (on 429 errors)
```

### 4. Integration Points

**Authentication (`auth.ts`):**
- Per-second rate limit checked first (fast fail)
- Monthly quota checked second
- Rate limit headers returned with user context

**Middleware (`middleware.ts`):**
- Rate limit headers stored in Lambda context
- Headers automatically added to all responses
- Error responses include rate limit headers

**Response Builder (`response.ts`):**
- Updated to accept rate limit headers parameter
- Headers merged into response

## Flow Diagram

```
API Request
    ↓
API Key Validation
    ↓
Per-Second Rate Limit Check (Token Bucket)
    ↓ (if allowed)
Monthly Quota Check (DynamoDB)
    ↓ (if allowed)
Increment Request Count
    ↓
Process Request
    ↓
Add Rate Limit Headers to Response
    ↓
Return Response
```

## Error Handling

**429 Rate Limit Exceeded:**
```json
{
  "error": "Rate limit exceeded",
  "statusCode": 429,
  "code": "RATE_LIMIT_EXCEEDED",
  "correlationId": "uuid"
}
```

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067201
Retry-After: 1
```

## Benefits

1. **Fair Usage:** Prevents abuse and ensures fair resource allocation
2. **Client-Side Throttling:** Headers enable smart client retry logic
3. **Plan Differentiation:** Higher tiers get higher limits
4. **Burst Allowance:** Paid plans can handle traffic spikes
5. **Fast Fail:** Per-second check prevents unnecessary DB queries
6. **Accurate Limiting:** Sliding window algorithm prevents edge cases

## Testing

Test rate limiting with curl:

```bash
# Make rapid requests to trigger rate limit
for i in {1..20}; do
  curl -X GET https://api.domain.com/v1/myapp/test \
    -H "x-api-key: your-api-key" \
    -i
done
```

Expected behavior:
- First 10 requests succeed (Free plan)
- Requests 11-20 return 429 with Retry-After header
- Rate limit headers show remaining capacity

## Dependencies

**Added:**
- `rate-limiter-flexible@^3.0.0` - Token bucket rate limiting

**Location:** `/packages/infrastructure/package.json`

## Files Modified

1. `/packages/infrastructure/src/lambdas/shared/rate-limiter.ts` (NEW)
2. `/packages/infrastructure/src/lambdas/shared/auth.ts`
3. `/packages/infrastructure/src/lambdas/shared/middleware.ts`
4. `/packages/infrastructure/src/lambdas/shared/response.ts`
5. `/packages/infrastructure/package.json`
6. `/PROJECT-CONTEXT.md`

## Deployment

```bash
# Install dependencies
npm install

# Build infrastructure
npm run build

# Deploy to AWS
npm run deploy:infra
```

## Future Enhancements

- Redis-based rate limiting for multi-Lambda coordination
- Per-endpoint rate limits (e.g., stricter limits on write operations)
- Rate limit analytics dashboard
- Dynamic rate limit adjustment based on system load
