import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Initialize client outside handler for connection reuse
const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
export const TABLE_NAME = process.env.TABLE_NAME!;
export const GSI_NAME = process.env.GSI_NAME!;
