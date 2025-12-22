import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { HttpApi, HttpMethod, CorsHttpMethod, DomainName } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayv2DomainProperties } from 'aws-cdk-lib/aws-route53-targets';

interface ApiStackProps extends StackProps {
  getValue: NodejsFunction;
  putValue: NodejsFunction;
  deleteValue: NodejsFunction;
  createNamespace: NodejsFunction;
  listNamespaces: NodejsFunction;
  listKeys: NodejsFunction;
  signup: NodejsFunction;
  login: NodejsFunction;
  generateApiKey: NodejsFunction;
  getApiKey: NodejsFunction;
  getUsage: NodejsFunction;
  paddleWebhook: NodejsFunction;
  userPoolId: string;
  userPoolClientId: string;
}

export class ApiStack extends Stack {
  public readonly api: HttpApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const baseDomain = process.env.DOMAIN_NAME || 'vberkoz.com';
    const apiDomainName = `api.kv.${baseDomain}`;
    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: baseDomain
    });

    const certificate = new Certificate(this, 'ApiCertificate', {
      domainName: apiDomainName,
      validation: CertificateValidation.fromDns(hostedZone)
    });

    const customDomain = new DomainName(this, 'ApiDomain', {
      domainName: apiDomainName,
      certificate
    });

    // Create JWT authorizer for Cognito
    const jwtAuthorizer = new HttpJwtAuthorizer('CognitoAuthorizer', `https://cognito-idp.us-east-1.amazonaws.com/${props.userPoolId}`, {
      jwtAudience: [props.userPoolClientId]
    });

    this.api = new HttpApi(this, 'KVStorageApi', {
      defaultDomainMapping: {
        domainName: customDomain
      },
      apiName: 'KV Storage API',
      description: 'Serverless key-value storage API',
      corsPreflight: {
        allowOrigins: [
          `https://kv.${baseDomain}`,
          `https://dashboard.kv.${baseDomain}`
        ],
        allowMethods: [CorsHttpMethod.ANY],
        allowHeaders: ['Content-Type', 'Authorization', 'x-api-key']
      }
    });

    this.api.addRoutes({
      path: '/v1/auth/signup',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('SignupIntegration', props.signup)
    });

    this.api.addRoutes({
      path: '/v1/auth/login',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('LoginIntegration', props.login)
    });
    
    this.api.addRoutes({
      path: '/v1/api-keys',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('GenerateApiKeyIntegration', props.generateApiKey),
      authorizer: jwtAuthorizer
    });

    this.api.addRoutes({
      path: '/v1/api-keys',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('GetApiKeyIntegration', props.getApiKey),
      authorizer: jwtAuthorizer
    });

    this.api.addRoutes({
      path: '/v1/usage',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('GetUsageIntegration', props.getUsage),
      authorizer: jwtAuthorizer
    });
    
    this.api.addRoutes({
      path: '/v1/webhooks/paddle',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('PaddleWebhookIntegration', props.paddleWebhook)
    });
    
    this.api.addRoutes({
      path: '/v1/namespaces',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('CreateNamespaceIntegration', props.createNamespace),
      authorizer: jwtAuthorizer
    });

    this.api.addRoutes({
      path: '/v1/namespaces',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('ListNamespacesIntegration', props.listNamespaces),
      authorizer: jwtAuthorizer
    });
    
    this.api.addRoutes({
      path: '/v1/{namespace}',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('ListKeysIntegration', props.listKeys)
    });
    
    this.api.addRoutes({
      path: '/v1/{namespace}/{key}',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('GetValueIntegration', props.getValue)
    });

    this.api.addRoutes({
      path: '/v1/{namespace}/{key}',
      methods: [HttpMethod.PUT],
      integration: new HttpLambdaIntegration('PutValueIntegration', props.putValue)
    });

    this.api.addRoutes({
      path: '/v1/{namespace}/{key}',
      methods: [HttpMethod.DELETE],
      integration: new HttpLambdaIntegration('DeleteValueIntegration', props.deleteValue)
    });

    new ARecord(this, 'ApiAliasRecord', {
      zone: hostedZone,
      recordName: apiDomainName,
      target: RecordTarget.fromAlias(new ApiGatewayv2DomainProperties(
        customDomain.regionalDomainName,
        customDomain.regionalHostedZoneId
      ))
    });

    new CfnOutput(this, 'ApiUrl', {
      value: this.api.apiEndpoint,
      description: 'API Gateway URL'
    });

    new CfnOutput(this, 'CustomDomainUrl', {
      value: `https://${apiDomainName}`,
      description: 'Custom Domain URL'
    });
  }
}
