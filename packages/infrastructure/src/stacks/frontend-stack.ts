import { Stack, StackProps, RemovalPolicy, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { Distribution, ViewerProtocolPolicy, OriginAccessIdentity, Function as CfFunction, FunctionCode, FunctionEventType, AllowedMethods, CachePolicy, OriginRequestPolicy, OriginProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin, HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';

export class LandingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const baseDomain = process.env.DOMAIN_NAME || 'vberkoz.com';
    const landingDomain = `kv.${baseDomain}`;
    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: baseDomain
    });

    const certificate = new Certificate(this, 'LandingCertificate', {
      domainName: landingDomain,
      validation: CertificateValidation.fromDns(hostedZone)
    });

    const bucket = new Bucket(this, 'LandingBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false
    });

    const oai = new OriginAccessIdentity(this, 'LandingOAI');
    bucket.grantRead(oai);

    const cfFunction = new CfFunction(this, 'LandingIndexHtmlFunction', {
      code: FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          var uri = request.uri;

          if (uri.endsWith("/")) {
            request.uri += "index.html";
          } else if (!uri.includes(".")) {
            request.uri += "/index.html";
          }

          return request;
        }
      `)
    });

    const distribution = new Distribution(this, 'LandingDistribution', {
      domainNames: [landingDomain],
      certificate,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessIdentity(bucket, { originAccessIdentity: oai }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [{
          function: cfFunction,
          eventType: FunctionEventType.VIEWER_REQUEST
        }]
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: Duration.minutes(5) },
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: Duration.minutes(5) }
      ]
    });

    new ARecord(this, 'LandingAliasRecord', {
      zone: hostedZone,
      recordName: landingDomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution))
    });

    new BucketDeployment(this, 'DeployLanding', {
      sources: [Source.asset('../landing/dist')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*']
    });

    new CfnOutput(this, 'LandingUrl', {
      value: `https://${landingDomain}`,
      description: 'Landing Page URL'
    });

    new CfnOutput(this, 'LandingBucketName', {
      value: bucket.bucketName,
      description: 'Landing S3 Bucket Name'
    });
  }
}

export class DashboardStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const baseDomain = process.env.DOMAIN_NAME || 'vberkoz.com';
    const dashboardDomain = `dashboard.kv.${baseDomain}`;
    const apiDomain = 'd-cw2uu11x0g.execute-api.us-east-1.amazonaws.com';
    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'vberkoz.com'
    });

    const certificate = new Certificate(this, 'DashboardCertificate', {
      domainName: dashboardDomain,
      validation: CertificateValidation.fromDns(hostedZone)
    });

    const bucket = new Bucket(this, 'DashboardBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false
    });

    const oai = new OriginAccessIdentity(this, 'DashboardOAI');
    bucket.grantRead(oai);

    const cfFunction = new CfFunction(this, 'DashboardIndexHtmlFunction', {
      code: FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          var uri = request.uri;

          if (uri === '/' || uri === '') {
            request.uri = '/index.html';
          } else if (!uri.includes('.') && !uri.startsWith('/api')) {
            request.uri = '/index.html';
          }

          return request;
        }
      `)
    });

    const apiStripFunction = new CfFunction(this, 'ApiStripPrefixFunction', {
      code: FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  if (request.uri.indexOf('/api') === 0) {
    request.uri = '/prod' + request.uri.substring(4);
  }
  return request;
}
      `)
    });

    const distribution = new Distribution(this, 'DashboardDistribution', {
      domainNames: [dashboardDomain],
      certificate,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessIdentity(bucket, { originAccessIdentity: oai }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [{
          function: cfFunction,
          eventType: FunctionEventType.VIEWER_REQUEST
        }]
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new HttpOrigin(apiDomain, {
            protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY
          }),
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
          allowedMethods: AllowedMethods.ALLOW_ALL,
          cachePolicy: CachePolicy.CACHING_DISABLED,
          originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
          functionAssociations: [{
            function: apiStripFunction,
            eventType: FunctionEventType.VIEWER_REQUEST
          }]
        }
      },
      defaultRootObject: 'index.html'
    });

    new ARecord(this, 'DashboardAliasRecord', {
      zone: hostedZone,
      recordName: dashboardDomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution))
    });

    new BucketDeployment(this, 'DeployDashboard', {
      sources: [Source.asset('../dashboard/dist')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*']
    });

    new CfnOutput(this, 'DashboardUrl', {
      value: `https://${dashboardDomain}`,
      description: 'Dashboard URL'
    });

    new CfnOutput(this, 'DashboardBucketName', {
      value: bucket.bucketName,
      description: 'Dashboard S3 Bucket Name'
    });
  }
}
