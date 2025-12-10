# Deployment Guide

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Node.js 18+ and pnpm installed
- Domain name configured (kv.vberkoz.com)
- Paddle account for payments
- SES email verified for notifications

## Environment Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Configure required variables:
```bash
# AWS
export CDK_DEFAULT_ACCOUNT=your-account-id
export CDK_DEFAULT_REGION=us-east-1

# Security
export JWT_SECRET=your-secure-random-string
export PADDLE_WEBHOOK_SECRET=your-paddle-webhook-secret

# Paddle
export VITE_PADDLE_VENDOR_ID=your-vendor-id
export VITE_PADDLE_PRO_PRICE_ID=pri_xxx
export VITE_PADDLE_SCALE_PRICE_ID=pri_xxx

# Monitoring
export ALARM_EMAIL=alerts@kv.vberkoz.com
```

## Initial Deployment

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Build All Packages
```bash
pnpm build
```

### 3. Bootstrap CDK (First Time Only)
```bash
cd packages/infrastructure
npx cdk bootstrap
```

### 4. Deploy Infrastructure
```bash
pnpm deploy:infra
```

This deploys:
- DatabaseStack (DynamoDB table)
- LambdaStack (11 Lambda functions)
- ApiStack (API Gateway)
- FrontendStack (S3 + CloudFront)
- MonitoringStack (CloudWatch dashboard + alarms)

### 5. Verify Deployment
```bash
# Get API URL from CloudFormation outputs
aws cloudformation describe-stacks \
  --stack-name KVApiStack \
  --query 'Stacks[0].Outputs'

# Get CloudFront URL
aws cloudformation describe-stacks \
  --stack-name KVFrontendStack \
  --query 'Stacks[0].Outputs'
```

### 6. Configure DNS
Point your domain to the CloudFront distribution:
```
kv.vberkoz.com → CloudFront URL
api.kv.vberkoz.com → API Gateway URL
```

### 7. Verify SES Email
```bash
aws ses verify-email-identity --email-address noreply@kv.vberkoz.com
aws ses verify-email-identity --email-address alerts@kv.vberkoz.com
```

## Update Deployment

### Update Infrastructure Only
```bash
pnpm deploy:infra
```

### Update Frontend Only
```bash
pnpm build:frontend
# Manually upload to S3 or redeploy FrontendStack
```

### Update Everything
```bash
pnpm deploy:all
```

## Rollback Procedure

### Rollback to Previous Version
```bash
cd packages/infrastructure
cdk deploy --previous
```

### Rollback Specific Stack
```bash
cdk deploy KVLambdaStack --previous
```

### Emergency Rollback
1. Identify the issue in CloudWatch Logs
2. Check recent deployments:
```bash
aws cloudformation describe-stack-events \
  --stack-name KVLambdaStack \
  --max-items 20
```
3. Rollback:
```bash
cdk deploy --previous
```
4. Verify rollback successful
5. Communicate to users

## Monitoring

### CloudWatch Dashboard
Access at: AWS Console → CloudWatch → Dashboards → KV-Storage-Metrics

Metrics tracked:
- API request count
- API latency
- Lambda duration (GET, PUT, DELETE)
- Lambda errors
- Lambda invocations

### CloudWatch Alarms
- API 5xx errors > 10 in 1 minute
- API latency > 1 second for 2 minutes
- Lambda errors > 5 in 1 minute

Alarms send notifications to: alerts@kv.vberkoz.com

### View Logs
```bash
# API Gateway logs
aws logs tail /aws/apigateway/KVStorageApi --follow

# Lambda logs
aws logs tail /aws/lambda/KVLambdaStack-GetValueFunction --follow
```

## Load Testing

### Run Load Test
```bash
export API_KEY=your-test-api-key
pnpm loadtest
```

### Interpret Results
- Target: >1000 requests/second
- p95 latency: <200ms
- Error rate: <1%

## Backup and Restore

### DynamoDB Backup
Automatic point-in-time recovery enabled.

Manual backup:
```bash
aws dynamodb create-backup \
  --table-name KVStorageTable \
  --backup-name kv-backup-$(date +%Y%m%d)
```

### Restore from Backup
```bash
aws dynamodb restore-table-from-backup \
  --target-table-name KVStorageTable-Restored \
  --backup-arn arn:aws:dynamodb:...
```

## Cost Optimization

### Monitor Costs
```bash
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### Expected Costs (Free Tier)
- DynamoDB: $0 (25GB free)
- Lambda: $0 (1M requests free)
- API Gateway: $3.50 (1M requests)
- CloudFront: $0 (1TB free)
- S3: $0 (5GB free)

Total: ~$3.50/month for first 1M requests

## Troubleshooting

### Lambda Timeout
Increase timeout in lambda-stack.ts:
```typescript
timeout: Duration.seconds(30)
```

### DynamoDB Throttling
Switch to provisioned capacity or increase on-demand limits.

### API Gateway 429 Errors
Check rate limiting in usage.ts and adjust plan limits.

### CloudFront Cache Issues
Invalidate cache:
```bash
aws cloudfront create-invalidation \
  --distribution-id EXXXXXXXXXXXXX \
  --paths "/*"
```

## Security Checklist

- [ ] JWT_SECRET is strong random string
- [ ] API keys hashed with SHA-256
- [ ] HTTPS enforced on CloudFront
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SES email verified
- [ ] Paddle webhook signature verified
- [ ] CloudWatch alarms configured
- [ ] IAM roles follow least privilege

## Post-Deployment Verification

1. Test signup flow
2. Test login flow
3. Test API key generation
4. Test CRUD operations
5. Test rate limiting
6. Test email notifications
7. Test Paddle checkout
8. Test usage tracking
9. Verify CloudWatch metrics
10. Verify alarms trigger

## Support

- AWS Support: [Your Support Plan]
- Paddle Support: support@paddle.com
- Internal: alerts@kv.vberkoz.com
