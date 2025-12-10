# Agent Prompt 1: Project Setup & Monorepo Structure

## Required Skills
- **Node.js/npm ecosystem**: Package management, workspaces, dependency resolution
- **TypeScript**: Configuration, tsconfig.json setup, module resolution
- **Monorepo architecture**: Workspace organization, cross-package dependencies
- **Git**: .gitignore patterns for Node.js, AWS, and build artifacts
- **Project structure**: Separation of concerns, scalable folder organization

## Context & Dependencies
- First step in building serverless KV storage API
- Foundation for: Landing site (Prompt 8), Dashboard (Prompt 9), Infrastructure (Prompt 2)
- No dependencies on other prompts

## Exact File Structure
```
kv/
├── packages/
│   ├── landing/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── dashboard/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── infrastructure/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/
│       ├── src/
│       │   └── types.ts
│       ├── package.json
│       └── tsconfig.json
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── .gitignore
├── .env.example
└── README.md
```

## Required Dependencies (Root package.json)
```json
{
  "name": "kv-storage",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "pnpm -r build",
    "dev": "pnpm -r dev",
    "deploy:infra": "pnpm --filter infrastructure deploy",
    "deploy:frontend": "pnpm --filter landing build && pnpm --filter dashboard build",
    "clean": "pnpm -r clean && rm -rf node_modules"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

## Environment Variables & Configuration

### .env.example
```bash
AWS_REGION=us-east-1
DOMAIN_NAME=kv.vberkoz.com
STAGE=dev
```

### pnpm-workspace.yaml
```yaml
packages:
  - 'packages/*'
```

### Root tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### .gitignore
```
# Dependencies
node_modules/

# Build outputs
dist/
build/
.next/
out/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# AWS
cdk.out/
.cdk.staging/
*.js.map

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
```

## Package Configurations

### packages/shared/package.json
```json
{
  "name": "@kv/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### packages/shared/tsconfig.json
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### packages/shared/src/types.ts
```typescript
export interface User {
  userId: string;
  email: string;
  apiKey: string;
  plan: 'free' | 'pro' | 'scale';
  createdAt: string;
}

export interface Namespace {
  namespaceId: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface KeyValue {
  key: string;
  value: any;
  namespace: string;
  createdAt: string;
  updatedAt: string;
}
```

### packages/infrastructure/package.json
```json
{
  "name": "@kv/infrastructure",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "deploy": "cdk deploy",
    "clean": "rm -rf dist cdk.out"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### packages/landing/package.json
```json
{
  "name": "@kv/landing",
  "version": "1.0.0",
  "scripts": {
    "dev": "echo 'Landing dev server'",
    "build": "echo 'Landing build'",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### packages/dashboard/package.json
```json
{
  "name": "@kv/dashboard",
  "version": "1.0.0",
  "scripts": {
    "dev": "echo 'Dashboard dev server'",
    "build": "echo 'Dashboard build'",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

## Implementation Requirements

1. **Create root package.json** with workspace configuration and scripts
2. **Create pnpm-workspace.yaml** to define workspace packages
3. **Create root tsconfig.json** with base TypeScript configuration
4. **Create .gitignore** with patterns for dependencies, builds, and AWS artifacts
5. **Create .env.example** as template for environment variables
6. **Create packages/shared** with types.ts, package.json, and tsconfig.json
7. **Create packages/infrastructure** with package.json and tsconfig.json
8. **Create packages/landing** with package.json and tsconfig.json
9. **Create packages/dashboard** with package.json and tsconfig.json
10. **Create README.md** with project overview and setup instructions

## Validation Rules
- Package names must use @kv/ scope
- All packages must have build and clean scripts
- TypeScript configs must extend root config
- Shared package must export types from src/types.ts
- All package.json files must have version 1.0.0

## Error Handling
- **pnpm not installed**: Install with `npm install -g pnpm`
- **TypeScript errors**: Ensure all tsconfig.json files extend root config
- **Import errors**: Run `pnpm install` to link workspace packages
- **Build failures**: Run `pnpm clean` then `pnpm build`

## README.md Content
```markdown
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
```

## Success Criteria (Testable)
- [ ] All files and folders created as specified
- [ ] `pnpm install` completes without errors
- [ ] `pnpm build` compiles shared package successfully
- [ ] TypeScript compilation works across packages
- [ ] Shared types can be imported: `import { User } from '@kv/shared'`
- [ ] Git ignores node_modules, dist, .env, and cdk.out
- [ ] All workspace packages are properly linked
- [ ] README.md provides clear setup instructions