import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table, AttributeType, BillingMode, ProjectionType, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';

export class DatabaseStack extends Stack {
  public readonly table: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const tableName = this.node.tryGetContext('tableName') || 'kv-storage-data';
    const gsiName = this.node.tryGetContext('gsiName') || 'GSI1';

    this.table = new Table(this, 'KVStorageTable', {
      tableName,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.RETAIN,
      encryption: TableEncryption.AWS_MANAGED
    });

    this.table.addGlobalSecondaryIndex({
      indexName: gsiName,
      partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL
    });
  }
}
