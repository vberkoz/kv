import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RestApi, LambdaIntegration, Cors } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

interface ApiStackProps extends StackProps {
  getValue: NodejsFunction;
  putValue: NodejsFunction;
  deleteValue: NodejsFunction;
  createNamespace: NodejsFunction;
  listNamespaces: NodejsFunction;
  listKeys: NodejsFunction;
}

export class ApiStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.api = new RestApi(this, 'KVStorageApi', {
      restApiName: 'KV Storage API',
      description: 'Serverless key-value storage API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    const v1 = this.api.root.addResource('v1');
    
    const namespaces = v1.addResource('namespaces');
    namespaces.addMethod('POST', new LambdaIntegration(props.createNamespace));
    namespaces.addMethod('GET', new LambdaIntegration(props.listNamespaces));
    
    const namespace = v1.addResource('{namespace}');
    namespace.addMethod('GET', new LambdaIntegration(props.listKeys));
    
    const key = namespace.addResource('{key}');
    key.addMethod('GET', new LambdaIntegration(props.getValue));
    key.addMethod('PUT', new LambdaIntegration(props.putValue));
    key.addMethod('DELETE', new LambdaIntegration(props.deleteValue));

    new CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL'
    });
  }
}
