export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', metadata);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', metadata?: Record<string, any>) {
    super(message, 401, 'UNAUTHORIZED', metadata);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', metadata?: Record<string, any>) {
    super(message, 403, 'FORBIDDEN', metadata);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', metadata?: Record<string, any>) {
    super(message, 404, 'NOT_FOUND', metadata);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', metadata?: Record<string, any>) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', metadata);
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error', metadata?: Record<string, any>) {
    super(message, 500, 'INTERNAL_ERROR', metadata);
  }
}
