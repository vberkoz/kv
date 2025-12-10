import { App } from 'aws-cdk-lib';
import { DatabaseStack } from './stacks/database-stack';
import { LambdaStack } from './stacks/lambda-stack';
import { ApiStack } from './stacks/api-stack';
import { FrontendStack } from './stacks/frontend-stack';
import { MonitoringStack } from './stacks/monitoring-stack';

const app = new App();

const databaseStack = new DatabaseStack(app, 'KVDatabaseStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

const lambdaStack = new LambdaStack(app, 'KVLambdaStack', {
  table: databaseStack.table,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

const apiStack = new ApiStack(app, 'KVApiStack', {
  getValue: lambdaStack.getValue,
  putValue: lambdaStack.putValue,
  deleteValue: lambdaStack.deleteValue,
  createNamespace: lambdaStack.createNamespace,
  listNamespaces: lambdaStack.listNamespaces,
  listKeys: lambdaStack.listKeys,
  signup: lambdaStack.signup,
  login: lambdaStack.login,
  generateApiKey: lambdaStack.generateApiKey,
  getUsage: lambdaStack.getUsage,
  paddleWebhook: lambdaStack.paddleWebhook,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

lambdaStack.addDependency(databaseStack);
apiStack.addDependency(lambdaStack);

const frontendStack = new FrontendStack(app, 'KVFrontendStack', {
  api: apiStack.api,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

frontendStack.addDependency(apiStack);

const monitoringStack = new MonitoringStack(app, 'KVMonitoringStack', {
  api: apiStack.api,
  getValue: lambdaStack.getValue,
  putValue: lambdaStack.putValue,
  deleteValue: lambdaStack.deleteValue,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

monitoringStack.addDependency(apiStack);

app.synth();
