# KV Storage - Serverless Key-Value API

Serverless key-value storage API powered by AWS DynamoDB. Simple REST API for storing and retrieving JSON data without managing infrastructure.

## Features

- **Simple REST API**: Store, retrieve, list, and delete JSON data
- **Namespace Isolation**: Organize data with namespaces
- **User Authentication**: Cognito-based auth with API key management
- **Usage Tracking**: Monitor API calls and storage usage
- **Subscription Plans**: Free, Starter, Pro, Scale, and Business tiers
- **Client Libraries**: Official JavaScript/TypeScript and Python SDKs
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

Monorepo with 6 packages:
- **shared**: Common types and utilities
- **infrastructure**: AWS CDK infrastructure code
- **landing**: Astro landing page
- **dashboard**: React dashboard application
- **sdk-js**: JavaScript/TypeScript client library
- **sdk-python**: Python client library

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- AWS CLI configured
- AWS CDK CLI

### Installation

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build
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

# Paddle Configuration
VITE_PADDLE_VENDOR_ID=your-paddle-vendor-id
VITE_API_URL=https://api.your-domain.com
VITE_DASHBOARD_URL=https://dashboard.your-domain.com

# Monitoring
ALARM_EMAIL=alerts@your-domain.com
```

## Development

```bash
# Run all dev servers (landing + dashboard)
pnpm dev

# Build all packages
pnpm build

# Build frontend only
pnpm build:frontend

# Build SDK
pnpm build:sdk

# Clean all build artifacts
pnpm clean
```

## Deployment

### Deploy Infrastructure

```bash
# Deploy all AWS resources
pnpm deploy:infra
```

### Deploy Frontend

```bash
# Build and deploy landing + dashboard to S3
pnpm deploy:frontend
```

### Deploy Everything

```bash
# Build frontend and deploy all resources
pnpm deploy:all
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## API Usage

### REST API

```bash
# Store a value
curl -X PUT https://api.your-domain.com/v1/kv/myapp/user:123 \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'

# Retrieve a value
curl https://api.your-domain.com/v1/kv/myapp/user:123 \
  -H "x-api-key: your-api-key"

# List keys
curl https://api.your-domain.com/v1/kv/myapp/keys \
  -H "x-api-key: your-api-key"

# Delete a value
curl -X DELETE https://api.your-domain.com/v1/kv/myapp/user:123 \
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

### Python SDK

```bash
pip install kv-storage
```

```python
from kv_storage import KVClient

kv = KVClient('your-api-key')

kv.put('myapp', 'user:123', {'name': 'John'})
data = kv.get('myapp', 'user:123')
result = kv.list('myapp')
kv.delete('myapp', 'user:123')
```

## Testing

### Load Testing

```bash
# Run Artillery load tests
pnpm loadtest
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
