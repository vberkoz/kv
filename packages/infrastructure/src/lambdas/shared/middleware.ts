import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { logger, addCorrelationId, logRequest, logResponse } from './logger';
import { validateApiKey } from './auth';
import { AppError } from './errors';
import { APIGatewayEvent } from '@kv/shared';

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
    const event = request.event as APIGatewayEvent;
    const apiKey = event.headers['x-api-key'];
    if (!apiKey) {
      throw new AppError('Missing API key', 401, 'UNAUTHORIZED');
    }
    const user = await validateApiKey(apiKey);
    (request.context as any).user = user;
    (request.context as any).rateLimitHeaders = user.rateLimitHeaders;
  }
});

export const errorHandlerMiddleware = (): middy.MiddlewareObj => ({
  onError: async (request) => {
    const error = request.error;
    const event = request.event as APIGatewayEvent;
    const correlationId = event.headers['x-correlation-id'];
    
    if (error instanceof AppError) {
      const rateLimitHeaders = (error as any).rateLimitHeaders || {};
      request.response = {
        statusCode: error.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
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
          'Access-Control-Allow-Origin': '*',
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
