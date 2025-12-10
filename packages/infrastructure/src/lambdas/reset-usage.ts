import { ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';

export async function handler() {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 2);
    const oldMonth = lastMonth.toISOString().slice(0, 7);

    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(SK, :usage) AND SK < :oldMonth',
      ExpressionAttributeValues: {
        ':usage': 'USAGE#',
        ':oldMonth': `USAGE#${oldMonth}`
      }
    }));

    if (result.Items) {
      for (const item of result.Items) {
        await docClient.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: item.PK, SK: item.SK }
        }));
      }
    }

    return { statusCode: 200, body: JSON.stringify({ deleted: result.Items?.length || 0 }) };
  } catch (error: any) {
    console.error('Reset usage error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}
