import { describe, it, expect } from 'vitest';
import { 
  ValidationError, 
  UnauthorizedError, 
  NotFoundError, 
  RateLimitError 
} from '../lambdas/shared/errors';

describe('Error classes', () => {
  it('ValidationError has correct properties', () => {
    const error = new ValidationError('Invalid input', { field: 'name' });
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Invalid input');
    expect(error.metadata).toEqual({ field: 'name' });
  });

  it('UnauthorizedError has correct properties', () => {
    const error = new UnauthorizedError('Invalid token');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('NotFoundError has correct properties', () => {
    const error = new NotFoundError('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('RateLimitError has correct properties', () => {
    const error = new RateLimitError('Rate limit exceeded');
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});
