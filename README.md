# KV Storage - Serverless Key-Value API

Serverless key-value storage API powered by AWS DynamoDB. Simple REST API for storing and retrieving JSON data without managing infrastructure.

## Features

- **Simple REST API**: Store, retrieve, list, and delete JSON data
- **Namespace Isolation**: Organize data with namespaces
- **User Authentication**: Cognito-based auth with API key management
- **Usage Tracking**: Monitor API calls and storage usage
- **Subscription Plans**: Free, Starter, Pro, Scale, and Business tiers
- **Client Libraries**: Official JavaScript/TypeScript SDK
- **Dashboard**: React-based UI for managing namespaces and API keys
- **Landing Page**: Astro-powered marketing site
- **Serverless**: Auto-scaling with pay-per-use pricing

## Architecture

- **API**: AWS API Gateway + Lambda (Node.js) at `api.domain.com`
- **Database**: DynamoDB with GSI for efficient queries
- **Auth**: Amazon Cognito with JWT tokens
- **Payments**: Paddle integration for subscriptions
- **Landing**: S3 + CloudFront at `domain.com`
- **Dashboard**: S3 + CloudFront at `dashboard.domain.com`
- **Infrastructure**: AWS CDK (TypeScript)

## Project Structure

Monorepo with 5 packages:
- **shared**: Common types and utilities
- **infrastructure**: AWS CDK infrastructure code
- **landing**: Astro landing page
- **dashboard**: React dashboard application
- **sdk-js**: JavaScript/TypeScript client library

## Quick Start

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)
- AWS CLI configured
- AWS CDK CLI

### Installation

```bash
# Install dependencies
npm install

# Build all packages
npm run build
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# AWS Configuration
AWS_REGION=us-east-1
CDK_DEFAULT_ACCOUNT=your-account-id
CDK_DEFAULT_REGION=us-east-1

# Domain Configuration
DOMAIN_NAME=your-domain.com
STAGE=prod

# Security
JWT_SECRET=your-jwt-secret
PADDLE_WEBHOOK_SECRET=your-paddle-webhook-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Paddle Configuration
VITE_PADDLE_VENDOR_ID=your-paddle-vendor-id
VITE_PADDLE_STARTER_PRICE_ID=pri_starter_monthly
VITE_PADDLE_PRO_PRICE_ID=pri_pro_monthly
VITE_PADDLE_SCALE_PRICE_ID=pri_scale_monthly
VITE_PADDLE_BUSINESS_PRICE_ID=pri_business_monthly
VITE_API_URL=https://api.your-domain.com
VITE_DASHBOARD_URL=https://dashboard.your-domain.com

# Monitoring
ALARM_EMAIL=alerts@your-domain.com
```

## Development

```bash
# Run all dev servers (landing + dashboard)
npm run dev

# Build all packages
npm run build

# Build frontend only
npm run build:frontend

# Build SDK
npm run build:sdk

# Clean all build artifacts
npm run clean
```

## Deployment

### Deploy Infrastructure

```bash
# Deploy all AWS resources
npm run deploy:infra
```

### Deploy Frontend

```bash
# Build landing + dashboard (manual S3 upload required)
npm run deploy:frontend
```

### Deploy Everything

```bash
# Build frontend and deploy infrastructure
npm run deploy:all
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## API Usage

### REST API

```bash
# Store a value
curl -X PUT https://api.your-domain.com/v1/myapp/user:123 \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"value":{"name":"John","email":"john@example.com"}}'

# Retrieve a value
curl https://api.your-domain.com/v1/myapp/user:123 \
  -H "x-api-key: your-api-key"

# List keys
curl https://api.your-domain.com/v1/myapp \
  -H "x-api-key: your-api-key"

# Delete a value
curl -X DELETE https://api.your-domain.com/v1/myapp/user:123 \
  -H "x-api-key: your-api-key"
```

### JavaScript/TypeScript SDK

```bash
npm install @kv-storage/client
```

```typescript
import { KVClient } from '@kv-storage/client';

const kv = new KVClient('your-api-key');

await kv.put('myapp', 'user:123', { name: 'John' });
const { value } = await kv.get('myapp', 'user:123');
const { keys } = await kv.list('myapp');
await kv.delete('myapp', 'user:123');
```

## Testing

### Load Testing

```bash
# Run Artillery load tests
npm run loadtest
```

## Pricing Plans

- **Free**: 10K requests/month, 100MB storage
- **Starter**: 100K requests/month, 1GB storage
- **Pro**: 1M requests/month, 10GB storage
- **Scale**: 10M requests/month, 100GB storage
- **Business**: Custom limits

See [PRICING-STRATEGY.md](./PRICING-STRATEGY.md) for details.

## Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Launch Checklist](./LAUNCH-CHECKLIST.md)
- [AWS Cost Analysis](./AWS-COST-ANALYSIS.md)
- [Pricing Strategy](./PRICING-STRATEGY.md)
- [Product Hunt Launch](./PRODUCT-HUNT.md)

## License

MIT
