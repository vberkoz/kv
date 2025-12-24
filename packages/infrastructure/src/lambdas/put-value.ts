import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './shared/dynamodb';
import { successResponse } from './shared/response';
import { namespaceSchema, keySchema, putValueSchema, validate } from './shared/validation';
import { ValidationError } from './shared/errors';
import { createDualAuthHandler } from './shared/middleware';

const baseHandler = async (event: any, context: any) => {
  const { namespace, key } = event.pathParameters || {};
  const headers = event.headers || {};
  
  const nsValidation = validate(namespaceSchema, namespace);
  if (!nsValidation.success) {
    throw new ValidationError(nsValidation.error);
  }
  
  const keyValidation = validate(keySchema, key);
  if (!keyValidation.success) {
    throw new ValidationError(keyValidation.error);
  }

  const bodyValidation = validate(putValueSchema, event.body);
  if (!bodyValidation.success) {
    throw new ValidationError(bodyValidation.error);
  }
  
  const now = new Date().toISOString();

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `NS#${namespace}`,
      SK: `KEY#${key}`,
      GSI1PK: `NS#${namespace}`,
      GSI1SK: `KEY#${key}`,
      entityType: 'KEY',
      value: event.body.value,
      createdAt: now,
      updatedAt: now
    }
  }));

  const correlationId = headers['x-correlation-id'];
  const origin = headers.origin || headers.Origin;
  const rateLimitHeaders = (context as any).rateLimitHeaders || {};
  return successResponse({ message: 'Value stored successfully' }, 201, correlationId, rateLimitHeaders, origin);
};

export const handler = createDualAuthHandler(baseHandler);
