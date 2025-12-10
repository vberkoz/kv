# KV Storage - Serverless Key-Value API

Serverless key-value storage API powered by DynamoDB. Simple REST API for storing and retrieving JSON data without managing infrastructure.

## Project Structure

Monorepo with 4 packages:
- **shared**: Common types and utilities
- **infrastructure**: AWS CDK infrastructure code
- **landing**: Astro landing page
- **dashboard**: React dashboard application

## Setup

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Development

```bash
# Run all dev servers
pnpm dev

# Deploy infrastructure
pnpm deploy:infra

# Build frontend packages
pnpm deploy:frontend
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- AWS_REGION
- DOMAIN_NAME
- STAGE
