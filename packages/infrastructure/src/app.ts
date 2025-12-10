import { App } from 'aws-cdk-lib';
import { DatabaseStack } from './stacks/database-stack';

const app = new App();

new DatabaseStack(app, 'KVDatabaseStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

app.synth();
