import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { HttpApi, HttpMethod, CorsHttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

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
  getUsage: NodejsFunction;
  paddleWebhook: NodejsFunction;
}

export class ApiStack extends Stack {
  public readonly api: HttpApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.api = new HttpApi(this, 'KVStorageApi', {
      apiName: 'KV Storage API',
      description: 'Serverless key-value storage API',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.ANY],
        allowHeaders: ['Content-Type', 'Authorization']
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
      integration: new HttpLambdaIntegration('GenerateApiKeyIntegration', props.generateApiKey)
    });

    this.api.addRoutes({
      path: '/v1/usage',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('GetUsageIntegration', props.getUsage)
    });
    
    this.api.addRoutes({
      path: '/v1/webhooks/paddle',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('PaddleWebhookIntegration', props.paddleWebhook)
    });
    
    this.api.addRoutes({
      path: '/v1/namespaces',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('CreateNamespaceIntegration', props.createNamespace)
    });

    this.api.addRoutes({
      path: '/v1/namespaces',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('ListNamespacesIntegration', props.listNamespaces)
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

    new CfnOutput(this, 'ApiUrl', {
      value: this.api.apiEndpoint,
      description: 'API Gateway URL'
    });
  }
}
