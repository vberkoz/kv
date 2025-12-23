import { APIResponse } from '@kv/shared';
import { AppError } from './errors';
import { logger } from './logger';

const ALLOWED_ORIGINS = ['https://kv.vberkoz.com', 'https://dashboard.kv.vberkoz.com'];

function getCorsHeaders(origin?: string): Record<string, string> {
  const validOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': validOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  };
}

export function successResponse(data: any, statusCode = 200, correlationId?: string, rateLimitHeaders?: Record<string, string>, origin?: string): APIResponse {
  return {
    statusCode,
    headers: { 
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin),
      ...(correlationId && { 'x-correlation-id': correlationId }),
      ...(rateLimitHeaders || {})
    },
    body: JSON.stringify(data)
  };
}

export function errorResponse(error: string | AppError, statusCode = 400, correlationId?: string, origin?: string): APIResponse {
  const isAppError = error instanceof AppError;
  const message = isAppError ? error.message : error;
  const code = isAppError ? error.code : undefined;
  const status = isAppError ? error.statusCode : statusCode;

  logger.error('Error response', {
    statusCode: status,
    error: message,
    code,
    ...(isAppError && error.metadata)
  });

  return {
    statusCode: status,
    headers: { 
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin),
      ...(correlationId && { 'x-correlation-id': correlationId }),
      ...(status === 429 && { 'Retry-After': '3600' })
    },
    body: JSON.stringify({ 
      error: message, 
      statusCode: status,
      ...(code && { code }),
      ...(correlationId && { correlationId })
    })
  };
}
