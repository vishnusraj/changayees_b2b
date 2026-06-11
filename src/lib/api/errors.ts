/**
 * Error-code catalog + typed application error (architecture §3.4).
 * Throw an ApiError anywhere in the service/handler layer; `withApi` maps it to
 * the standard error envelope with the right HTTP status.
 */

export const ErrorCode = {
  VALIDATION: 'VALIDATION',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL: 'INTERNAL',
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface FieldError {
  field?: string;
  message: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCodeValue;
  readonly errors?: FieldError[];

  constructor(
    status: number,
    code: ErrorCodeValue,
    message: string,
    errors?: FieldError[],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }

  static validation(message = 'Validation failed', errors?: FieldError[]) {
    return new ApiError(422, ErrorCode.VALIDATION, message, errors);
  }
  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, ErrorCode.UNAUTHORIZED, message);
  }
  static invalidCredentials(message = 'Invalid email or password') {
    return new ApiError(401, ErrorCode.INVALID_CREDENTIALS, message);
  }
  static forbidden(message = 'You do not have access to this resource') {
    return new ApiError(403, ErrorCode.FORBIDDEN, message);
  }
  static notFound(message = 'Resource not found') {
    return new ApiError(404, ErrorCode.NOT_FOUND, message);
  }
  static conflict(message = 'Resource already exists') {
    return new ApiError(409, ErrorCode.CONFLICT, message);
  }
  static rateLimited(message = 'Too many requests') {
    return new ApiError(429, ErrorCode.RATE_LIMITED, message);
  }
  static internal(message = 'Something went wrong') {
    return new ApiError(500, ErrorCode.INTERNAL, message);
  }
}
