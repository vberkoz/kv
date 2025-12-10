# Agent Prompt 10: S3 + CloudFront Deployment

## Required Skills
- **AWS S3**: Static website hosting, bucket policies, CORS configuration
- **CloudFront**: CDN configuration, caching strategies, SSL/TLS, origin access
- **Route 53**: DNS management, domain configuration, alias records
- **AWS CDK**: Multi-stack coordination, cross-stack references, deployment
- **SSL/TLS**: ACM certificate management, domain validation, HTTPS enforcement
- **Build automation**: CI/CD pipelines, deployment scripts, asset optimization

## Context
From brainstorm hosting setup:
- S3 (static site hosting for Astro + React build)
- CloudFront (CDN, SSL, custom domain)
- Domain: https://kv.vberkoz.com

**AWS Architecture:**
```
CloudFront (kv.vberkoz.com)
├── S3 (Astro + React static files)
└── API Gateway (/api/*) → Lambda → DynamoDB
```

## Exact File Structure
```
packages/infrastructure/
└── src/
    └── stacks/
        └── frontend-stack.ts
```

## Implementation Requirements

### 1. src/stacks/frontend-stack.ts
```typescript
import { Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Distribution, ViewerProtocolPolicy, AllowedMethods } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin, RestApiOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';

interface FrontendStackProps extends StackProps {
  api: RestApi;
}

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html',
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new S3Origin(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new RestApiOrigin(props.api),
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
          allowedMethods: AllowedMethods.ALLOW_ALL,
          cachePolicy: { cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad' } // CachingDisabled
        }
      },
      defaultRootObject: 'index.html'
    });

    new BucketDeployment(this, 'DeployWebsite', {
      sources: [
        Source.asset('../landing/dist'),
        Source.asset('../dashboard/dist')
      ],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*']
    });
  }
}
```

### 2. Update package.json scripts
```json
{
  "scripts": {
    "build:frontend": "pnpm --filter landing build && pnpm --filter dashboard build",
    "deploy:all": "pnpm build:frontend && pnpm --filter infrastructure deploy"
  }
}
```

## Success Criteria
- [ ] S3 bucket created for static hosting
- [ ] CloudFront distribution serves content
- [ ] /api/* routes proxy to API Gateway
- [ ] Static assets cached properly
- [ ] API routes bypass cache
- [ ] Deployment script works end-to-end