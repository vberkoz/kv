# Library Recommendations for KV Storage

Comprehensive list of recommended libraries organized by category and priority.

## Backend Libraries

### Validation & Type Safety

#### Zod - Runtime Type Validation
```json
"zod": "^3.22.4"
```
**Use Cases:**
- Validate API request payloads
- Validate environment variables
- Generate TypeScript types
- Create OpenAPI schemas

**Example:**
```typescript
import { z } from 'zod';

const NamespaceSchema = z.object({
  name: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(200).optional()
});
```

---

### Logging & Observability

#### AWS Lambda Powertools
```json
"@aws-lambda-powertools/logger": "^1.14.0",
"@aws-lambda-powertools/tracer": "^1.14.0",
"@aws-lambda-powertools/metrics": "^1.14.0"
```
**Use Cases:**
- Structured logging with correlation IDs
- X-Ray tracing integration
- Custom CloudWatch metrics
- Best practices for Lambda

**Example:**
```typescript
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';

const logger = new Logger();
const tracer = new Tracer();
```

#### Pino - Fast JSON Logger
```json
"pino": "^8.16.0",
"pino-pretty": "^10.2.3"
```
**Use Cases:**
- High-performance logging
- Structured JSON logs
- Pretty printing for development
- Log levels and filtering

---

### Lambda Middleware

#### Middy - Lambda Middleware Engine
```json
"@middy/core": "^4.6.0",
"@middy/http-json-body-parser": "^4.6.0",
"@middy/http-error-handler": "^4.6.0",
"@middy/http-cors": "^4.6.0",
"@middy/validator": "^4.6.0",
"@middy/http-response-serializer": "^4.6.0"
```
**Use Cases:**
- Reusable middleware pattern
- JSON body parsing
- Error handling
- CORS configuration
- Input validation

**Example:**
```typescript
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';

const handler = middy(baseHandler)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }));
```

---

### Rate Limiting & Caching

#### ioredis - Redis Client
```json
"ioredis": "^5.3.2"
```
**Use Cases:**
- Distributed rate limiting
- Session storage
- Cache layer
- Pub/sub messaging

#### rate-limiter-flexible
```json
"rate-limiter-flexible": "^3.0.0"
```
**Use Cases:**
- Token bucket algorithm
- Sliding window rate limiting
- Multiple storage backends
- Distributed rate limiting

**Example:**
```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redis = new Redis({ host: 'redis-host' });
const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 100,
  duration: 60
});
```

---

### Error Tracking

#### Sentry - Error Monitoring
```json
"@sentry/serverless": "^7.91.0"
```
**Use Cases:**
- Error tracking and grouping
- Performance monitoring
- Release tracking
- User feedback

**Example:**
```typescript
import * as Sentry from '@sentry/serverless';

Sentry.AWSLambda.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
});

export const handler = Sentry.AWSLambda.wrapHandler(baseHandler);
```

---

### OpenAPI & Documentation

#### Zod to OpenAPI
```json
"@asteasolutions/zod-to-openapi": "^5.5.0"
```
**Use Cases:**
- Generate OpenAPI specs from Zod
- Keep docs in sync with code
- Type-safe API documentation

**Example:**
```typescript
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

const schema = z.object({
  name: z.string()
}).openapi({ description: 'User name' });
```

---

### Testing

#### Vitest - Unit Testing
```json
"vitest": "^1.0.0",
"@vitest/ui": "^1.0.0",
"@vitest/coverage-v8": "^1.0.0"
```
**Use Cases:**
- Fast unit tests
- TypeScript support
- Coverage reporting
- Watch mode

#### AWS SDK Mock
```json
"aws-sdk-client-mock": "^3.0.0"
```
**Use Cases:**
- Mock AWS SDK v3 calls
- Test Lambda handlers
- Simulate AWS errors

**Example:**
```typescript
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);
ddbMock.on(GetCommand).resolves({ Item: { id: '123' } });
```

---

## Frontend Libraries

### State Management

#### Zustand - Lightweight State
```json
"zustand": "^4.4.7"
```
**Use Cases:**
- Global state management
- Simple API
- No boilerplate
- TypeScript support

**Example:**
```typescript
import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));
```

#### TanStack Query (React Query)
```json
"@tanstack/react-query": "^5.0.0",
"@tanstack/react-query-devtools": "^5.0.0"
```
**Use Cases:**
- Server state management
- Automatic caching
- Background refetching
- Optimistic updates

**Example:**
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['namespaces'],
  queryFn: fetchNamespaces
});
```

---

### Form Management

#### React Hook Form
```json
"react-hook-form": "^7.48.0",
"@hookform/resolvers": "^3.3.2"
```
**Use Cases:**
- Form state management
- Validation
- Performance optimization
- Zod integration

**Example:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema)
});
```

---

### UI Components

#### Radix UI - Accessible Primitives
```json
"@radix-ui/react-dialog": "^1.0.5",
"@radix-ui/react-dropdown-menu": "^2.0.6",
"@radix-ui/react-toast": "^1.1.5",
"@radix-ui/react-tooltip": "^1.0.7",
"@radix-ui/react-select": "^2.0.0",
"@radix-ui/react-tabs": "^1.0.4"
```
**Use Cases:**
- Accessible components
- Unstyled primitives
- Keyboard navigation
- ARIA attributes

#### Tailwind Utilities
```json
"class-variance-authority": "^0.7.0",
"clsx": "^2.0.0",
"tailwind-merge": "^2.0.0"
```
**Use Cases:**
- Component variants
- Conditional classes
- Merge Tailwind classes

**Example:**
```typescript
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const button = cva('base-classes', {
  variants: {
    variant: {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500'
    }
  }
});
```

---

### Charts & Visualization

#### Recharts - React Charts
```json
"recharts": "^2.10.3"
```
**Use Cases:**
- Usage graphs
- Analytics dashboards
- Responsive charts
- Customizable

**Example:**
```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={usageData}>
  <Line type="monotone" dataKey="requests" />
  <XAxis dataKey="date" />
  <YAxis />
</LineChart>
```

---

### Error Handling

#### React Error Boundary
```json
"react-error-boundary": "^4.0.11"
```
**Use Cases:**
- Catch React errors
- Fallback UI
- Error logging
- Reset functionality

**Example:**
```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

---

### Notifications

#### React Hot Toast
```json
"react-hot-toast": "^2.4.1"
```
**Use Cases:**
- Toast notifications
- Success/error messages
- Customizable
- Promise-based

**Example:**
```typescript
import toast from 'react-hot-toast';

toast.success('Namespace created!');
toast.error('Failed to create namespace');
```

---

### Date & Time

#### date-fns - Date Utilities
```json
"date-fns": "^3.0.0"
```
**Use Cases:**
- Date formatting
- Date manipulation
- Relative time
- Lightweight

**Example:**
```typescript
import { formatDistanceToNow, format } from 'date-fns';

formatDistanceToNow(new Date(createdAt), { addSuffix: true });
format(new Date(), 'PPP');
```

---

### Icons

#### Lucide React - Icon Library
```json
"lucide-react": "^0.294.0"
```
**Use Cases:**
- Consistent icons
- Tree-shakeable
- Customizable
- TypeScript support

**Example:**
```typescript
import { Key, Database, Settings } from 'lucide-react';

<Key className="w-4 h-4" />
```

---

### Code Highlighting

#### Prism React Renderer
```json
"prism-react-renderer": "^2.3.1"
```
**Use Cases:**
- Syntax highlighting
- Code examples
- API documentation
- Customizable themes

---

### Internationalization

#### react-i18next
```json
"react-i18next": "^13.5.0",
"i18next": "^23.7.0"
```
**Use Cases:**
- Multi-language support
- Translation management
- Locale detection
- Pluralization

---

## Development Tools

### Code Quality

#### ESLint - Linting
```json
"eslint": "^8.55.0",
"@typescript-eslint/eslint-plugin": "^6.15.0",
"@typescript-eslint/parser": "^6.15.0",
"eslint-plugin-react": "^7.33.2",
"eslint-plugin-react-hooks": "^4.6.0",
"eslint-plugin-jsx-a11y": "^6.8.0"
```

#### Prettier - Formatting
```json
"prettier": "^3.1.1",
"prettier-plugin-tailwindcss": "^0.5.9"
```

---

### Git Hooks

#### Husky - Git Hooks
```json
"husky": "^8.0.3",
"lint-staged": "^15.2.0"
```
**Use Cases:**
- Pre-commit hooks
- Run linting
- Run tests
- Format code

---

### Testing

#### Testing Library - React Testing
```json
"@testing-library/react": "^14.1.2",
"@testing-library/jest-dom": "^6.1.5",
"@testing-library/user-event": "^14.5.1"
```

#### Playwright - E2E Testing
```json
"@playwright/test": "^1.40.0"
```

---

### Build Tools

#### Vite Plugins
```json
"vite-plugin-pwa": "^0.17.4",
"vite-bundle-visualizer": "^1.0.0",
"vite-tsconfig-paths": "^4.2.2"
```

---

### Monitoring

#### Web Vitals
```json
"web-vitals": "^3.5.0"
```
**Use Cases:**
- Track Core Web Vitals
- Performance monitoring
- User experience metrics

---

## SDK Libraries

### HTTP Client

#### Axios - HTTP Client
```json
"axios": "^1.6.2"
```
**Use Cases:**
- HTTP requests
- Interceptors
- Request/response transformation
- Timeout handling

**Example:**
```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000
});

client.interceptors.request.use((config) => {
  config.headers['x-api-key'] = apiKey;
  return config;
});
```

---

### Retry Logic

#### axios-retry
```json
"axios-retry": "^4.0.0"
```
**Use Cases:**
- Automatic retries
- Exponential backoff
- Configurable retry conditions

---

## Infrastructure Libraries

### AWS CDK Constructs

#### CDK Patterns
```json
"@aws-solutions-constructs/aws-lambda-dynamodb": "^2.48.0",
"@aws-solutions-constructs/aws-cloudfront-s3": "^2.48.0"
```
**Use Cases:**
- Pre-built patterns
- Best practices
- Reduced boilerplate

---

### Environment Management

#### dotenv-cli
```json
"dotenv-cli": "^7.3.0",
"env-cmd": "^10.1.0"
```
**Use Cases:**
- Load environment variables
- Multiple environment files
- Cross-platform support

---

## Utility Libraries

### General Utilities

#### Lodash - Utility Functions
```json
"lodash": "^4.17.21",
"@types/lodash": "^4.14.202"
```
**Use Cases:**
- Array/object manipulation
- Debounce/throttle
- Deep cloning
- Type utilities

#### nanoid - ID Generation
```json
"nanoid": "^5.0.4"
```
**Use Cases:**
- Generate unique IDs
- URL-safe
- Smaller than UUID
- Fast

---

### Validation

#### validator.js
```json
"validator": "^13.11.0",
"@types/validator": "^13.11.7"
```
**Use Cases:**
- Email validation
- URL validation
- String sanitization
- Credit card validation

---

## Complete Package.json Examples

### Infrastructure Package
```json
{
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.400.0",
    "@aws-sdk/lib-dynamodb": "^3.400.0",
    "@aws-lambda-powertools/logger": "^1.14.0",
    "@aws-lambda-powertools/tracer": "^1.14.0",
    "@aws-lambda-powertools/metrics": "^1.14.0",
    "@middy/core": "^4.6.0",
    "@middy/http-json-body-parser": "^4.6.0",
    "@middy/http-error-handler": "^4.6.0",
    "@middy/validator": "^4.6.0",
    "aws-cdk-lib": "^2.100.0",
    "aws-jwt-verify": "^5.1.1",
    "zod": "^3.22.4",
    "ioredis": "^5.3.2",
    "rate-limiter-flexible": "^3.0.0",
    "@sentry/serverless": "^7.91.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "aws-sdk-client-mock": "^3.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Dashboard Package
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-toast": "^1.1.5",
    "react-hot-toast": "^2.4.1",
    "react-error-boundary": "^4.0.11",
    "recharts": "^2.10.3",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "@sentry/react": "^7.91.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "vite": "^4.3.0"
  }
}
```

### SDK Package
```json
{
  "dependencies": {
    "axios": "^1.6.2",
    "axios-retry": "^4.0.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Installation Priority

### Phase 1 - Critical (Week 1)
1. Zod - Input validation
2. AWS Lambda Powertools - Logging
3. React Error Boundary - Error handling
4. Vitest - Testing

### Phase 2 - Important (Week 2-3)
5. Middy - Lambda middleware
6. React Query - State management
7. React Hook Form - Forms
8. ESLint/Prettier - Code quality

### Phase 3 - Enhancement (Week 4-6)
9. Radix UI - UI components
10. Sentry - Error tracking
11. ioredis - Caching
12. Recharts - Analytics

### Phase 4 - Optional (Week 7+)
13. i18next - Internationalization
14. Playwright - E2E testing
15. Additional utilities as needed

