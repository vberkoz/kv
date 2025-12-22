import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse } from './shared/response';
import { ValidationError } from './shared/errors';
import { createApiKeyHandler } from './shared/middleware';

const baseHandler = async (event: any, context: any) => {
  const { namespace, key } = event.pathParameters || {};
  
  if (!namespace || !key) {
    throw new ValidationError('Missing namespace or key');
  }

  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `NS#${namespace}`,
      SK: `KEY#${key}`
    }
  }));

  const correlationId = event.headers['x-correlation-id'];
  return successResponse({ message: 'Value deleted successfully' }, 204, correlationId);
};

export const handler = createApiKeyHandler(baseHandler);
