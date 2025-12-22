import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });
import { App } from 'aws-cdk-lib';
import { DatabaseStack } from './stacks/database-stack';
import { LambdaStack } from './stacks/lambda-stack';
import { ApiStack } from './stacks/api-stack';
import { LandingStack, DashboardStack } from './stacks/frontend-stack';
import { MonitoringStack } from './stacks/monitoring-stack';
import { AuthStack } from './stacks/auth-stack';

const app = new App();

const domainName = process.env.DOMAIN_NAME || 'kv.vberkoz.com';

const authStack = new AuthStack(app, 'KVAuthStack', {
  baseDomain: domainName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

const databaseStack = new DatabaseStack(app, 'KVDatabaseStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

const lambdaStack = new LambdaStack(app, 'KVLambdaStack', {
  table: databaseStack.table,
  userPoolId: authStack.userPool.userPoolId,
  userPoolClientId: authStack.userPoolClient.userPoolClientId,
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
  getApiKey: lambdaStack.getApiKey,
  getUsage: lambdaStack.getUsage,
  paddleWebhook: lambdaStack.paddleWebhook,
  userPoolId: authStack.userPool.userPoolId,
  userPoolClientId: authStack.userPoolClient.userPoolClientId,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

lambdaStack.addDependency(databaseStack);
apiStack.addDependency(lambdaStack);

const landingStack = new LandingStack(app, 'KVLandingStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

const dashboardStack = new DashboardStack(app, 'KVDashboardStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

landingStack.addDependency(apiStack);
dashboardStack.addDependency(apiStack);

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
