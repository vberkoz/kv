# Implementation Guide

## How to Use These Prompt Files

Each prompt file is designed to be used with Amazon Q Developer (or similar AI coding assistants) to implement features step-by-step.

## Method 1: Using Amazon Q Chat (Recommended)

### Step-by-Step Process

1. **Open Amazon Q Chat in your IDE**
   - Use the chat panel in VS Code/IDE

2. **Reference the prompt file**
   - Type: `@prompts/01-project-setup.md implement this`
   - Or copy the entire prompt content into chat

3. **Let Q implement the code**
   - Q will read the prompt and create all necessary files
   - Review the changes before accepting

4. **Verify implementation**
   - Check the success criteria in the prompt
   - Run the commands listed (e.g., `pnpm install`, `pnpm build`)

5. **Move to next prompt**
   - Once verified, move to the next prompt file
   - Repeat the process

### Example Workflow

```bash
# Terminal 1: Your working directory
cd /Users/basilsergius/projects/kv

# In Amazon Q Chat:
# "@prompts/01-project-setup.md implement this task"

# After Q creates files, verify:
pnpm install
pnpm build

# If successful, move to next:
# "@prompts/02-dynamodb-table.md implement this task"
```

## Method 2: Manual Implementation

If you prefer to implement manually:

1. **Read the prompt file**
   - Open `prompts/01-project-setup.md`

2. **Follow the structure**
   - Create files listed in "Exact File Structure"
   - Copy code from "Implementation Requirements"
   - Add dependencies from "Required Dependencies"

3. **Test as you go**
   - Use "Success Criteria" as checklist
   - Run commands to verify

4. **Move to next prompt**

## Method 3: Batch Implementation

For experienced developers:

```bash
# Review all prompts first
ls prompts/*.md

# Implement multiple prompts in sequence
# Use Q to implement prompts 1-7 (backend)
# Then prompts 8-13 (frontend)
# Finally prompts 14-18 (payments & launch)
```

## Recommended Order

### Phase 1: Foundation (Prompts 1-4)
```
01-project-setup.md       → Monorepo structure
02-dynamodb-table.md      → Database
03-lambda-crud.md         → Core API functions
04-api-gateway.md         → API routing
```

**Verify:** API endpoints work with curl

### Phase 2: Features (Prompts 5-7)
```
05-namespace-management.md → Multi-tenancy
06-user-auth.md           → Authentication
07-usage-tracking.md      → Rate limiting
```

**Verify:** Users can signup, create namespaces, API enforces limits

### Phase 3: Frontend (Prompts 8-13)
```
08-astro-landing.md       → Landing page
09-react-dashboard-setup.md → Dashboard setup
10-s3-cloudfront.md       → Hosting
11-auth-ui.md             → Login/signup UI
12-dashboard-features.md  → Dashboard features
13-api-explorer.md        → API testing UI
```

**Verify:** Full user flow works end-to-end

### Phase 4: Production (Prompts 14-18)
```
14-paddle-integration.md  → Payments
15-plan-enforcement.md    → Usage limits
16-documentation-site.md  → Docs
17-client-libraries.md    → SDKs
18-launch-preparation.md  → Launch
```

**Verify:** Production-ready system

## Tips for Success

### 1. One Prompt at a Time
Don't skip ahead. Each prompt builds on previous ones.

### 2. Verify Before Moving On
Check all items in "Success Criteria" before next prompt.

### 3. Use Git Commits
```bash
git add .
git commit -m "Implement prompt 01: project setup"
```

### 4. Test Incrementally
```bash
# After prompt 4, test API:
curl -X PUT "http://localhost:3001/v1/test/key1" \
  -H "Authorization: Bearer test-key" \
  -d '{"value": {"test": true}}'
```

### 5. Keep Notes
Track any deviations or issues for later reference.

## Common Issues

### Issue: Dependencies not installing
```bash
# Solution:
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: TypeScript errors
```bash
# Solution:
pnpm -r build
# Fix any import errors
```

### Issue: CDK deployment fails
```bash
# Solution:
cd packages/infrastructure
cdk bootstrap
cdk deploy --all
```

### Issue: Lambda functions timeout
```bash
# Solution: Check environment variables
# Verify TABLE_NAME, GSI_NAME are set correctly
```

## Using with Amazon Q

### Best Prompts for Q

**Good:**
```
@prompts/01-project-setup.md implement this exactly as specified
```

**Better:**
```
Implement the project setup from @prompts/01-project-setup.md
Create all files and configurations as specified.
```

**Best:**
```
I need to implement prompt 1 from @prompts/01-project-setup.md

Please:
1. Create all files in the exact structure shown
2. Add all dependencies listed
3. Use the exact code provided
4. Verify the success criteria

Let me know when complete so I can test.
```

### Iterative Refinement

If Q's implementation isn't perfect:

```
The implementation is close but:
1. Missing the .gitignore file
2. tsconfig.json needs the exact config from the prompt

Please add these files with the exact content from the prompt.
```

## Validation Commands

After each phase:

### Phase 1 (Backend)
```bash
pnpm build
cd packages/infrastructure
cdk synth
cdk deploy --all
```

### Phase 2 (Features)
```bash
# Test signup
curl -X POST "https://api.../v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Phase 3 (Frontend)
```bash
cd packages/landing
pnpm build

cd ../dashboard
pnpm build
```

### Phase 4 (Production)
```bash
# Run load test
artillery run artillery.yml

# Check monitoring
aws cloudwatch get-dashboard --dashboard-name KV-Storage-Metrics
```

## Getting Help

If stuck:
1. Re-read the prompt's "Implementation Requirements"
2. Check "Success Criteria" - what's failing?
3. Review "Error Handling" section in prompt
4. Ask Q: "The implementation from prompt X is failing at step Y. Here's the error: [error]. How do I fix this based on the prompt requirements?"

## Next Steps

Start with:
```
@prompts/01-project-setup.md implement this task
```

Then work through prompts 2-18 in order.

Good luck! 🚀
