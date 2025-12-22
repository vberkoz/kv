# Create Project Context File

You are tasked with creating a comprehensive project context file for the KV Storage project. This file will serve as a reference for understanding the project structure, architecture, and key locations in the codebase.

## Instructions

Create the file at: `/Users/basilsergius/projects/kv/PROJECT-CONTEXT.md`

Build it incrementally in small sequential steps (NOT all at once or concurrently):

### Step 1: Project Overview & Architecture
- Read `/Users/basilsergius/Documents/vasyl_berkoz/brainstorm-kv.md` for project vision
- Read `/Users/basilsergius/projects/kv/README.md` for current state
- Create initial file with:
  - Project name, tagline, and core value proposition
  - High-level architecture (API Gateway, Lambda, DynamoDB, Cognito, S3/CloudFront)
  - Tech stack with versions
  - Monorepo structure overview (6 packages)

### Step 2: Directory Structure
- List all packages with their purpose
- Map key directories in each package
- Include file paths for main entry points
- Note configuration files locations

### Step 3: Backend & API
- Read `/Users/basilsergius/projects/kv/packages/infrastructure/` structure
- Read `/Users/basilsergius/projects/kv/packages/shared/` for types
- Document:
  - API endpoints and their handler file locations
  - Lambda function locations
  - Middleware and utilities
  - Authentication flow and files
  - Error handling patterns

### Step 4: Database Schema
- Read DynamoDB table definitions in infrastructure code
- Document:
  - Table structure (KVStore, Users, APIKeys, UsageMetrics)
  - Primary keys and GSIs
  - Access patterns
  - Key file locations for DB operations

### Step 5: Frontend Applications
- Read `/Users/basilsergius/projects/kv/packages/landing/` structure
- Read `/Users/basilsergius/projects/kv/packages/dashboard/` structure
- Document:
  - Landing page structure (Astro)
  - Dashboard structure (React)
  - Key components locations
  - Routing structure
  - State management approach

### Step 6: Infrastructure & CDK
- Read CDK stack files in `/Users/basilsergius/projects/kv/packages/infrastructure/`
- Document:
  - CDK stacks and their purpose
  - Resource definitions locations
  - Environment configuration
  - Deployment process

### Step 7: SDKs
- Read `/Users/basilsergius/projects/kv/packages/sdk-js/` structure
- Document:
  - SDK architecture
  - Main client class locations
  - API methods
  - Usage examples

### Step 8: Configuration & Environment
- Document all environment variables
- Configuration file locations
- Secrets management
- Build and deployment scripts

### Step 9: Common Workflows
- Development workflow
- Build process
- Testing approach
- Deployment steps
- Troubleshooting guide

### Step 10: Integration Points
- Cognito authentication setup
- Paddle payment integration
- CloudFront distributions
- API Gateway configuration
- Key third-party dependencies

## Format Guidelines

- Use clear markdown headers (##, ###, ####)
- Include file paths as: `/packages/name/src/file.ts`
- Use code blocks for examples
- Keep descriptions concise but informative
- Use bullet points for lists
- Add ASCII diagrams where helpful
- Target 3,000-4,000 lines total

## Important

- Make ONE step at a time, wait for confirmation before proceeding
- Read files as needed for each step
- Don't make assumptions - verify by reading actual code
- Focus on "where to find X" rather than implementation details
- Keep information actionable and scannable
