import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

interface LambdaStackProps extends StackProps {
  table: Table;
}

export class LambdaStack extends Stack {
  public readonly getValue: NodejsFunction;
  public readonly putValue: NodejsFunction;
  public readonly deleteValue: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const environment = {
      TABLE_NAME: props.table.tableName,
      GSI_NAME: 'GSI1',
      NODE_ENV: 'production'
    };

    this.getValue = new NodejsFunction(this, 'GetValueFunction', {
      entry: 'src/lambdas/get-value.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling: {
        externalModules: ['@aws-sdk/*']
      }
    });

    this.putValue = new NodejsFunction(this, 'PutValueFunction', {
      entry: 'src/lambdas/put-value.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling: {
        externalModules: ['@aws-sdk/*']
      }
    });

    this.deleteValue = new NodejsFunction(this, 'DeleteValueFunction', {
      entry: 'src/lambdas/delete-value.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling: {
        externalModules: ['@aws-sdk/*']
      }
    });

    props.table.grantReadWriteData(this.getValue);
    props.table.grantReadWriteData(this.putValue);
    props.table.grantReadWriteData(this.deleteValue);
  }
}
