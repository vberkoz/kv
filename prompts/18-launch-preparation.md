# Agent Prompt 18: Launch Preparation & Optimization

## Required Skills
- **Performance optimization**: Caching, response times, scalability, load testing
- **Monitoring**: Logging, alerting, dashboards, CloudWatch, observability
- **Security review**: Vulnerability assessment, penetration testing, hardening
- **Marketing**: Product Hunt assets, social media content, launch strategy
- **DevOps**: Deployment automation, rollback procedures, disaster recovery
- **Load testing**: Stress testing, capacity planning, performance benchmarking

## Context
From brainstorm launch sequence:
- Performance optimization
- Error handling and monitoring
- Product Hunt assets
- Initial marketing preparation

## Implementation Requirements

### 1. CloudWatch Monitoring (CDK)
```typescript
import { Dashboard, GraphWidget } from 'aws-cdk-lib/aws-cloudwatch';
import { Alarm, ComparisonOperator } from 'aws-cdk-lib/aws-cloudwatch';

const dashboard = new Dashboard(this, 'KVDashboard', {
  dashboardName: 'KV-Storage-Metrics'
});

dashboard.addWidgets(
  new GraphWidget({
    title: 'API Requests',
    left: [api.metricCount()]
  }),
  new GraphWidget({
    title: 'Lambda Duration',
    left: [getValue.metricDuration()]
  })
);

const errorAlarm = new Alarm(this, 'ErrorAlarm', {
  metric: api.metricServerError(),
  threshold: 10,
  evaluationPeriods: 1,
  comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD
});
```

### 2. Load Testing Script
```bash
# Install: npm install -g artillery
# artillery.yml
config:
  target: 'https://api.kv.vberkoz.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'PUT and GET'
    flow:
      - put:
          url: '/v1/test/key-{{ $randomNumber() }}'
          headers:
            Authorization: 'Bearer {{ $env.API_KEY }}'
          json:
            value: { test: true }
      - get:
          url: '/v1/test/key-1'
          headers:
            Authorization: 'Bearer {{ $env.API_KEY }}'

# Run: artillery run artillery.yml
```

### 3. Launch Checklist
```markdown
## Pre-Launch
- [ ] All tests passing
- [ ] Load testing completed (>1000 req/s)
- [ ] Error monitoring configured
- [ ] Backup/restore tested
- [ ] Security scan completed
- [ ] Documentation complete
- [ ] Pricing page live

## Launch Day
- [ ] Deploy to production
- [ ] Verify all endpoints
- [ ] Post on Product Hunt
- [ ] Share on Twitter/LinkedIn
- [ ] Monitor error rates
- [ ] Respond to feedback

## Post-Launch
- [ ] Monitor metrics daily
- [ ] Address user feedback
- [ ] Fix critical bugs
- [ ] Plan next features
```

### 4. Product Hunt Assets
```markdown
## Tagline
"Serverless key-value storage API for modern apps"

## Description
Simple REST API for storing JSON data without managing infrastructure.
Perfect for serverless apps, side projects, and MVPs.

## First Comment
"Hey Product Hunt! 👋

I built KV Storage to solve a simple problem: storing data in serverless apps
without setting up databases.

Key features:
✅ Simple REST API (GET, PUT, DELETE)
✅ No infrastructure management
✅ Pay-per-request pricing
✅ Free tier: 100K requests/month

Would love your feedback!"
```

## Success Criteria
- [ ] API responds in <200ms
- [ ] Load test passes 1000 req/s
- [ ] CloudWatch alarms configured
- [ ] Product Hunt assets ready
- [ ] Rollback plan documented