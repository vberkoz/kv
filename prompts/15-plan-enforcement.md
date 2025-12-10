# Agent Prompt 15: Plan Enforcement & Rate Limiting

## Required Skills
- **Rate limiting**: Real-time quota checking, graceful degradation, HTTP 429 handling
- **Usage monitoring**: Threshold alerts, automatic notifications, usage analytics
- **Business rules**: Plan limits, upgrade prompts, grace periods, soft/hard limits
- **Performance**: Fast usage lookups, efficient enforcement, caching strategies
- **Email notifications**: Template management, delivery tracking, user communication
- **Scheduling**: Cron jobs, monthly resets, automated tasks, EventBridge

## Context
From brainstorm plan enforcement:
- Check usage limits on each API request
- Return 429 when limits exceeded
- Email notifications at 80% usage
- Automatic upgrade prompts in dashboard

## Implementation Requirements

### 1. Usage Threshold Check (already in prompt 7)
Rate limiting is implemented in `src/lambdas/shared/usage.ts`

### 2. Email Notifications (Lambda)
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({});

export async function sendUsageAlert(email: string, percent: number) {
  await ses.send(new SendEmailCommand({
    Source: 'noreply@kv.vberkoz.com',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: `Usage Alert: ${percent}% of your plan limit` },
      Body: {
        Text: { Data: `You've used ${percent}% of your monthly quota. Consider upgrading your plan.` }
      }
    }
  }));
}
```

### 3. Monthly Reset (EventBridge + Lambda)
```typescript
// CDK Stack
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';

const resetRule = new Rule(this, 'MonthlyReset', {
  schedule: Schedule.cron({ day: '1', hour: '0', minute: '0' })
});
resetRule.addTarget(new LambdaFunction(resetUsageFunction));

// Lambda handler
export async function handler() {
  // Reset all user usage counters
  // Implementation: Scan users, reset USAGE# items
}
```

### 4. Upgrade Prompt (Dashboard)
```typescript
export function UpgradePrompt({ usage, limits }: any) {
  const percent = (usage.requests / limits.requests) * 100;
  
  if (percent < 80) return null;
  
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
      <p className="font-semibold">You've used {percent.toFixed(0)}% of your plan</p>
      <a href="/upgrade" className="text-blue-600 underline">Upgrade now</a>
    </div>
  );
}
```

## Success Criteria
- [ ] 429 responses when limits exceeded
- [ ] Email sent at 80% usage
- [ ] Monthly reset runs automatically
- [ ] Upgrade prompts show at thresholds