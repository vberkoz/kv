import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse } from '../lambdas/shared/response';
import { ValidationError } from '../lambdas/shared/errors';

describe('Response utilities', () => {
  describe('successResponse', () => {
    it('returns success response with data', () => {
      const response = successResponse({ value: 'test' }, 200, 'corr-123');
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ value: 'test' });
      expect(response.headers?.['x-correlation-id']).toBe('corr-123');
    });

    it('includes rate limit headers', () => {
      const rateLimitHeaders = {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99'
      };
      const response = successResponse({ value: 'test' }, 200, 'corr-123', rateLimitHeaders);
      expect(response.headers?.['X-RateLimit-Limit']).toBe('100');
      expect(response.headers?.['X-RateLimit-Remaining']).toBe('99');
    });
  });

  describe('errorResponse', () => {
    it('returns error response with message', () => {
      const response = errorResponse('Not found', 404, 'corr-123');
      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Not found');
      expect(body.statusCode).toBe(404);
    });

    it('handles AppError instances', () => {
      const error = new ValidationError('Invalid input');
      const response = errorResponse(error, error.statusCode, 'corr-123');
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Invalid input');
      expect(body.code).toBe('VALIDATION_ERROR');
    });
  });
});
