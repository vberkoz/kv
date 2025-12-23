# KV Storage - Project Context

**Project Name:** KV Storage  
**Tagline:** Serverless key-value storage API  
**Status:** Implementation complete, UI/UX Phase 1 deployed, Error Handling & Logging implemented, Lambda Best Practices implemented, API Rate Limiting implemented, State Management implemented, UI Component Library implemented, Error Boundaries implemented, ready for launch

## Core Value Proposition

Simple REST API for storing and retrieving JSON data without managing infrastructure. Provides DynamoDB power without AWS complexity, targeting serverless developers who need scalable key-value storage with predictable pricing.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Landing (domain.com)          Dashboard (dashboard.domain.com) │
│  ├─ Astro Static Site          ├─ React SPA                     │
│  └─ S3 Bucket                  └─ S3 Bucket                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (api.domain.com)                 │
│                         REST API + JWT Auth                     │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Lambda Functions                        │
│  ├─ KV Operations (GET/PUT/DELETE/LIST)                         │
│  ├─ Auth (Signup/Login)                                         │
│  ├─ Namespace Management                                        │
│  ├─ API Key Management                                          │
│  ├─ Usage Tracking                                              │
│  └─ Paddle Webhooks                                             │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DynamoDB (Single Table)                      │
│  ├─ Users, Namespaces, Keys, API Keys                           │
│  └─ GSI for API key lookups                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Amazon Cognito                             │
│                   User Pool + JWT Tokens                        │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Backend
- **Runtime:** Node.js 18.x
- **Language:** TypeScript 5.0+
- **API:** AWS API Gateway (REST API)
- **Compute:** AWS Lambda
- **Database:** Amazon DynamoDB (Single Table Design)
- **Auth:** Amazon Cognito (JWT tokens)
- **Monitoring:** CloudWatch Logs & Metrics
- **Infrastructure:** AWS CDK (TypeScript)

### Frontend
- **Landing Pages:** Astro (Static Site Generation)
- **Dashboard:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Hosting:** S3 + CloudFront
- **Build Tool:** Vite

### Payments
- **Provider:** Paddle
- **Integration:** Webhook-based subscription management

### Development
- **Package Manager:** npm workspaces
- **Monorepo:** 5 packages
- **Version Control:** Git + GitHub
- **Deployment:** Manual via CDK CLI

## Monorepo Structure

```
kv-storage/
├── packages/
│   ├── shared/              # Common types, utilities, constants
│   ├── infrastructure/      # AWS CDK stacks + Lambda handlers
│   ├── landing/             # Astro landing pages (SEO optimized)
│   ├── dashboard/           # React dashboard SPA
│   └── sdk-js/              # JavaScript/TypeScript client SDK
├── prompts/                 # Development prompts and guides
├── package.json             # Root workspace configuration
├── .env                     # Environment variables
└── README.md                # Project documentation
```

### Package Overview

1. **@kv/shared** - Shared TypeScript types, utilities, and constants used across all packages
2. **@kv/infrastructure** - AWS CDK infrastructure code and Lambda function handlers
3. **@kv/landing** - Astro-based landing page, documentation, and pricing pages
4. **@kv/dashboard** - React-based user dashboard for managing namespaces and API keys
5. **@kv-storage/client** - Official JavaScript/TypeScript SDK for consuming the API

## Subscription Plans

- **Free:** 10K requests/month, 100MB storage
- **Starter:** 100K requests/month, 1GB storage ($5/mo)
- **Pro:** 1M requests/month, 10GB storage ($15/mo)
- **Scale:** 10M requests/month, 100GB storage ($49/mo)
- **Business:** Custom limits ($149/mo)

## Authentication Model

- **Dashboard Operations:** JWT tokens from Cognito (user signup/login)
- **KV Operations:** x-api-key header (namespace-scoped API keys)
- **Webhook Validation:** Paddle signature verification

---

## Directory Structure

### @kv/shared
**Purpose:** Common TypeScript types, utilities, and constants
**Location:** `/packages/shared/`

**Key Files:**
- `src/types.ts` - All TypeScript interfaces and types
- `src/index.ts` - Public API exports

### Package: @kv/infrastructure
**Purpose:** AWS CDK infrastructure code and Lambda function handlers

```
packages/infrastructure/
├── src/
│   ├── lambdas/               # Lambda function handlers
│   │   ├── shared/            # Shared Lambda utilities
│   │   │   ├── auth.ts        # JWT verification, API key validation
│   │   │   ├── dynamodb.ts    # DynamoDB client and helpers
│   │   │   ├── response.ts    # HTTP response builders
│   │   │   ├── usage.ts       # Monthly quota tracking
│   │   │   ├── rate-limiter.ts # Per-second rate limiting (token bucket)
│   │   │   ├── validation.ts  # Zod input validation schemas
│   │   │   ├── middleware.ts  # Middy middleware
│   │   │   ├── logger.ts      # Structured logging
│   │   │   └── errors.ts      # Custom error classes
│   │   ├── create-namespace.ts
│   │   ├── delete-value.ts
│   │   ├── generate-api-key.ts
│   │   ├── get-api-key.ts
│   │   ├── get-usage.ts
│   │   ├── get-value.ts
│   │   ├── list-keys.ts
│   │   ├── list-namespaces.ts
│   │   ├── login.ts
│   │   ├── paddle-webhook.ts
│   │   ├── put-value.ts
│   │   ├── reset-usage.ts
│   │   ├── send-usage-alert.ts
│   │   └── signup.ts
│   ├── stacks/                # CDK stack definitions
│   │   ├── api-stack.ts       # API Gateway configuration
│   │   ├── auth-stack.ts      # Cognito User Pool
│   │   ├── database-stack.ts  # DynamoDB table + GSI
│   │   ├── frontend-stack.ts  # S3 + CloudFront
│   │   ├── lambda-stack.ts    # Lambda functions
│   │   └── monitoring-stack.ts # CloudWatch alarms
│   ├── types/
│   │   └── dynamodb-types.ts  # DynamoDB-specific types
│   └── app.ts                 # CDK app entry point
├── cdk.json                   # CDK configuration
├── package.json
└── tsconfig.json
```

**Key Files:**
- `/packages/infrastructure/src/app.ts` - CDK app entry point
- `/packages/infrastructure/src/stacks/` - All infrastructure stacks
- `/packages/infrastructure/src/lambdas/` - All Lambda handlers
- `/packages/infrastructure/src/lambdas/shared/` - Shared Lambda utilities
  - `logger.ts` - Structured logging with correlation IDs
  - `errors.ts` - Custom error classes
  - `auth.ts` - Authentication and authorization
  - `response.ts` - HTTP response builders
  - `usage.ts` - Monthly quota tracking
  - `rate-limiter.ts` - Per-second rate limiting (token bucket)
  - `validation.ts` - Input validation with Zod
  - `middleware.ts` - Middy middleware
  - `dynamodb.ts` - DynamoDB client and helpers

### Package: @kv/landing
**Purpose:** Astro-based landing page, documentation, and pricing pages

```
packages/landing/
├── src/
│   ├── components/            # Reusable Astro components
│   │   ├── CodeExample.astro
│   │   ├── Features.astro
│   │   └── Hero.astro
│   ├── layouts/
│   │   └── Layout.astro       # Base layout template
│   ├── pages/                 # File-based routing
│   │   ├── docs/
│   │   │   ├── api-reference.astro
│   │   │   ├── examples.astro
│   │   │   ├── index.astro
│   │   │   └── quickstart.astro
│   │   ├── index.astro        # Landing page
│   │   └── pricing.astro      # Pricing page
│   └── env.d.ts
├── astro.config.mjs           # Astro configuration
├── tailwind.config.cjs        # Tailwind CSS config
└── package.json
```

**Key Files:**
- `/packages/landing/src/pages/index.astro` - Main landing page
- `/packages/landing/src/pages/pricing.astro` - Pricing page
- `/packages/landing/src/pages/docs/` - Documentation pages
- `/packages/landing/src/layouts/Layout.astro` - Base layout

### Package: @kv/dashboard
**Purpose:** React-based user dashboard for managing namespaces and API keys

```
packages/dashboard/
├── src/
│   ├── components/            # React components
│   │   ├── layout/
│   │   │   └── DashboardLayout.tsx
│   │   ├── ui/                # UI primitives (Radix UI + CVA)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── DropdownMenu.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── index.ts
│   │   ├── ApiKeyDisplay.tsx
│   │   ├── ApiTester.tsx
│   │   ├── CodeExamples.tsx
│   │   ├── NamespaceDetails.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── QuickStart.tsx
│   │   ├── StoredItems.tsx
│   │   ├── Toaster.tsx
│   │   ├── UIExamples.tsx
│   │   ├── UpgradePrompt.tsx
│   │   └── UsageStats.tsx
│   ├── constants/
│   │   └── config.ts          # App configuration
│   ├── context/
│   │   └── AuthContext.tsx    # Auth state management
│   ├── hooks/
│   │   ├── useApi.ts          # API interaction hook
│   │   └── useToast.ts        # Toast notification hook
│   ├── lib/                   # Utilities
│   │   ├── utils.ts           # cn() helper for className merging
│   │   └── validation.ts      # Zod schemas
│   ├── pages/                 # Page components
│   │   ├── AuthCallback.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NamespacesPage.tsx
│   │   ├── PricingPage.tsx
│   │   └── SignupPage.tsx
│   ├── services/
│   │   └── api.ts             # API client
│   ├── types/
│   │   └── auth.ts            # Auth types
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind CSS config
└── package.json
```

**Key Files:**
- `/packages/dashboard/src/main.tsx` - Application entry point
- `/packages/dashboard/src/App.tsx` - Root component with routing
- `/packages/dashboard/src/context/AuthContext.tsx` - Authentication state
- `/packages/dashboard/src/services/api.ts` - API client
- `/packages/dashboard/src/pages/` - All page components
- `/packages/dashboard/src/lib/validation.ts` - Zod validation schemas for forms

### @kv-storage/client
**Purpose:** Official JavaScript/TypeScript SDK
**Location:** `/packages/sdk-js/`

**Key Files:**
- `src/index.ts` - Complete SDK implementation (KVClient class)

### Root Configuration

**Key Files:**
- `.env` / `.env.example` - Environment variables
- `package.json` - Workspace configuration and scripts
- `tsconfig.json` - Root TypeScript configuration
- `artillery.yml` - Load testing configuration
- `README.md`, `DEPLOYMENT.md`, `LAUNCH-CHECKLIST.md` - Documentation
- `UI-UX-IMPROVEMENTS.md` - Complete UI/UX roadmap (16 steps)
- `UI-UX-IMPLEMENTATION-LOG.md` - Detailed change log
- `UI-UX-QUICK-REFERENCE.md` - Quick summary

---

## Backend & API

### API Endpoints

**Authentication Endpoints (JWT Required):**
- `POST /v1/auth/signup` → `/packages/infrastructure/src/lambdas/signup.ts`
- `POST /v1/auth/login` → `/packages/infrastructure/src/lambdas/login.ts`

**Namespace Management (JWT Required):**
- `POST /v1/namespaces` → `/packages/infrastructure/src/lambdas/create-namespace.ts`
- `GET /v1/namespaces` → `/packages/infrastructure/src/lambdas/list-namespaces.ts`

**API Key Management (JWT Required):**
- `POST /v1/api-keys` → `/packages/infrastructure/src/lambdas/generate-api-key.ts`
- `GET /v1/api-keys` → `/packages/infrastructure/src/lambdas/get-api-key.ts`

**Usage & Billing (JWT Required):**
- `GET /v1/usage` → `/packages/infrastructure/src/lambdas/get-usage.ts`

**KV Operations (x-api-key Required):**
- `GET /v1/{namespace}/{key}` → `/packages/infrastructure/src/lambdas/get-value.ts`
- `PUT /v1/{namespace}/{key}` → `/packages/infrastructure/src/lambdas/put-value.ts`
- `DELETE /v1/{namespace}/{key}` → `/packages/infrastructure/src/lambdas/delete-value.ts`
- `GET /v1/{namespace}` → `/packages/infrastructure/src/lambdas/list-keys.ts` (optional ?prefix= query param)

**Webhooks (No Auth):**
- `POST /v1/webhooks/paddle` → `/packages/infrastructure/src/lambdas/paddle-webhook.ts`

### Lambda Function Handlers

**Location:** `/packages/infrastructure/src/lambdas/`

**Auth Operations:**
- `signup.ts` - User registration with Cognito
- `login.ts` - User authentication with Cognito

**Namespace Operations:**
- `create-namespace.ts` - Create new namespace for user
- `list-namespaces.ts` - List all namespaces for user

**API Key Operations:**
- `generate-api-key.ts` - Generate new API key for namespace
- `get-api-key.ts` - Retrieve API keys for user

**KV Operations:**
- `get-value.ts` - Retrieve value by key
- `put-value.ts` - Store/update value
- `delete-value.ts` - Delete key-value pair
- `list-keys.ts` - List keys with optional prefix filter

**Usage & Billing:**
- `get-usage.ts` - Get usage statistics for user
- `reset-usage.ts` - Reset monthly usage counters (scheduled)
- `send-usage-alert.ts` - Send usage threshold alerts (scheduled)

**Payment Integration:**
- `paddle-webhook.ts` - Handle Paddle subscription events

### Shared Lambda Utilities

**Location:** `/packages/infrastructure/src/lambdas/shared/`

**middleware.ts** - Middy Middleware Pattern
- `loggingMiddleware()` - Automatic request/response logging with correlation IDs
- `apiKeyAuthMiddleware()` - API key validation and user context injection with rate limit headers
- `errorHandlerMiddleware()` - Centralized error handling and response formatting with rate limit headers
- `createHandler(handler)` - Wrap handler with standard middleware (logging, error handling)
- `createApiKeyHandler(handler)` - Wrap handler with auth + standard middleware
- Reduces code duplication across Lambda functions
- Automatic JSON body parsing with @middy/http-json-body-parser
- Rate limit headers automatically added to all responses

**logger.ts** - Structured Logging with Correlation IDs
- `logger` - AWS Lambda Powertools Logger instance with service name and environment
- `generateCorrelationId()` - Generate unique UUID for request tracking
- `addCorrelationId(event)` - Extract or generate correlation ID from request headers
- `logRequest(operation, metadata)` - Log incoming request with operation and metadata
- `logResponse(operation, statusCode, metadata)` - Log outgoing response with status
- Correlation IDs automatically added to all log entries and response headers
- Structured JSON logs for CloudWatch Logs Insights queries

**errors.ts** - Custom Error Classes
- `AppError` - Base error class with statusCode, code, and metadata
- `ValidationError` - 400 errors for invalid input
- `UnauthorizedError` - 401 errors for authentication failures
- `ForbiddenError` - 403 errors for authorization failures
- `NotFoundError` - 404 errors for missing resources
- `RateLimitError` - 429 errors for rate limit exceeded
- `InternalError` - 500 errors for unexpected failures
- All errors include optional metadata for debugging

**auth.ts** - Authentication & Authorization
- `validateToken(token: string)` - Verify JWT from Cognito with structured logging
- `validateApiKey(apiKey: string)` - Verify x-api-key header, check per-second rate limits, fetch user profile
- Returns `AuthenticatedUser` with userId, plan, apiKey, and rateLimitHeaders
- Throws custom error classes (UnauthorizedError, RateLimitError) instead of generic Error
- All authentication attempts logged with userId and outcome
- Per-second rate limiting enforced before monthly quota check
- Rate limit headers included in response for client-side throttling

**dynamodb.ts** - Database Client & Helpers
- `docClient` - DynamoDB DocumentClient instance (initialized outside handler for connection reuse)
- `TABLE_NAME` - Main table name constant
- `GSI_NAME` - GSI name constant
- Connection pooling enabled with marshallOptions
- Client reused across Lambda invocations for better performance

**response.ts** - HTTP Response Builders
- `successResponse(data, statusCode, correlationId, rateLimitHeaders)` - Success response with correlation ID and rate limit headers
- `errorResponse(error, statusCode, correlationId)` - Error response with structured error details
- Supports both string messages and AppError instances
- Automatically logs errors with context
- Includes correlation ID in response headers for request tracing
- Includes rate limit headers (X-RateLimit-*) in all responses
- Handles CORS headers automatically
- Rate limit responses include Retry-After header

**usage.ts** - Usage Tracking & Rate Limiting
- `checkRateLimit(userId: string, plan: string)` - Check if user within monthly quota limits
- `incrementRequestCount(userId: string)` - Increment request counter
- `getUsageStats(userId: string)` - Get current usage metrics
- Plan limits enforcement for monthly quotas

**rate-limiter.ts** - Per-Second Rate Limiting
- `checkRateLimitPerSecond(userId: string, plan: string)` - Token bucket rate limiting per second
- Returns rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- Plan-based limits: Free (10/s), Starter (50/s), Pro (100/s), Scale (500/s), Business (1000/s)
- Burst allowance: 2x base rate for paid plans
- In-memory rate limiting using rate-limiter-flexible library
- Sliding window algorithm for accurate rate limiting

**validation.ts** - Input Validation with Zod
- `namespaceSchema` - Validates namespace names (lowercase alphanumeric + hyphens, max 50 chars)
- `keySchema` - Validates key names (alphanumeric + :_.- chars, max 255 chars)
- `valueSchema` - Validates JSON payload size (max 400KB)
- `createNamespaceSchema` - Request schema for namespace creation
- `putValueSchema` - Request schema for storing values
- `validate<T>(schema, data)` - Helper function for validation with error messages

### Authentication Flow

**JWT Authentication (Dashboard):**
1. User signs up/logs in via Cognito
2. Cognito returns JWT access token
3. Frontend stores token in localStorage
4. Token sent in `Authorization: Bearer <token>` header
5. API Gateway JWT authorizer validates token
6. Lambda receives verified user claims

**API Key Authentication (KV Operations):**
1. User generates API key in dashboard
2. API key hashed (SHA-256) and stored in DynamoDB
3. Client sends key in `x-api-key` header
4. Lambda reads from `event.headers['x-api-key']`
5. Lambda validates key via GSI lookup and fetches user profile
6. Per-second rate limiting checked (token bucket algorithm)
7. Monthly quota checked
8. Request count incremented
9. Rate limit headers added to response

**File Locations:**
- JWT validation: `/packages/infrastructure/src/lambdas/shared/auth.ts` (validateToken)
- API key validation: `/packages/infrastructure/src/lambdas/shared/auth.ts` (validateApiKey)
- Per-second rate limiting: `/packages/infrastructure/src/lambdas/shared/rate-limiter.ts`
- Monthly quota tracking: `/packages/infrastructure/src/lambdas/shared/usage.ts`
- Cognito config: `/packages/infrastructure/src/stacks/auth-stack.ts`
- API Gateway authorizer: `/packages/infrastructure/src/stacks/api-stack.ts`

### Rate Limiting

**Two-Tier Rate Limiting:**

1. **Per-Second Rate Limiting (Token Bucket):**
   - Implemented using rate-limiter-flexible library
   - In-memory sliding window algorithm
   - Plan-based limits:
     - Free: 10 requests/second (burst: 20)
     - Starter: 50 requests/second (burst: 100)
     - Pro: 100 requests/second (burst: 200)
     - Scale: 500 requests/second (burst: 1000)
     - Business: 1000 requests/second (burst: 2000)
   - Returns 429 with Retry-After header when exceeded
   - Location: `/packages/infrastructure/src/lambdas/shared/rate-limiter.ts`

2. **Monthly Quota Limiting:**
   - DynamoDB-based usage tracking
   - Plan-based monthly limits:
     - Trial: 10K requests/month
     - Starter: 500K requests/month
     - Pro: 1M requests/month
     - Scale: 5M requests/month
     - Business: 20M requests/month
   - Usage alerts at 80% threshold
   - Location: `/packages/infrastructure/src/lambdas/shared/usage.ts`

**Rate Limit Headers:**
- `X-RateLimit-Limit` - Maximum requests per second for plan
- `X-RateLimit-Remaining` - Remaining requests in current window
- `X-RateLimit-Reset` - Unix timestamp when limit resets
- `Retry-After` - Seconds to wait before retrying (on 429 errors)

**Implementation Flow:**
1. API key validated in middleware
2. Per-second rate limit checked first (fast fail)
3. Monthly quota checked second
4. Rate limit headers added to context
5. Headers included in all responses (success and error)
6. Client can use headers for client-side throttling

### Error Handling

**Custom Error Classes:**
- All Lambda functions use custom error classes from `/packages/infrastructure/src/lambdas/shared/errors.ts`
- Errors include statusCode, error code, message, and optional metadata
- Consistent error responses across all endpoints

**Standard Error Responses:**
```typescript
{
  statusCode: 400 | 401 | 403 | 404 | 429 | 500,
  body: JSON.stringify({ 
    error: "Error message",
    statusCode: number,
    code: "ERROR_CODE",
    correlationId: "uuid"
  })
}
```

**Error Types:**
- `400` Bad Request (ValidationError) - Invalid input, missing required fields
- `401` Unauthorized (UnauthorizedError) - Invalid/expired token or API key
- `403` Forbidden (ForbiddenError) - Insufficient permissions
- `404` Not Found (NotFoundError) - Resource doesn't exist
- `429` Rate Limit Exceeded (RateLimitError) - Usage quota exceeded
- `500` Internal Server Error (InternalError) - Unexpected failures

**Error Handling Pattern:**
```typescript
try {
  // Operation logic
} catch (error) {
  if (error instanceof AppError) {
    return errorResponse(error, error.statusCode, correlationId);
  }
  logger.error('Unexpected error', { error });
  return errorResponse('Internal server error', 500, correlationId);
}
```

**File Location:** `/packages/infrastructure/src/lambdas/shared/errors.ts`, `/packages/infrastructure/src/lambdas/shared/response.ts`

### Logging & Monitoring

**Structured Logging:**
- AWS Lambda Powertools Logger for structured JSON logs
- Service name: `kv-storage`
- Log level: INFO (configurable via LOG_LEVEL env var)
- All logs include: timestamp, level, message, correlationId, environment

**Correlation IDs:**
- Unique UUID generated for each request
- Extracted from `x-correlation-id` header if provided
- Added to all log entries via logger context
- Returned in response headers for client-side tracing
- Enables end-to-end request tracking across services

**Request/Response Logging:**
- All Lambda handlers log incoming requests with operation, userId, namespace, key
- All responses logged with statusCode and relevant metadata
- Errors logged with full context and stack traces
- Authentication attempts logged with outcome

**Log Queries:**
CloudWatch Logs Insights queries enabled by structured logging:
```
fields @timestamp, correlationId, operation, userId, statusCode
| filter operation = "GET_VALUE"
| sort @timestamp desc
```

**File Locations:**
- Logger setup: `/packages/infrastructure/src/lambdas/shared/logger.ts`
- Error classes: `/packages/infrastructure/src/lambdas/shared/errors.ts`
- Response builders: `/packages/infrastructure/src/lambdas/shared/response.ts`
- Lambda handlers: `/packages/infrastructure/src/lambdas/*.ts`


### Middleware & Utilities

**Authentication Middleware:**
- Implemented in each Lambda handler
- Extracts and validates JWT or API key
- Returns 401 if authentication fails

**Rate Limiting:**
- Checked before KV operations
- Based on user's subscription plan
- Returns 429 when limit exceeded
- Location: `/packages/infrastructure/src/lambdas/shared/usage.ts`

**CORS Handling:**
- Configured in API Gateway
- Allows origins: landing + dashboard domains
- Allows headers: Content-Type, Authorization, x-api-key
- Location: `/packages/infrastructure/src/stacks/api-stack.ts`

---

## Database Schema

### DynamoDB Single Table Design

**Table Name:** `kv-storage-data`  
**Billing Mode:** Pay-per-request  
**Location:** `/packages/infrastructure/src/stacks/database-stack.ts`

**Primary Keys:**
- `PK` (Partition Key) - STRING
- `SK` (Sort Key) - STRING

**Global Secondary Index (GSI1):**
- `GSI1PK` (Partition Key) - STRING
- `GSI1SK` (Sort Key) - STRING
- Projection: ALL attributes


### Entity Types & Key Patterns

**User Profile:**
```
PK: USER#<userId>
SK: PROFILE
entityType: USER
userId: string
email: string
plan: 'free' | 'starter' | 'pro' | 'scale' | 'business'
createdAt: ISO timestamp
updatedAt: ISO timestamp
```

**API Key:**
```
PK: USER#<userId>
SK: APIKEY#<apiKeyId>
GSI1PK: APIKEY#<hashedKey>
GSI1SK: METADATA
entityType: APIKEY
userId: string
apiKeyId: string
hashedKey: string (SHA-256)
namespaceId: string
plan: string
email: string
createdAt: ISO timestamp
```

**Namespace:**
```
PK: USER#<userId>
SK: NAMESPACE#<namespaceId>
GSI1PK: NAMESPACE#<namespaceId>
GSI1SK: METADATA
entityType: NAMESPACE
userId: string
namespaceId: string
name: string
createdAt: ISO timestamp
```

**Key-Value Data:**
```
PK: NAMESPACE#<namespaceId>
SK: KEY#<key>
entityType: KEY
namespaceId: string
key: string
value: any (JSON)
createdAt: ISO timestamp
updatedAt: ISO timestamp
```

**Usage Metrics:**
```
PK: USER#<userId>
SK: USAGE#<month>
entityType: USAGE
userId: string
month: string (YYYY-MM)
requestCount: number
storageBytes: number
lastUpdated: ISO timestamp
```


### Access Patterns

1. **Get user profile**
   - Query: `PK = USER#<userId> AND SK = PROFILE`
   - Used by: JWT validation, user info display

2. **Get all namespaces for user**
   - Query: `PK = USER#<userId> AND SK BEGINS_WITH NAMESPACE#`
   - Used by: List namespaces endpoint

3. **Get API keys for user**
   - Query: `PK = USER#<userId> AND SK BEGINS_WITH APIKEY#`
   - Used by: List API keys endpoint

4. **Validate API key**
   - Query GSI1: `GSI1PK = APIKEY#<hashedKey> AND GSI1SK = METADATA`
   - Used by: API key authentication

5. **Get namespace metadata**
   - Query GSI1: `GSI1PK = NAMESPACE#<namespaceId> AND GSI1SK = METADATA`
   - Used by: Namespace validation

6. **Get key-value pair**
   - Query: `PK = NAMESPACE#<namespaceId> AND SK = KEY#<key>`
   - Used by: GET value endpoint

7. **List keys in namespace**
   - Query: `PK = NAMESPACE#<namespaceId> AND SK BEGINS_WITH KEY#`
   - Used by: List keys endpoint

8. **Get usage metrics**
   - Query: `PK = USER#<userId> AND SK = USAGE#<month>`
   - Used by: Usage tracking, rate limiting


### Key File Locations

**DynamoDB Client Setup:**
- `/packages/infrastructure/src/lambdas/shared/dynamodb.ts` - Client initialization, table constants

**Database Operations:**
- User operations: `/packages/infrastructure/src/lambdas/signup.ts`, `login.ts`
- Namespace operations: `/packages/infrastructure/src/lambdas/create-namespace.ts`, `list-namespaces.ts`
- API key operations: `/packages/infrastructure/src/lambdas/generate-api-key.ts`, `get-api-key.ts`
- KV operations: `/packages/infrastructure/src/lambdas/get-value.ts`, `put-value.ts`, `delete-value.ts`, `list-keys.ts`
- Usage operations: `/packages/infrastructure/src/lambdas/get-usage.ts`, `reset-usage.ts`

**Type Definitions:**
- `/packages/infrastructure/src/types/dynamodb-types.ts` - DynamoDB-specific types
- `/packages/shared/src/types.ts` - Shared entity types

---

## Frontend Applications

### Landing Page (Astro)

**Purpose:** SEO-optimized marketing site  
**Location:** `/packages/landing/`  
**Build Output:** Static HTML/CSS/JS  
**Deployment:** S3 + CloudFront

**Configuration:**
- `/packages/landing/astro.config.mjs` - Astro config with Tailwind integration
- `/packages/landing/tailwind.config.cjs` - Tailwind CSS configuration


**Pages (File-based Routing):**
- `/packages/landing/src/pages/index.astro` - Homepage with hero, features, CTA
- `/packages/landing/src/pages/pricing.astro` - Pricing tiers and comparison
- `/packages/landing/src/pages/docs/index.astro` - Documentation home
- `/packages/landing/src/pages/docs/quickstart.astro` - Getting started guide
- `/packages/landing/src/pages/docs/api-reference.astro` - API documentation
- `/packages/landing/src/pages/docs/examples.astro` - Code examples

**Components:**
- `/packages/landing/src/components/Hero.astro` - Hero section with headline
- `/packages/landing/src/components/Features.astro` - Feature grid
- `/packages/landing/src/components/CodeExample.astro` - Syntax-highlighted code blocks

**Layout:**
- `/packages/landing/src/layouts/Layout.astro` - Base layout with header, footer, meta tags


### NamespacesPage - Enhanced Collapsed State

**Location:** `/packages/dashboard/src/pages/NamespacesPage.tsx`

**Collapsed Namespace Card Features:**

1. **Key Count Badge:**
   - Displays total number of keys in namespace
   - Blue badge with key icon
   - Updates automatically when namespaces are loaded
   - Shows "X key" (singular) or "X keys" (plural)

2. **Activity Status Indicator:**
   - Green "Active" badge for namespaces with keys (keyCount > 0)
   - Gray "Empty" badge for namespaces without keys
   - Visual differentiation helps identify used vs unused namespaces

3. **Last Activity Timestamp:**
   - Shows "Created today" for namespaces created within 24 hours
   - Shows "Created X day(s) ago" for older namespaces
   - Calculated from createdAt timestamp
   - Provides quick context on namespace age

4. **Visual Hierarchy:**
   - Namespace name in bold
   - Status and key count badges inline
   - Creation time below with clock icon
   - Hover effect with left border highlight

**Implementation Details:**
- Key counts fetched via useEffect when apiKey and namespaces are available
- Parallel API calls to list keys for each namespace
- Cached in keyCounts state object
- Graceful fallback to 0 if fetch fails
- No loading spinner to avoid UI flicker

### ApiTester - Enhanced UX

**Location:** `/packages/dashboard/src/components/ApiTester.tsx`

**Enhanced Features:**

1. **Response Viewer with Syntax Highlighting:**
   - Success responses shown in green-tinted terminal style
   - JSON formatted with 2-space indentation
   - Monospace font for readability
   - Checkmark icon for successful responses
   - Max height with scroll for large responses

2. **Inline Error Messages:**
   - Replaced browser alerts with styled error boxes
   - Red-tinted background with border
   - Warning icon for visual emphasis
   - Separate error state from response state
   - Shows HTTP status codes and error messages
   - JSON validation errors displayed inline

3. **Loading States:**
   - Button text changes during requests ("Sending...", "Fetching...", "Deleting...")
   - Buttons disabled during loading to prevent duplicate requests
   - Visual feedback for all operations

4. **Error Handling:**
   - HTTP errors: Shows status code, status text, and error message
   - Network errors: Shows connection error message
   - JSON validation: Shows "Invalid JSON format" for PUT operations
   - Errors cleared on new request

**Implementation Details:**
- Separate `error` and `response` state variables
- Error state cleared before each request
- HTTP status checked with `res.ok` before parsing
- Try-catch for network and parsing errors
- Conditional rendering for error vs success states

### NamespaceDetails - Custom Dialogs

**Location:** `/packages/dashboard/src/components/NamespaceDetails.tsx`

**Custom Dialog Features:**

1. **Value Viewer Dialog:**
   - Replaces browser alert for viewing key values
   - Blue-tinted box with close button
   - Syntax-highlighted JSON display
   - Monospace font with proper formatting
   - Dismissible with X button

2. **Delete Confirmation Dialog:**
   - Replaces browser confirm dialog
   - Yellow-tinted warning box
   - Shows key name in code block
   - Delete and Cancel buttons
   - Warning icon for visual emphasis

3. **Error Messages:**
   - Red-tinted error box for all errors
   - Dismissible with X button
   - Shows fetch and delete errors inline
   - Cleared automatically on new actions

**Implementation Details:**
- `viewData` state for value viewer
- `deleteConfirm` state for delete confirmation
- `error` state for error messages
- All dialogs rendered inline above content
- No browser dialogs used anywhere in the app

### DashboardLayout - Enhanced Navigation

**Location:** `/packages/dashboard/src/components/layout/DashboardLayout.tsx`

**Navigation Features:**

1. **Active State Highlighting:**
   - Active page has blue background (bg-blue-600)
   - White text for active links
   - Shadow effect for depth (shadow-md)
   - Inactive links have gray text with hover state
   - Uses React Router's useLocation to detect active page

2. **Icons with Text Labels:**
   - Dashboard: Home icon
   - Namespaces: Folder icon
   - Pricing: Dollar sign icon
   - All icons 5x5 size, aligned with text
   - Icons inherit text color for consistency

3. **Visual Grouping:**
   - Navigation items in flex-1 section
   - Logout button separated in border-top footer section
   - Consistent spacing with py-3 px-4 for nav items
   - 1px margin between items (mb-1)

4. **Improved Logout Button:**
   - Full-width button with gray background
   - Logout icon (arrow-right-from-bracket)
   - Centered content with gap-2 spacing
   - Hover state with darker gray (hover:bg-gray-200)
   - Font-medium for emphasis
   - Smooth transition on hover

5. **Responsive Design:**
   - Mobile: Hamburger menu with slide-in sidebar
   - Desktop: Fixed sidebar (w-64)
   - Overlay backdrop on mobile when menu open
   - Auto-close menu on navigation click
   - Smooth transform transitions (300ms)

6. **Mobile Navigation Enhancements:**
   - Auto-close menu after navigation (handleNavClick)
   - Smooth slide animation on sidebar (transition-transform duration-300)
   - Overlay fade-in animation for smooth appearance
   - Cursor pointer on overlay for clear clickability
   - Overlay click closes menu instantly
   - Hamburger icon in mobile header

**Implementation Details:**
- `isActive` helper function compares location.pathname
- `navItems` array with path, label, and icon objects
- Conditional className based on active state
- Mobile menu state managed with `menuOpen` boolean
- Logo with database icon in header section
- `handleNavClick` closes menu on any navigation link click
- Overlay uses existing `animate-fade-in` CSS animation

### ApiKeyDisplay - Enhanced Copy Feedback

**Location:** `/packages/dashboard/src/components/ApiKeyDisplay.tsx`

**Enhanced Copy Feedback Features:**

1. **Toast Notification:**
   - Green toast appears at bottom-right corner
   - Shows "API key copied to clipboard!" message
   - Checkmark icon for visual confirmation
   - Auto-dismisses after 2 seconds
   - Slide-up animation on appearance

2. **Checkmark Icon Animation:**
   - Checkmark appears inside input field on copy
   - Scale-in animation (0.2s ease-out)
   - Positioned at right side of input
   - Green color matching success state

3. **Background Flash Effect:**
   - Input border changes to green on copy
   - Background changes to light green (bg-green-50)
   - Subtle shadow added for depth
   - Smooth transition (300ms duration)
   - Returns to normal state after 2 seconds

4. **Button State Changes:**
   - Button changes to green background on copy
   - Button text changes from "Copy" to "Copied!"
   - Button icon changes to checkmark
   - Slight scale-up effect (scale-105)
   - All transitions smooth (300ms duration)

**Implementation Details:**
- Separate `showToast` state for toast visibility
- Toast component auto-dismisses via useEffect timer
- CSS animations defined in `/packages/dashboard/src/index.css`
- Three animations: `slide-up`, `scale-in`, and existing `fade-in`
- Toast positioned fixed at bottom-right with z-50
- All visual feedback synchronized with 2-second timeout

### Dashboard (React)

**Purpose:** User management interface  
**Location:** `/packages/dashboard/`  
**Framework:** React 18 + Vite  
**Routing:** React Router v6  
**Deployment:** S3 + CloudFront

**Configuration:**
- `/packages/dashboard/vite.config.ts` - Vite build configuration
- `/packages/dashboard/tailwind.config.js` - Tailwind CSS configuration
- `/packages/dashboard/index.html` - HTML entry point

**Error Boundaries:**
- **Library:** react-error-boundary v4.0.11
- **Implementation:** Wraps entire application in App.tsx
- **Fallback UI:** `/packages/dashboard/src/components/ErrorFallback.tsx`
  - User-friendly error message with icon
  - Collapsible error details for debugging
  - "Try Again" button to reset error boundary
  - "Go to Dashboard" button for navigation recovery
- **Error Logging:** `/packages/dashboard/src/services/errorLogger.ts`
  - Logs errors to backend API endpoint (`POST /v1/errors`)
  - Captures error message, stack trace, component stack
  - Includes context: URL, user agent, timestamp
  - Silent failure if logging fails (console.error fallback)
- **Reset Behavior:** Redirects to dashboard on reset
- **Coverage:** Catches all React component errors globally

**State Management:**
- **Global State:** Zustand v4.4.7 for UI state (sidebar, preferences)
- **Server State:** React Query v5 for API data with optimistic updates
- **Auth State:** React Context for authentication
- **Features:**
  - Optimistic UI updates for namespace creation
  - Request deduplication and caching (5-10 min stale times)
  - Offline-first network mode
  - Automatic cache invalidation
  - Persistent UI state with localStorage
- **Store Location:** `/packages/dashboard/src/store/useStore.ts`
- **Query Hooks:** `/packages/dashboard/src/hooks/useApi.ts`

**First-Time User Onboarding:****
- Detects users with no namespaces on dashboard load
- Shows modal overlay with 3-step guide
- Highlights "Create Namespace" as primary action
- Dismissible with localStorage persistence (key: `kv_onboarding_completed`)
- Automatically navigates to Namespaces page on CTA click

**API Testing:**
- Interactive API tester component in namespace details
- Supports GET, PUT, DELETE, and LIST operations
- Syntax-highlighted response viewer
- Inline error messages with visual feedback
- Loading states on all buttons


**Routing Structure:**
- `/` - Redirects to `/dashboard`
- `/login` - Login page (public)
- `/signup` - Signup page (public)
- `/auth-callback` - OAuth callback handler (public)
- `/dashboard` - Main dashboard (protected)
- `/namespaces` - Namespace management (protected)
- `/pricing` - Pricing and upgrade (protected)

**Route Configuration:** `/packages/dashboard/src/App.tsx`


**Page Components:**
- `/packages/dashboard/src/pages/LoginPage.tsx` - Email/password login form
- `/packages/dashboard/src/pages/SignupPage.tsx` - User registration form
- `/packages/dashboard/src/pages/AuthCallback.tsx` - OAuth redirect handler
- `/packages/dashboard/src/pages/DashboardPage.tsx` - Main dashboard with usage stats and first-time user onboarding
- `/packages/dashboard/src/pages/NamespacesPage.tsx` - Namespace list with key metrics, activity indicators, and management
- `/packages/dashboard/src/pages/PricingPage.tsx` - Plan comparison and upgrade


**Key Components:**
- `/packages/dashboard/src/components/layout/DashboardLayout.tsx` - Layout wrapper with nav (enhanced with icons and active states)
- `/packages/dashboard/src/components/ProtectedRoute.tsx` - Auth guard for routes
- `/packages/dashboard/src/components/ErrorFallback.tsx` - Error boundary fallback UI with retry functionality
- `/packages/dashboard/src/components/UsageStats.tsx` - Usage metrics display (color-coded status system)
- `/packages/dashboard/src/components/ApiKeyDisplay.tsx` - API key management UI (enhanced copy feedback with toast, checkmark animation, and background flash)
- `/packages/dashboard/src/components/NamespaceDetails.tsx` - Namespace info and actions (custom dialogs for view/delete)
- `/packages/dashboard/src/components/StoredItems.tsx` - Key-value list viewer
- `/packages/dashboard/src/components/ApiTester.tsx` - Interactive API testing tool (enhanced with syntax highlighting and inline errors)
- `/packages/dashboard/src/components/CodeExamples.tsx` - SDK usage examples
- `/packages/dashboard/src/components/QuickStart.tsx` - Onboarding guide
- `/packages/dashboard/src/components/UpgradePrompt.tsx` - Plan upgrade CTA
- `/packages/dashboard/src/components/Toaster.tsx` - Toast notification renderer
- `/packages/dashboard/src/components/UIExamples.tsx` - UI component library examples

**UI Component Library:**
- `/packages/dashboard/src/components/ui/Button.tsx` - Button with variants (default, destructive, outline, ghost, link)
- `/packages/dashboard/src/components/ui/Card.tsx` - Card layout components
- `/packages/dashboard/src/components/ui/Dialog.tsx` - Accessible modal dialogs (Radix UI)
- `/packages/dashboard/src/components/ui/DropdownMenu.tsx` - Accessible dropdown menus (Radix UI)
- `/packages/dashboard/src/components/ui/Skeleton.tsx` - Loading skeleton animations
- `/packages/dashboard/src/components/ui/Toast.tsx` - Toast notification primitives (Radix UI)
- `/packages/dashboard/src/components/ui/Tooltip.tsx` - Accessible tooltips (Radix UI)
- `/packages/dashboard/src/lib/utils.ts` - cn() helper for className merging with tailwind-merge

**Recent UI/UX Improvements (Phase 1):**
- Color-coded usage status (blue/yellow/red based on thresholds)
- Enhanced copy feedback with toast notifications, checkmark animations, and background flash effects
- Navigation with icons and active state highlighting
- Improved namespace cards with status badges and key metrics
- Enhanced collapsed namespace state with key count badges and activity indicators
- Better form validation and loading states
- Rich empty states with helpful guidance
- Skeleton loading animations throughout
- Progressive onboarding for first-time users with step-by-step guide
- React Hook Form + Zod validation for namespace creation with real-time feedback
- Success toast notifications for form submissions
- Enhanced API Tester with syntax highlighting and inline error messages
- Custom dialogs replacing all browser alerts and confirms
- Accessible UI component library with Radix UI primitives
- React error boundaries with fallback UI and error logging

### UI Component Library

**Purpose:** Reusable, accessible component library built on Radix UI primitives
**Location:** `/packages/dashboard/src/components/ui/`

**Design System:**
- **Accessibility:** WCAG 2.1 compliant components using Radix UI
- **Variants:** Component variants managed with class-variance-authority (CVA)
- **Styling:** Tailwind CSS with consistent design tokens
- **Animations:** Smooth transitions and loading states

**Core Components:**

1. **Button** (`Button.tsx`)
   - Variants: default, destructive, outline, ghost, link
   - Sizes: sm, default, lg, icon
   - Full keyboard navigation and focus states
   - Usage: `<Button variant="outline" size="sm">Click me</Button>`

2. **Card** (`Card.tsx`)
   - Components: Card, CardHeader, CardTitle, CardDescription, CardContent
   - Consistent layout structure for content sections
   - Usage: `<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader></Card>`

3. **Dialog** (`Dialog.tsx`)
   - Accessible modal dialogs with overlay
   - Keyboard navigation (Esc to close)
   - Focus trap and scroll lock
   - Usage: `<Dialog><DialogTrigger><Button>Open</Button></DialogTrigger><DialogContent>...</DialogContent></Dialog>`

4. **DropdownMenu** (`DropdownMenu.tsx`)
   - Accessible dropdown menus
   - Keyboard navigation (Arrow keys, Enter, Esc)
   - Auto-positioning and collision detection
   - Usage: `<DropdownMenu><DropdownMenuTrigger>Menu</DropdownMenuTrigger><DropdownMenuContent>...</DropdownMenuContent></DropdownMenu>`

5. **Toast** (`Toast.tsx`)
   - Non-blocking notifications
   - Variants: default, success, destructive
   - Auto-dismiss with configurable duration
   - Swipe to dismiss on mobile
   - Usage: `toast({ title: 'Success', description: 'Action completed', variant: 'success' })`

6. **Tooltip** (`Tooltip.tsx`)
   - Accessible tooltips with keyboard support
   - Auto-positioning
   - Configurable delay
   - Usage: `<Tooltip><TooltipTrigger>Hover</TooltipTrigger><TooltipContent>Info</TooltipContent></Tooltip>`

7. **Skeleton** (`Skeleton.tsx`)
   - Loading state placeholders
   - Pulse animation
   - Usage: `<Skeleton className="h-4 w-full" />`

**Utilities:**
- `cn()` - Merges Tailwind classes with conflict resolution (clsx + tailwind-merge)
- `useToast()` - Hook for managing toast notifications

**Implementation Details:**
- All components use React.forwardRef for ref forwarding
- TypeScript types exported for all components
- Radix UI primitives provide accessibility features
- CVA manages component variants with type safety
- Tailwind CSS for styling with consistent design tokens
- Global TooltipProvider and Toaster in App.tsx

**Usage Example:**
```typescript
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const { toast } = useToast();
  
  return (
    <Button 
      variant="default" 
      onClick={() => toast({ title: 'Success!' })}
    >
      Click me
    </Button>
  );
}
```

**Mobile Responsiveness:**
- All components responsive by default
- Touch-friendly tap targets (min 44x44px)
- Swipe gestures for dismissible components
- Adaptive layouts for small screens


**State Management:**
- `/packages/dashboard/src/context/AuthContext.tsx` - Global auth state (user, token, login/logout)
- `/packages/dashboard/src/store/useStore.ts` - Zustand store for UI state (sidebar, preferences)
- Uses React Context API for auth state
- Uses Zustand for global UI state with localStorage persistence
- Uses React Query for server state with optimistic updates and caching
- LocalStorage for token persistence

**Custom Hooks:**
- `/packages/dashboard/src/hooks/useApi.ts` - API calls with auth headers
- `/packages/dashboard/src/hooks/useToast.ts` - Toast notification management

**Validation:**
- `/packages/dashboard/src/lib/validation.ts` - Zod schemas for form validation
  - `namespaceSchema` - Validates namespace names (lowercase alphanumeric + hyphens, starts with letter, 1-50 chars)
  - Type-safe form data with TypeScript inference

**Utilities:**
- `/packages/dashboard/src/lib/utils.ts` - Utility functions
  - `cn()` - Merges Tailwind classes with clsx and tailwind-merge for conflict resolution

**Services:**
- `/packages/dashboard/src/services/api.ts` - HTTP client for backend API
- `/packages/dashboard/src/services/errorLogger.ts` - Error logging service for monitoring

**Constants:**
- `/packages/dashboard/src/constants/config.ts` - API URLs, Paddle config

---

## Infrastructure & CDK

### CDK Application

**Entry Point:** `/packages/infrastructure/src/app.ts`  
**CDK Version:** AWS CDK v2  
**Language:** TypeScript

**Stack Deployment Order:**
1. AuthStack - Cognito User Pool
2. DatabaseStack - DynamoDB table
3. LambdaStack - Lambda functions (depends on Database)
4. ApiStack - API Gateway (depends on Lambda)
5. LandingStack - Landing page S3/CloudFront (depends on API)
6. DashboardStack - Dashboard S3/CloudFront (depends on API)
7. MonitoringStack - CloudWatch alarms (depends on API)


### AuthStack

**File:** `/packages/infrastructure/src/stacks/auth-stack.ts`  
**Purpose:** User authentication with Amazon Cognito

**Resources:**
- Cognito User Pool with email sign-in
- User Pool Client for web applications
- Google OAuth integration (optional)

**Exports:**
- `userPool` - Cognito User Pool instance
- `userPoolClient` - User Pool Client instance
- User Pool ID and Client ID for Lambda environment variables


### DatabaseStack

**File:** `/packages/infrastructure/src/stacks/database-stack.ts`  
**Purpose:** DynamoDB table for all data storage

**Resources:**
- DynamoDB table with on-demand billing
- Global Secondary Index (GSI1) for API key lookups
- Point-in-time recovery enabled
- AWS-managed encryption

**Configuration:**
- Table name: `kv-storage-data` (configurable via context)
- GSI name: `GSI1` (configurable via context)
- Removal policy: RETAIN (prevents accidental deletion)

**Exports:**
- `table` - DynamoDB Table instance for Lambda permissions


### LambdaStack

**File:** `/packages/infrastructure/src/stacks/lambda-stack.ts`  
**Purpose:** All Lambda function definitions

**Lambda Functions Created:**
- `signup`, `login` - Authentication
- `createNamespace`, `listNamespaces` - Namespace management
- `generateApiKey`, `getApiKey` - API key management
- `getValue`, `putValue`, `deleteValue`, `listKeys` - KV operations
- `getUsage` - Usage statistics
- `paddleWebhook` - Payment webhooks

**Common Configuration:**
- Runtime: Node.js 18.x
- Bundling: esbuild via NodejsFunction
- Environment variables: TABLE_NAME, GSI_NAME, USER_POOL_ID, USER_POOL_CLIENT_ID
- IAM permissions: DynamoDB read/write access

**Exports:**
- All Lambda function instances for API Gateway integration


### ApiStack

**File:** `/packages/infrastructure/src/stacks/api-stack.ts`  
**Purpose:** HTTP API Gateway with routes and authorization

**Resources:**
- HTTP API Gateway with custom domain
- JWT authorizer for Cognito-protected routes
- Route53 A record for custom domain
- ACM certificate for SSL/TLS

**Domain Configuration:**
- API domain: `api.kv.{baseDomain}`
- Certificate validation via DNS
- CloudFront distribution (automatic via API Gateway)

**CORS Configuration:**
- Allowed origins: Landing and dashboard domains
- Allowed methods: ALL
- Allowed headers: Content-Type, Authorization, x-api-key

**Exports:**
- `api` - HTTP API instance
- API endpoint URL
- Custom domain URL


### FrontendStack (Landing & Dashboard)

**File:** `/packages/infrastructure/src/stacks/frontend-stack.ts`  
**Purpose:** Static site hosting with CDN

**LandingStack Resources:**
- S3 bucket for static files
- CloudFront distribution
- Route53 A record for `kv.{baseDomain}`
- ACM certificate for SSL/TLS
- Origin Access Identity for S3 security

**DashboardStack Resources:**
- S3 bucket for React SPA
- CloudFront distribution
- Route53 A record for `dashboard.kv.{baseDomain}`
- ACM certificate for SSL/TLS
- SPA routing support (404 → index.html)

**Note:** Manual upload required after `npm run build:frontend`


### MonitoringStack

**File:** `/packages/infrastructure/src/stacks/monitoring-stack.ts`  
**Purpose:** CloudWatch alarms and alerts

**Alarms:**
- API Gateway 5xx errors
- Lambda function errors
- Lambda function throttles
- High latency alerts

**Notifications:**
- SNS topic for alarm notifications
- Email subscription (configured via ALARM_EMAIL env var)

### Environment Configuration

**File:** `/packages/infrastructure/cdk.json`  
**Purpose:** CDK CLI configuration

**Environment Variables (from .env):**
- `AWS_REGION` - AWS region for deployment
- `CDK_DEFAULT_ACCOUNT` - AWS account ID
- `CDK_DEFAULT_REGION` - Default region
- `DOMAIN_NAME` - Base domain for all services
- `STAGE` - Deployment stage (dev/prod)
- `JWT_SECRET` - JWT signing secret
- `PADDLE_WEBHOOK_SECRET` - Paddle webhook validation
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `ALARM_EMAIL` - Email for CloudWatch alerts

**Context Values:**
- `tableName` - DynamoDB table name
- `gsiName` - GSI name

---

## SDKs

### JavaScript/TypeScript SDK

**Package Name:** `@kv-storage/client`  
**Location:** `/packages/sdk-js/`  
**Main File:** `/packages/sdk-js/src/index.ts`

**Purpose:** Official client library for consuming the KV Storage API

**Installation:**
```bash
npm install @kv-storage/client
```


**Main Class:** `KVClient`

**Initialization:**
```typescript
// Simple initialization
const kv = new KVClient('your-api-key');

// With custom base URL
const kv = new KVClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.kv.yourdomain.com'
});
```

**Constructor Parameters:**
- `apiKey` (string) - API key from dashboard
- `baseUrl` (optional string) - Custom API endpoint (defaults to production)


**API Methods:**

**get(namespace, key)**
- Retrieves a value by key
- Returns: `Promise<KVResponse<T>>`
- Throws: Error on HTTP failure

**put(namespace, key, value)**
- Stores or updates a value
- Returns: `Promise<{ message: string }>`
- Throws: Error on HTTP failure

**delete(namespace, key)**
- Deletes a key-value pair
- Returns: `Promise<void>`
- Throws: Error on HTTP failure

**list(namespace, prefix?)**
- Lists all keys in namespace
- Optional prefix filter
- Returns: `Promise<{ keys: string[] }>`
- Throws: Error on HTTP failure


**Usage Examples:**

```typescript
import { KVClient } from '@kv-storage/client';

const kv = new KVClient('your-api-key');

// Store a value
await kv.put('myapp', 'user:123', { 
  name: 'John', 
  email: 'john@example.com' 
});

// Retrieve a value
const { value } = await kv.get('myapp', 'user:123');
console.log(value); // { name: 'John', email: 'john@example.com' }

// List all keys
const { keys } = await kv.list('myapp');
console.log(keys); // ['user:123', 'user:456', ...]

// List keys with prefix
const { keys } = await kv.list('myapp', 'user:');
console.log(keys); // ['user:123', 'user:456']

// Delete a value
await kv.delete('myapp', 'user:123');
```


**TypeScript Types:**

```typescript
interface KVClientOptions {
  apiKey: string;
  baseUrl?: string;
}

interface KVResponse<T = any> {
  value: T;
}
```

**Error Handling:**
- All methods throw errors on HTTP failures
- Error format: `Error: HTTP {status}: {statusText}`
- Recommended to use try-catch blocks

```typescript
try {
  const { value } = await kv.get('myapp', 'user:123');
} catch (error) {
  console.error('Failed to get value:', error.message);
}
```

---

## Configuration & Environment

### Environment Variables

**Location:** `/.env` (root directory)  
**Template:** `/.env.example`

**Loading:**
- Infrastructure: Loaded in `/packages/infrastructure/src/app.ts` via dotenv
- Dashboard: Loaded by Vite (VITE_ prefix required)
- Landing: Not used (static site)


**AWS Configuration:**
- `AWS_REGION` - AWS region for all resources (default: us-east-1)
- `CDK_DEFAULT_ACCOUNT` - AWS account ID for CDK deployment
- `CDK_DEFAULT_REGION` - Default region for CDK stacks

**Domain Configuration:**
- `DOMAIN_NAME` - Base domain (e.g., kv.vberkoz.com)
- `STAGE` - Deployment stage (dev/prod)

**Derived Domains:**
- Landing: `{DOMAIN_NAME}`
- Dashboard: `dashboard.{DOMAIN_NAME}`
- API: `api.{DOMAIN_NAME}`


**Security:**
- `JWT_SECRET` - Secret for JWT token signing (change in production)
- `PADDLE_WEBHOOK_SECRET` - Paddle webhook signature validation

**Google OAuth:**
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- Used by: Cognito User Pool for social login


**Paddle Configuration (Dashboard Frontend):**
- `VITE_PADDLE_VENDOR_ID` - Paddle vendor/seller ID
- `VITE_PADDLE_STARTER_PRICE_ID` - Starter plan price ID
- `VITE_PADDLE_PRO_PRICE_ID` - Pro plan price ID
- `VITE_PADDLE_SCALE_PRICE_ID` - Scale plan price ID
- `VITE_PADDLE_BUSINESS_PRICE_ID` - Business plan price ID
- `VITE_API_URL` - Backend API URL
- `VITE_DASHBOARD_URL` - Dashboard URL (for redirects)

**Note:** VITE_ prefix required for Vite to expose to frontend

**Monitoring:**
- `ALARM_EMAIL` - Email address for CloudWatch alarm notifications


### Build & Deployment Scripts

**Location:** `/package.json` (root)

**Development:**
- `npm run dev` - Start all dev servers (landing + dashboard)
- Runs dev script in all workspaces concurrently

**Build:**
- `npm run build` - Build all packages
- `npm run build:frontend` - Build landing + dashboard only
- `npm run build:sdk` - Build JavaScript SDK only
- `npm run clean` - Remove all build artifacts and node_modules

**Deployment:**
- `npm run deploy:infra` - Deploy AWS infrastructure via CDK
- `npm run deploy:backend` - Build and deploy backend infrastructure
- `npm run deploy:dashboard` - Build dashboard and deploy infrastructure
- `npm run deploy:frontend` - Build frontend (manual S3 upload required)
- `npm run deploy:all` - Build frontend + deploy infrastructure

**Testing:**
- `npm run loadtest` - Run Artillery load tests


### Configuration Files

**Root Level:**
- `/package.json` - Workspace configuration and scripts
- `/tsconfig.json` - Root TypeScript configuration
- `/.env` - Environment variables (not in git)
- `/.env.example` - Environment template
- `/.gitignore` - Git ignore rules
- `/artillery.yml` - Load testing configuration

**Infrastructure:**
- `/packages/infrastructure/cdk.json` - CDK CLI configuration
- `/packages/infrastructure/tsconfig.json` - TypeScript config

**Landing:**
- `/packages/landing/astro.config.mjs` - Astro configuration
- `/packages/landing/tailwind.config.cjs` - Tailwind CSS config

**Dashboard:**
- `/packages/dashboard/vite.config.ts` - Vite build configuration
- `/packages/dashboard/tailwind.config.js` - Tailwind CSS config
- `/packages/dashboard/.env.development` - Dev environment
- `/packages/dashboard/.env.production` - Production environment

**SDK:**
- `/packages/sdk-js/tsconfig.json` - TypeScript config
- `/packages/sdk-js/package.json` - NPM package config

---

## Common Workflows

### Development Workflow

**Initial Setup:**
```bash
# Clone repository
git clone <repository-url>
cd kv-storage

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

**Start Development Servers:**
```bash
# Start all dev servers (landing + dashboard)
npm run dev

# Landing page: http://localhost:4321
# Dashboard: http://localhost:5173
```


### Build Process

**Build All Packages:**
```bash
npm run build
```

**Build Order:**
1. `@kv/shared` - Types and utilities (dependency for others)
2. `@kv/infrastructure` - CDK synth (generates CloudFormation)
3. `@kv/landing` - Astro static site → `/packages/landing/dist/`
4. `@kv/dashboard` - React SPA → `/packages/dashboard/dist/`
5. `@kv-storage/client` - SDK bundle → `/packages/sdk-js/dist/`

**Build Specific Packages:**
```bash
# Frontend only
npm run build:frontend

# SDK only
npm run build:sdk
```

**Clean Build Artifacts:**
```bash
npm run clean
```


### Testing

**Load Testing:**
```bash
# Run Artillery load tests
npm run loadtest
```

**Configuration:** `/artillery.yml`

**Manual API Testing:**
```bash
# Test API endpoints with curl
curl -X GET https://api.kv.vberkoz.com/v1/myapp/user:123 \
  -H "x-api-key: your-api-key"
```

**Dashboard Testing:**
- Manual testing in browser
- Test authentication flow
- Test namespace creation
- Test API key generation
- Test KV operations via API tester component

**No Automated Tests:**
- Project currently has no unit/integration tests
- Testing done manually and via load testing


### Deployment Steps

**Prerequisites:**
- AWS CLI configured with credentials
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- Domain registered and Route53 hosted zone created
- Environment variables configured in `.env`

**Deploy Infrastructure:**
```bash
# Deploy all CDK stacks
npm run deploy:infra

# Or deploy from infrastructure package
cd packages/infrastructure
npm run deploy
```

**CDK Deployment Order:**
1. KVAuthStack - Cognito User Pool
2. KVDatabaseStack - DynamoDB table
3. KVLambdaStack - Lambda functions
4. KVApiStack - API Gateway
5. KVLandingStack - Landing S3/CloudFront
6. KVDashboardStack - Dashboard S3/CloudFront
7. KVMonitoringStack - CloudWatch alarms

**First Deployment:**
- Takes 10-15 minutes
- Creates SSL certificates (DNS validation required)
- Outputs API URLs and CloudFront distributions


**Deploy Frontend:**
```bash
# Build frontend packages
npm run build:frontend

# Manual S3 upload required
aws s3 sync packages/landing/dist/ s3://kv-landing-bucket/ --delete
aws s3 sync packages/dashboard/dist/ s3://kv-dashboard-bucket/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <landing-dist-id> --paths "/*"
aws cloudfront create-invalidation --distribution-id <dashboard-dist-id> --paths "/*"
```

**Note:** Bucket names output by CDK deployment

**Complete Deployment:**
```bash
# Build frontend + deploy infrastructure
npm run deploy:all

# Then manually upload to S3 (see above)
```


### Troubleshooting

**Lambda Function Errors:**
```bash
# View CloudWatch logs
aws logs tail /aws/lambda/KVLambdaStack-getValue --follow

# Check Lambda function configuration
aws lambda get-function --function-name KVLambdaStack-getValue
```

**API Gateway Issues:**
- Check CORS configuration in `/packages/infrastructure/src/stacks/api-stack.ts`
- Verify JWT authorizer configuration
- Test endpoints with curl or Postman

**DynamoDB Issues:**
```bash
# Scan table (development only)
aws dynamodb scan --table-name kv-storage-data --max-items 10

# Check table status
aws dynamodb describe-table --table-name kv-storage-data
```

**Frontend Issues:**
- Check browser console for errors
- Verify environment variables in dashboard
- Check CloudFront distribution status
- Verify S3 bucket permissions

**Authentication Issues:**
- Verify Cognito User Pool configuration
- Check JWT token expiration
- Verify API key is correct and not expired
- Check rate limiting hasn't been exceeded

**Common Errors:**
- `401` Invalid/expired token or API key | `429` Usage quota exceeded
- `404` Key/namespace doesn't exist | `500` Check Lambda logs

---

## Integration Points

### Cognito Authentication

**Setup Location:** `/packages/infrastructure/src/stacks/auth-stack.ts`

**User Pool Configuration:**
- Sign-in: Email address
- Password policy: Minimum 8 characters
- MFA: Optional
- Email verification required

**User Pool Client:**
- OAuth flows: Authorization code grant
- Callback URLs: Dashboard domain
- Allowed OAuth scopes: email, openid, profile

**Google OAuth Integration:**
- Configured via `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Identity provider added to User Pool
- Users can sign in with Google account


**JWT Token Flow:**
1. User signs up/logs in via dashboard
2. Cognito returns JWT access token
3. Dashboard stores token in localStorage
4. Token included in API requests: `Authorization: Bearer <token>`
5. API Gateway validates token automatically
6. Lambda receives verified user claims in event context

**Dashboard Integration:**
- Auth context: `/packages/dashboard/src/context/AuthContext.tsx`
- Login page: `/packages/dashboard/src/pages/LoginPage.tsx`
- Signup page: `/packages/dashboard/src/pages/SignupPage.tsx`

### Paddle Payment Integration

**Webhook Handler:** `/packages/infrastructure/src/lambdas/paddle-webhook.ts`

**Webhook Events Handled:**
- `subscription.created` - Activate paid plan
- `subscription.updated` - Handle plan changes
- `subscription.canceled` - Downgrade to free tier
- `subscription.payment_failed` - Send notification


**Webhook Configuration:**
- Endpoint: `POST /v1/webhooks/paddle`
- Signature verification using `PADDLE_WEBHOOK_SECRET`
- Updates user plan in DynamoDB

**Dashboard Integration:**
- Pricing page: `/packages/dashboard/src/pages/PricingPage.tsx`
- Paddle.js loaded via script tag
- Checkout initiated with price IDs from environment variables
- Success callback updates user state

**Environment Variables:**
- `PADDLE_WEBHOOK_SECRET` - Backend webhook validation
- `VITE_PADDLE_VENDOR_ID` - Frontend Paddle account ID
- `VITE_PADDLE_STARTER_PRICE_ID` - Starter plan price
- `VITE_PADDLE_PRO_PRICE_ID` - Pro plan price
- `VITE_PADDLE_SCALE_PRICE_ID` - Scale plan price
- `VITE_PADDLE_BUSINESS_PRICE_ID` - Business plan price


### CloudFront Distributions

**Landing Distribution:**
- Origin: S3 bucket (landing static files)
- Domain: `kv.{DOMAIN_NAME}`
- SSL Certificate: ACM certificate with DNS validation
- Default root object: index.html
- Error pages: Custom 404 handling

**Dashboard Distribution:**
- Origin: S3 bucket (React SPA)
- Domain: `dashboard.kv.{DOMAIN_NAME}`
- SSL Certificate: ACM certificate with DNS validation
- SPA routing: 404 → index.html (for client-side routing)
- Cache behavior: No caching for index.html

**Configuration:** `/packages/infrastructure/src/stacks/frontend-stack.ts`

**Cache Invalidation:**
```bash
# After deploying new frontend
aws cloudfront create-invalidation \
  --distribution-id <dist-id> \
  --paths "/*"
```


### API Gateway Configuration

**Type:** HTTP API (API Gateway v2)  
**Configuration:** `/packages/infrastructure/src/stacks/api-stack.ts`

**Custom Domain:**
- Domain: `api.kv.{DOMAIN_NAME}`
- SSL Certificate: ACM certificate
- Route53 A record: Points to API Gateway regional endpoint

**Authorization:**
- JWT Authorizer for dashboard endpoints
- Issuer: Cognito User Pool
- Audience: User Pool Client ID
- No authorizer for KV operations (API key validated in Lambda)

**CORS:**
- Allowed origins: Landing and dashboard domains
- Allowed methods: ALL
- Allowed headers: Content-Type, Authorization, x-api-key
- Preflight requests handled automatically

**Throttling:**
- Default: AWS account limits
- Per-route throttling: Not configured
- Rate limiting enforced in Lambda layer


### Key Third-Party Dependencies

**Backend (Lambda):**
- `@aws-sdk/client-dynamodb` - DynamoDB client
- `@aws-sdk/lib-dynamodb` - DynamoDB document client
- `aws-jwt-verify` - Cognito JWT verification
- `@aws-lambda-powertools/logger` v1.14.0+ - Structured logging with correlation IDs
- `@aws-lambda-powertools/tracer` v1.14.0+ - X-Ray tracing integration
- `@middy/core` v4.6.0+ - Lambda middleware engine
- `@middy/http-json-body-parser` v4.6.0+ - Automatic JSON parsing
- `@middy/http-error-handler` v4.6.0+ - Error handling middleware
- `@middy/http-cors` v4.6.0+ - CORS middleware
- `@middy/validator` v4.6.0+ - Request validation middleware
- `pino` v8.16.0+ - High-performance JSON logger
- `rate-limiter-flexible` v3.0.0+ - Token bucket rate limiting
- `crypto` (built-in) - API key hashing and UUID generation
- `zod` v3.22.4 - Runtime type validation and input sanitization

**Infrastructure (CDK):**
- `aws-cdk-lib` - AWS CDK v2 constructs
- `aws-cdk-lib/aws-lambda-nodejs` - Lambda bundling with esbuild
- `constructs` - CDK construct library

**Frontend (Dashboard):**
- `react` v18 - UI library
- `react-router-dom` v6 - Client-side routing
- `react-error-boundary` v4.0.11 - Error boundary implementation with fallback UI
- `react-hook-form` v7.48 - Form state management and validation
- `zod` v3.22.4 - Schema validation for forms
- `@hookform/resolvers` v3.3.2 - Zod resolver for React Hook Form
- `zustand` v4.4.7 - Global state management with persistence
- `@tanstack/react-query` v5.90.12 - Server state management with caching and optimistic updates
- `@radix-ui/react-dialog` v1.0.5 - Accessible dialog primitives
- `@radix-ui/react-dropdown-menu` v2.0.6 - Accessible dropdown menu primitives
- `@radix-ui/react-toast` v1.1.5 - Accessible toast notification primitives
- `@radix-ui/react-tooltip` v1.0.7 - Accessible tooltip primitives
- `class-variance-authority` v0.7.0 - Component variant management
- `clsx` v2.0.0 - Conditional className utility
- `tailwind-merge` v2.0.0 - Tailwind class merging utility
- `tailwindcss` - Utility-first CSS
- `vite` - Build tool and dev server

**Frontend (Landing):**
- `astro` - Static site generator
- `@astrojs/tailwind` - Tailwind integration
- `tailwindcss` - Utility-first CSS

**SDK:**
- No external dependencies (uses native fetch)

**Development:**
- `typescript` v5 - Type checking
- `artillery` - Load testing
- `dotenv` - Environment variable loading


