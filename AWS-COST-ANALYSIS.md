# AWS Cost Analysis - KV Storage

## Architecture Overview

- **DynamoDB**: Single table with GSI, on-demand billing
- **Lambda**: 11 functions (GET, PUT, DELETE, auth, namespaces, webhooks, usage reset)
- **API Gateway**: REST API with CORS
- **S3**: Static website hosting (landing + dashboard)
- **CloudFront**: CDN distribution
- **EventBridge**: Monthly cron job
- **CloudWatch**: Dashboard, logs, alarms
- **SNS**: Email notifications

## Cost Breakdown by Service

### 1. DynamoDB (On-Demand)

**Pricing:**
- Write: $1.25 per million write request units
- Read: $0.25 per million read request units
- Storage: $0.25 per GB-month

**Free Tier Usage (Monthly):**
- Assuming 100K API requests (free tier)
- ~60% reads (GET), ~30% writes (PUT), ~10% deletes (DELETE)
- Average item size: 1KB

**Calculations:**
- Reads: 60,000 × 1 RCU = 60,000 RCUs = $0.015
- Writes: 40,000 × 1 WCU = 40,000 WCUs = $0.05
- Storage: ~1GB = $0.25

**DynamoDB Total: ~$0.32/month**

### 2. Lambda

**Pricing:**
- Requests: $0.20 per million requests
- Duration: $0.0000166667 per GB-second
- Free tier: 1M requests + 400,000 GB-seconds/month

**Free Tier Usage:**
- 100K API requests = 100K Lambda invocations
- Average duration: 100ms
- Memory: 1024MB (1GB)

**Calculations:**
- Requests: 100,000 × $0.20/1M = $0.02
- Duration: 100,000 × 0.1s × 1GB × $0.0000166667 = $0.17
- **Within free tier: $0.00**

**Lambda Total: $0.00/month (free tier)**

### 3. API Gateway (HTTP API)

**Pricing:**
- $1.00 per million requests (HTTP API)
- Free tier: None

**Free Tier Usage:**
- 100K requests

**Calculations:**
- 100,000 × $1.00/1M = $0.10

**API Gateway Total: $0.10/month**

### 4. S3

**Pricing:**
- Storage: $0.023 per GB-month
- PUT requests: $0.005 per 1,000 requests
- GET requests: $0.0004 per 1,000 requests
- Free tier: 5GB storage, 20,000 GET, 2,000 PUT

**Free Tier Usage:**
- Storage: ~100MB (landing + dashboard)
- Monthly requests: ~1,000 (low traffic static site)

**S3 Total: $0.00/month (free tier)**

### 5. CloudFront

**Pricing:**
- Data transfer out: $0.085 per GB (first 10TB)
- HTTP/HTTPS requests: $0.0075 per 10,000 requests
- Free tier: 1TB data transfer, 10M requests

**Free Tier Usage:**
- Data transfer: ~10GB/month
- Requests: ~50,000/month

**CloudFront Total: $0.00/month (free tier)**

### 6. EventBridge

**Pricing:**
- $1.00 per million events
- Free tier: None

**Usage:**
- 1 event per month (monthly reset)

**EventBridge Total: $0.00/month**

### 7. CloudWatch

**Pricing:**
- Logs ingestion: $0.50 per GB
- Logs storage: $0.03 per GB-month
- Metrics: First 10 custom metrics free
- Dashboards: First 3 free
- Alarms: $0.10 per alarm per month

**Free Tier Usage:**
- Logs: ~1GB ingestion, ~1GB storage
- Metrics: 6 custom metrics (within free tier)
- Dashboard: 1 dashboard (free)
- Alarms: 3 alarms

**Calculations:**
- Logs ingestion: 1GB × $0.50 = $0.50
- Logs storage: 1GB × $0.03 = $0.03
- Alarms: 3 × $0.10 = $0.30

**CloudWatch Total: $0.83/month**

### 8. SNS

**Pricing:**
- Email notifications: $2.00 per 100,000 notifications
- Free tier: 1,000 email notifications

**Usage:**
- ~10 alarm notifications per month

**SNS Total: $0.00/month (free tier)**

### 9. SES (Email Sending)

**Pricing:**
- $0.10 per 1,000 emails
- Free tier: 62,000 emails/month (when called from EC2/Lambda)

**Usage:**
- ~100 usage alert emails per month

**SES Total: $0.00/month (free tier)**

---

## Total Monthly Cost Summary

### Free Tier (100K requests/month)
| Service | Cost |
|---------|------|
| DynamoDB | $0.32 |
| Lambda | $0.00 (free tier) |
| API Gateway (HTTP API) | $0.10 |
| S3 | $0.00 (free tier) |
| CloudFront | $0.00 (free tier) |
| EventBridge | $0.00 |
| CloudWatch | $0.83 |
| SNS | $0.00 (free tier) |
| SES | $0.00 (free tier) |
| **TOTAL** | **$1.25/month** |

---

## Scaling Scenarios

### Pro Plan (1M requests/month)

| Service | Cost |
|---------|------|
| DynamoDB | $3.15 (600K reads + 400K writes) |
| Lambda | $1.90 (beyond free tier) |
| API Gateway (HTTP API) | $1.00 |
| S3 | $0.00 (free tier) |
| CloudFront | $0.85 (100GB transfer) |
| EventBridge | $0.00 |
| CloudWatch | $2.50 (more logs) |
| SNS | $0.00 (free tier) |
| SES | $0.01 (1,000 emails) |
| **TOTAL** | **$9.41/month** |

**Revenue:** $10/month × users
**Break-even:** ~1 Pro user (profitable!)

### Scale Plan (10M requests/month)

| Service | Cost |
|---------|------|
| DynamoDB | $31.50 (6M reads + 4M writes) |
| Lambda | $19.00 |
| API Gateway (HTTP API) | $10.00 |
| S3 | $0.00 (free tier) |
| CloudFront | $8.50 (1TB transfer) |
| EventBridge | $0.00 |
| CloudWatch | $10.00 (significant logs) |
| SNS | $0.02 |
| SES | $0.10 (10,000 emails) |
| **TOTAL** | **$79.12/month** |

**Revenue:** $30/month × users
**Break-even:** ~3 Scale users

---

## Cost Optimization Strategies

### 1. DynamoDB
- ✅ Using on-demand (no idle capacity costs)
- ✅ Single table design (minimize table count)
- ✅ Efficient key design (minimize hot partitions)
- 💡 Consider reserved capacity if usage predictable

### 2. Lambda
- ✅ Appropriate memory allocation (1024MB)
- ✅ Efficient code (minimal cold starts)
- ✅ Bundling with esbuild (smaller packages)
- 💡 Monitor duration and optimize slow functions

### 3. API Gateway
- ✅ Using HTTP API ($1.00 per million)
- ✅ 70% cheaper than REST API
- 💡 Implement caching for read-heavy workloads

### 4. CloudWatch Logs
- ⚠️ Second most expensive service
- 💡 Reduce log retention (default 7 days)
- 💡 Filter logs before ingestion
- 💡 Use log sampling for high-volume functions

### 5. CloudFront
- ✅ Caching static assets (reduces origin requests)
- ✅ Using free tier effectively
- 💡 Optimize cache TTL for better hit rates

---

## Monthly Cost by User Tier

### Free Users (100K requests)
- **Cost per user:** $1.25
- **Revenue:** $0
- **Margin:** -$1.25 (loss leader)

### Pro Users (1M requests)
- **Cost per user:** $9.41
- **Revenue:** $10.00
- **Margin:** +$0.59 (profitable!)
- **Note:** Sustainable with current pricing

### Scale Users (10M requests)
- **Cost per user:** $79.12
- **Revenue:** $30.00
- **Margin:** -$49.12 (loss)
- **Note:** Pricing needs adjustment

---

## Pricing Recommendations

### Current Pricing
- Free: 100K requests, 25GB storage
- Pro: $10/mo, 1M requests, 100GB storage
- Scale: $30/mo, 10M requests, 500GB storage

### Recommended Adjustments

**Option 1: Increase Scale Pricing**
- Scale: $100/mo for 10M requests
- Margin: $20.88 profit per user

**Option 2: Reduce Scale Limits**
- Scale: $30/mo for 3M requests
- Cost: ~$27/mo
- Margin: +$3/mo (profitable!)

**Option 3: Keep Current Scale Pricing (Recommended)**
- Scale: $30/mo for 10M requests
- Accept -$49 loss per user
- Upsell to Enterprise tier

**Option 4: Add Enterprise Tier**
- Enterprise: $300/mo for 50M requests
- Cost: ~$350/mo
- Margin: -$50/mo, negotiate custom pricing

---

## Break-Even Analysis

### Monthly Fixed Costs
- Monitoring: $0.83
- Base infrastructure: $0.42
- **Total Fixed:** $1.25/month

### Variable Costs (per 1M requests)
- DynamoDB: $3.15
- Lambda: $1.90
- API Gateway (HTTP API): $1.00
- CloudWatch: $0.50
- **Total Variable:** $6.55 per 1M requests

### Break-Even Points
- **10 Free users:** -$12.50/mo (acceptable for growth)
- **5 Pro users:** $50 revenue - $47 cost = +$3/mo (profitable!)
- **10 Pro users:** $100 revenue - $94 cost = +$6/mo (profitable!)
- **20 Pro users:** $200 revenue - $188 cost = +$12/mo (profitable!)

**Conclusion:** Pro tier is now profitable! Need just 2 Pro users to cover free tier costs.

---

## Annual Cost Projections

### Year 1 (Conservative)
- 100 free users: -$125/mo
- 20 Pro users: $200/mo revenue, $188/mo cost = +$12/mo
- 2 Scale users: $60/mo revenue, $158/mo cost = -$98/mo
- **Net:** -$211/mo or -$2,532/year

### Year 1 (Optimistic)
- 500 free users: -$625/mo
- 100 Pro users: $1,000/mo revenue, $941/mo cost = +$59/mo
- 10 Scale users: $300/mo revenue, $791/mo cost = -$491/mo
- **Net:** -$1,057/mo or -$12,684/year

### Year 2 (Target)
- 1,000 free users: -$1,250/mo
- 300 Pro users: $3,000/mo revenue, $2,823/mo cost = +$177/mo
- 30 Scale users: $900/mo revenue, $2,374/mo cost = -$1,474/mo
- **Net:** -$2,547/mo or -$30,564/year

**Path to Profitability:** Pro tier is now profitable! Focus on Pro conversions. Adjust Scale pricing or add Enterprise tier for high-volume users.

---

## Cost Monitoring

### CloudWatch Metrics to Track
- DynamoDB consumed capacity
- Lambda invocation count and duration
- API Gateway request count
- CloudWatch log ingestion
- Data transfer out

### Billing Alerts
- Set budget alert at $50/month
- Set budget alert at $100/month
- Set budget alert at $500/month

### Cost Anomaly Detection
- Enable AWS Cost Anomaly Detection
- Alert on >20% cost increase
- Review weekly cost reports

---

## Conclusion

**Current Architecture Cost:** $1.25/month for free tier usage

**Strengths:**
- ✅ Using HTTP API (70% cheaper than REST API)
- ✅ Pro tier is now profitable ($0.59 margin per user)
- ✅ Highly cost-effective for low volume
- ✅ Scales automatically with usage
- ✅ No idle capacity costs
- ✅ Generous free tiers utilized

**Concerns:**
- ⚠️ Scale plan still not profitable (-$49.12 per user)
- ⚠️ CloudWatch logs can grow quickly
- ⚠️ Free tier is loss leader (-$1.25 per user)

**Recommendations:**
1. ✅ HTTP API implemented - saving 70% on API costs
2. Focus growth on Pro tier (now profitable!)
3. Adjust Scale plan pricing to $100/mo or reduce limits to 5M requests
4. Implement log filtering and retention policies
5. Add Enterprise tier ($300+/mo) for high-volume customers
6. Monitor costs weekly during launch
7. Celebrate: Pro tier is sustainable! 🎉
