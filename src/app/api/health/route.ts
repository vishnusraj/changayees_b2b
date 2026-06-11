import { NextResponse } from 'next/server';

/**
 * Liveness probe (architecture §9.4). Extended later to check DB / Redis / S3.
 * GET /api/health
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    success: true,
    message: 'ok',
    data: {
      status: 'healthy',
      service: 'changayees-web',
      timestamp: new Date().toISOString(),
    },
  });
}
