/**
 * Route handler wrapper. Wrap every `/api/v1/*` handler with `withApi` so that
 * thrown ApiErrors, Zod validation errors, and unexpected errors are all mapped
 * to the standard error envelope with the correct status code.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { ApiError, ErrorCode } from './errors';

type Handler = (req: NextRequest) => Promise<NextResponse> | NextResponse;

/**
 * Wrap a route handler so thrown ApiErrors / ZodErrors / unexpected errors map
 * to the standard error envelope. For dynamic routes that need `params`, add a
 * dedicated params-aware variant; current endpoints do not use route params.
 */
export function withApi(handler: Handler) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

type ParamsHandler<P extends Record<string, string>> = (
  req: NextRequest,
  params: P,
) => Promise<NextResponse> | NextResponse;

/**
 * Variant of `withApi` for dynamic routes — resolves and passes route params
 * (Next 15 delivers them as a Promise).
 */
export function withApiParams<P extends Record<string, string>>(
  handler: ParamsHandler<P>,
) {
  return async (req: NextRequest, context: { params: Promise<P> }) => {
    try {
      const params = await context.params;
      return await handler(req, params);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        errorCode: error.code,
        ...(error.errors ? { errors: error.errors } : {}),
      },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: 'Validation failed',
        errorCode: ErrorCode.VALIDATION,
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.') || undefined,
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  // Unknown / unexpected — log for observability, never leak internals.
  console.error('[api] unhandled error:', error);
  return NextResponse.json(
    {
      success: false,
      message: 'Something went wrong',
      errorCode: ErrorCode.INTERNAL,
    },
    { status: 500 },
  );
}
