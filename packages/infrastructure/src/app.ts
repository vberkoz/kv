import { App } from 'aws-cdk-lib';
import { DatabaseStack } from './stacks/database-stack';
import { LambdaStack } from './stacks/lambda-stack';

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

lambdaStack.addDependency(databaseStack);

app.synth();
