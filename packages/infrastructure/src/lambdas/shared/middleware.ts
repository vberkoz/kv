import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { logger, addCorrelationId, logRequest, logResponse } from './logger';
import { validateApiKey, validateToken } from './auth';
import { AppError } from './errors';
import { APIGatewayEvent } from '@kv/shared';

const ALLOWED_ORIGINS = ['https://kv.vberkoz.com', 'https://dashboard.kv.vberkoz.com'];

function getCorsHeaders(origin?: string): Record<string, string> {
  const validOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': validOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  };
}

export const loggingMiddleware = (): middy.MiddlewareObj => ({
  before: async (request) => {
    const event = request.event as APIGatewayEvent;
    addCorrelationId(event);
    const { pathParameters, queryStringParameters } = event;
    logRequest(request.context.functionName, { pathParameters, queryStringParameters });
  },
  after: async (request) => {
    logResponse(request.context.functionName, request.response?.statusCode || 200);
  },
  onError: async (request) => {
    const error = request.error;
    if (error instanceof AppError) {
      logResponse(request.context.functionName, error.statusCode, { error: error.message });
    } else {
      logger.error('Unexpected error', { error });
      logResponse(request.context.functionName, 500);
    }
  }
});

export const apiKeyAuthMiddleware = (): middy.MiddlewareObj => ({
  before: async (request) => {
    try {
      const event = request.event as any;
      // API Gateway HTTP API (v2) format
      const headers = event.headers || {};
      const apiKey = headers['x-api-key'];
      if (!apiKey) {
        throw new AppError('Missing API key', 401, 'UNAUTHORIZED');
      }
      const user = await validateApiKey(apiKey);
      (request.context as any).user = user;
      (request.context as any).rateLimitHeaders = user.rateLimitHeaders;
    } catch (error) {
      console.error('API key validation error:', error);
      throw error;
    }
  }
});

export const errorHandlerMiddleware = (): middy.MiddlewareObj => ({
  onError: async (request) => {
    const error = request.error;
    const event = request.event as any;
    const headers = event.headers || {};
    const correlationId = headers['x-correlation-id'];
    const origin = headers.origin || headers.Origin;
    
    if (error instanceof AppError) {
      const rateLimitHeaders = (error as any).rateLimitHeaders || {};
      request.response = {
        statusCode: error.statusCode,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin),
          ...(correlationId && { 'x-correlation-id': correlationId }),
          ...rateLimitHeaders
        },
        body: JSON.stringify({
          error: error.message,
          statusCode: error.statusCode,
          code: error.code,
          ...(correlationId && { correlationId })
        })
      };
    } else {
      request.response = {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin),
          ...(correlationId && { 'x-correlation-id': correlationId })
        },
        body: JSON.stringify({
          error: 'Internal server error',
          statusCode: 500,
          ...(correlationId && { correlationId })
        })
      };
    }
  },
  after: async (request) => {
    const rateLimitHeaders = (request.context as any).rateLimitHeaders || {};
    if (request.response && Object.keys(rateLimitHeaders).length > 0) {
      request.response.headers = {
        ...request.response.headers,
        ...rateLimitHeaders
      };
    }
  }
});

export const createHandler = (handler: any) => {
  return middy(handler)
    .use(httpJsonBodyParser())
    .use(loggingMiddleware())
    .use(errorHandlerMiddleware())
    .use(httpErrorHandler());
};

export const createApiKeyHandler = (handler: any) => {
  return middy(handler)
    .use(httpJsonBodyParser())
    .use(loggingMiddleware())
    .use(apiKeyAuthMiddleware())
    .use(errorHandlerMiddleware())
    .use(httpErrorHandler());
};

export const dualAuthMiddleware = (): middy.MiddlewareObj => ({
  before: async (request) => {
    try {
      const event = request.event as any;
      const headers = event.headers || {};
      console.log('Headers received:', JSON.stringify(headers));
      const apiKey = headers['x-api-key'];
      const authHeader = headers.authorization || headers.Authorization;
      
      // Try API key first
      if (apiKey) {
        const user = await validateApiKey(apiKey);
        (request.context as any).user = user;
        (request.context as any).rateLimitHeaders = user.rateLimitHeaders;
        return;
      }
      
      // Try JWT token
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const user = await validateToken(token);
        (request.context as any).user = user;
        return;
      }
      
      throw new AppError('Missing authentication', 401, 'UNAUTHORIZED');
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  }
});

export const createDualAuthHandler = (handler: any) => {
  return middy(handler)
    .use(httpJsonBodyParser())
    .use(loggingMiddleware())
    .use(dualAuthMiddleware())
    .use(errorHandlerMiddleware())
    .use(httpErrorHandler());
};
