import { Logger } from '@aws-lambda-powertools/logger';
import { randomUUID } from 'crypto';

export const logger = new Logger({
  serviceName: 'kv-storage',
  logLevel: (process.env.LOG_LEVEL as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR') || 'INFO',
  persistentLogAttributes: {
    environment: process.env.STAGE || 'dev'
  }
});

export function generateCorrelationId(): string {
  return randomUUID();
}

export function addCorrelationId(event: any): string {
  const correlationId = event.headers?.['x-correlation-id'] || generateCorrelationId();
  logger.appendKeys({ correlationId });
  return correlationId;
}

export function logRequest(operation: string, metadata: Record<string, any>) {
  logger.info('Request received', { operation, ...metadata });
}

export function logResponse(operation: string, statusCode: number, metadata?: Record<string, any>) {
  logger.info('Response sent', { operation, statusCode, ...metadata });
}
