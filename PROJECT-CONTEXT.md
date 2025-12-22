# KV Storage - Project Context

**Project Name:** KV Storage  
**Tagline:** Serverless key-value storage API  
**Status:** Implementation complete, UI/UX Phase 1 improvements deployed, ready for launch

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
│   │   │   └── usage.ts       # Usage tracking utilities
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
│   │   ├── ui/                # UI primitives
│   │   ├── ApiKeyDisplay.tsx
│   │   ├── ApiTester.tsx
│   │   ├── CodeExamples.tsx
│   │   ├── NamespaceDetails.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── QuickStart.tsx
│   │   ├── StoredItems.tsx
│   │   ├── UpgradePrompt.tsx
│   │   └── UsageStats.tsx
│   ├── constants/
│   │   └── config.ts          # App configuration
│   ├── context/
│   │   └── AuthContext.tsx    # Auth state management
│   ├── hooks/
│   │   └── useApi.ts          # API interaction hook
│   ├── lib/                   # Utilities
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

**auth.ts** - Authentication & Authorization
- `validateToken(token: string)` - Verify JWT from Cognito
- `validateApiKey(apiKey: string)` - Verify x-api-key header, fetch user profile for email/plan
- Returns `AuthenticatedUser` with userId, plan, apiKey

**dynamodb.ts** - Database Client & Helpers
- `docClient` - DynamoDB DocumentClient instance
- `TABLE_NAME` - Main table name constant
- `GSI_NAME` - GSI name constant
- Helper functions for common queries

**response.ts** - HTTP Response Builders
- `success(data: any, statusCode?: number)` - Success response
- `error(message: string, statusCode?: number)` - Error response
- Handles CORS headers automatically

**usage.ts** - Usage Tracking & Rate Limiting
- `checkRateLimit(userId: string, plan: string)` - Check if user within limits
- `incrementRequestCount(userId: string)` - Increment request counter
- `getUsageStats(userId: string)` - Get current usage metrics
- Plan limits enforcement

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
6. Rate limiting checked before operation
7. Request count incremented

**File Locations:**
- JWT validation: `/packages/infrastructure/src/lambdas/shared/auth.ts` (validateToken)
- API key validation: `/packages/infrastructure/src/lambdas/shared/auth.ts` (validateApiKey)
- Cognito config: `/packages/infrastructure/src/stacks/auth-stack.ts`
- API Gateway authorizer: `/packages/infrastructure/src/stacks/api-stack.ts`

### Error Handling

**Standard Error Responses:**
```typescript
{
  statusCode: 400 | 401 | 403 | 404 | 429 | 500,
  body: JSON.stringify({ error: "Error message" })
}
```

**Error Types:**
- `400` Bad Request | `401` Unauthorized | `403` Forbidden
- `404` Not Found | `429` Rate Limit Exceeded | `500` Internal Server Error

**File Location:** `/packages/infrastructure/src/lambdas/shared/response.ts`

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
- `/packages/dashboard/src/pages/DashboardPage.tsx` - Main dashboard with usage stats
- `/packages/dashboard/src/pages/NamespacesPage.tsx` - Namespace list and management
- `/packages/dashboard/src/pages/PricingPage.tsx` - Plan comparison and upgrade


**Key Components:**
- `/packages/dashboard/src/components/layout/DashboardLayout.tsx` - Layout wrapper with nav (enhanced with icons and active states)
- `/packages/dashboard/src/components/ProtectedRoute.tsx` - Auth guard for routes
- `/packages/dashboard/src/components/UsageStats.tsx` - Usage metrics display (color-coded status system)
- `/packages/dashboard/src/components/ApiKeyDisplay.tsx` - API key management UI (enhanced copy feedback)
- `/packages/dashboard/src/components/NamespaceDetails.tsx` - Namespace info and actions
- `/packages/dashboard/src/components/StoredItems.tsx` - Key-value list viewer
- `/packages/dashboard/src/components/ApiTester.tsx` - Interactive API testing tool
- `/packages/dashboard/src/components/CodeExamples.tsx` - SDK usage examples
- `/packages/dashboard/src/components/QuickStart.tsx` - Onboarding guide
- `/packages/dashboard/src/components/UpgradePrompt.tsx` - Plan upgrade CTA

**Recent UI/UX Improvements (Phase 1):**
- Color-coded usage status (blue/yellow/red based on thresholds)
- Enhanced copy feedback with animations and visual states
- Navigation with icons and active state highlighting
- Improved namespace cards with status badges
- Better form validation and loading states
- Rich empty states with helpful guidance
- Skeleton loading animations throughout


**State Management:**
- `/packages/dashboard/src/context/AuthContext.tsx` - Global auth state (user, token, login/logout)
- Uses React Context API for auth state
- LocalStorage for token persistence
- No external state management library

**Custom Hooks:**
- `/packages/dashboard/src/hooks/useApi.ts` - API calls with auth headers

**Services:**
- `/packages/dashboard/src/services/api.ts` - HTTP client for backend API

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
- `crypto` (built-in) - API key hashing

**Infrastructure (CDK):**
- `aws-cdk-lib` - AWS CDK v2 constructs
- `aws-cdk-lib/aws-lambda-nodejs` - Lambda bundling with esbuild
- `constructs` - CDK construct library

**Frontend (Dashboard):**
- `react` v18 - UI library
- `react-router-dom` v6 - Client-side routing
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


