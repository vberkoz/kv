import { Stack, StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Distribution, ViewerProtocolPolicy, AllowedMethods, CachePolicy } from 'aws-cdk-lib/aws-cloudfront';
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
          cachePolicy: CachePolicy.CACHING_DISABLED
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

    new CfnOutput(this, 'DistributionUrl', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution URL'
    });

    new CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'S3 Bucket Name'
    });
  }
}
