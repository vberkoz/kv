import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

interface LambdaStackProps extends StackProps {
  table: Table;
  userPoolId: string;
  userPoolClientId: string;
}

export class LambdaStack extends Stack {
  public readonly getValue: NodejsFunction;
  public readonly putValue: NodejsFunction;
  public readonly deleteValue: NodejsFunction;
  public readonly createNamespace: NodejsFunction;
  public readonly listNamespaces: NodejsFunction;
  public readonly listKeys: NodejsFunction;
  public readonly signup: NodejsFunction;
  public readonly login: NodejsFunction;
  public readonly generateApiKey: NodejsFunction;
  public readonly getUsage: NodejsFunction;
  public readonly paddleWebhook: NodejsFunction;
  public readonly resetUsage: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const environment = {
      TABLE_NAME: props.table.tableName,
      GSI_NAME: 'GSI1',
      NODE_ENV: 'production',
      JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      PADDLE_WEBHOOK_SECRET: process.env.PADDLE_WEBHOOK_SECRET || '',
      USER_POOL_ID: props.userPoolId,
      USER_POOL_CLIENT_ID: props.userPoolClientId
    };

    const bundling = { externalModules: ['@aws-sdk/*'] };

    this.getValue = new NodejsFunction(this, 'GetValueFunction', {
      entry: 'src/lambdas/get-value.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling
    });

    this.putValue = new NodejsFunction(this, 'PutValueFunction', {
      entry: 'src/lambdas/put-value.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling
    });

    this.deleteValue = new NodejsFunction(this, 'DeleteValueFunction', {
      entry: 'src/lambdas/delete-value.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling
    });

    this.createNamespace = new NodejsFunction(this, 'CreateNamespaceFunction', {
      entry: 'src/lambdas/create-namespace.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling
    });

    this.listNamespaces = new NodejsFunction(this, 'ListNamespacesFunction', {
      entry: 'src/lambdas/list-namespaces.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling
    });

    this.listKeys = new NodejsFunction(this, 'ListKeysFunction', {
      entry: 'src/lambdas/list-keys.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling
    });

    this.signup = new NodejsFunction(this, 'SignupFunction', {
      entry: 'src/lambdas/signup.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling
    });

    this.login = new NodejsFunction(this, 'LoginFunction', {
      entry: 'src/lambdas/login.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling
    });

    this.generateApiKey = new NodejsFunction(this, 'GenerateApiKeyFunction', {
      entry: 'src/lambdas/generate-api-key.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling
    });

    this.getUsage = new NodejsFunction(this, 'GetUsageFunction', {
      entry: 'src/lambdas/get-usage.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling
    });

    props.table.grantReadWriteData(this.getValue);
    props.table.grantReadWriteData(this.putValue);
    props.table.grantReadWriteData(this.deleteValue);
    props.table.grantReadWriteData(this.createNamespace);
    props.table.grantReadWriteData(this.listNamespaces);
    props.table.grantReadData(this.listKeys);
    props.table.grantReadWriteData(this.signup);
    props.table.grantReadData(this.login);
    props.table.grantReadWriteData(this.generateApiKey);
    props.table.grantReadData(this.getUsage);

    this.paddleWebhook = new NodejsFunction(this, 'PaddleWebhookFunction', {
      entry: 'src/lambdas/paddle-webhook.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment,
      bundling
    });

    props.table.grantReadWriteData(this.paddleWebhook);

    this.resetUsage = new NodejsFunction(this, 'ResetUsageFunction', {
      entry: 'src/lambdas/reset-usage.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.minutes(5),
      environment,
      bundling
    });

    props.table.grantReadWriteData(this.resetUsage);

    this.getValue.addToRolePolicy(new PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: ['*']
    }));
    this.putValue.addToRolePolicy(new PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: ['*']
    }));
    this.deleteValue.addToRolePolicy(new PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: ['*']
    }));

    const resetRule = new Rule(this, 'MonthlyResetRule', {
      schedule: Schedule.cron({ day: '1', hour: '0', minute: '0' })
    });
    resetRule.addTarget(new LambdaFunction(this.resetUsage));
  }
}
