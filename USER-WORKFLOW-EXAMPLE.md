# Example User Workflow: Creating and Using KV Storage Endpoints

## Overview
This document walks through a complete example of how a user creates and uses KV Storage endpoints for their application.

## Step 1: User Registration and Login

1. **Visit Dashboard**: User goes to `https://dashboard.kv.vberkoz.com`
2. **Sign Up**: Click "Sign Up" and create account via Cognito
3. **Login**: Authenticate using Google OAuth
4. **Auto-redirect**: System automatically redirects to `/dashboard` after successful login
## Step 2: Dashboard Overview & API Key Generation

Upon login, system automatically:
- **Generates API Key**: Creates personal API key if none exists
- **Stores Locally**: Saves API key in browser for immediate use

User then sees:
- **Usage Statistics**: Current API requests (0/10,000) and storage (0 GB/0.1 GB) 
- **API Key**: Personal API key with copy button (e.g., `kv_1a2b3c4d5e6f...`)
- **Quick Start**: Pre-filled curl command ready to use
- **Navigation**: Links to Namespaces, API Explorer
## Step 3: Create Namespace for App

**Scenario**: User wants to build a todo app called "TaskMaster"

1. **Navigate**: Click "Namespaces" in sidebar
2. **Create Namespace**: 
   - Enter: `taskmaster-prod`
   - Click "Create" button
3. **Confirmation**: Namespace appears in list with creation date
## Step 4: Test API with Explorer

1. **Navigate**: Click "API Explorer" in sidebar
2. **Configure Test**:
   - Namespace: `taskmaster-prod`
   - Key: `user:john:tasks`
   - Value: `{"tasks": [{"id": 1, "title": "Buy groceries", "done": false}]}`
3. **Send Request**: Click "Send Request" button
4. **View Response**: See success response with stored data
## Step 5: Integrate into Application

**Frontend Integration** (React/JavaScript):

```javascript
// Install SDK
npm install @kv-storage/client

// Use in app
import { KVClient } from '@kv-storage/client';

const kv = new KVClient('kv_1a2b3c4d5e6f...');

// Save user's tasks
await kv.put('taskmaster-prod', 'user:john:tasks', {
  tasks: [
    { id: 1, title: 'Buy groceries', done: false },
    { id: 2, title: 'Walk the dog', done: true }
  ]
});

// Load user's tasks
const { value } = await kv.get('taskmaster-prod', 'user:john:tasks');
console.log(value.tasks);
```
## Step 6: Production Usage Patterns

**Common Endpoint Patterns**:

```bash
# User data
PUT /v1/taskmaster-prod/user:john:profile
PUT /v1/taskmaster-prod/user:john:tasks
PUT /v1/taskmaster-prod/user:john:settings

# App configuration
PUT /v1/taskmaster-prod/config:theme
PUT /v1/taskmaster-prod/config:features

# Session data
PUT /v1/taskmaster-prod/session:abc123:data
```

**REST API Usage**:
```bash
# Store task list
curl -X PUT "https://api.kv.vberkoz.com/v1/taskmaster-prod/user:john:tasks" \
  -H "Authorization: Bearer kv_1a2b3c4d5e6f..." \
  -H "Content-Type: application/json" \
  -d '{"value": {"tasks": [{"id": 1, "title": "Buy groceries"}]}}'

# Retrieve task list  
curl "https://api.kv.vberkoz.com/v1/taskmaster-prod/user:john:tasks" \
  -H "Authorization: Bearer kv_1a2b3c4d5e6f..."
```
## Step 7: Monitor Usage

1. **Dashboard Monitoring**: Return to dashboard to see:
   - Requests: 15/10,000 (0.15% used)
   - Storage: 2.3 KB/100 MB (0.002% used)
   - Plan: Free

2. **Usage Tracking**: All API calls automatically tracked
3. **Upgrade Prompts**: System shows upgrade suggestions when approaching limits
## Key Benefits Demonstrated

- **Zero Setup**: No database configuration or server management
- **Instant Endpoints**: Namespace creation immediately enables API access
- **Multiple Environments**: Create separate namespaces for `dev`, `staging`, `prod`
- **Built-in Testing**: API Explorer for immediate validation
- **Usage Transparency**: Real-time monitoring of requests and storage
- **Multiple Integration Options**: REST API, JavaScript SDK, Python SDK

## Time to First API Call: ~2 minutes
From signup to storing first data via API.