/**
 * Standard API response envelope (architecture §3.2).
 *   Success: { success, message, data, meta? }
 *   Error:   { success, message, errorCode, errors? }
 */
import { NextResponse } from 'next/server';
import type { PaginationMeta } from '@/types';

export function ok<T>(
  data: T,
  message = 'Request completed',
  init?: ResponseInit,
): NextResponse {
  return NextResponse.json({ success: true, message, data }, init);
}

export function okWithMeta<T>(
  data: T,
  meta: PaginationMeta,
  message = 'Request completed',
): NextResponse {
  return NextResponse.json({ success: true, message, data, meta });
}

export function created<T>(data: T, message = 'Created'): NextResponse {
  return NextResponse.json({ success: true, message, data }, { status: 201 });
}

export function message(text: string): NextResponse {
  return NextResponse.json({ success: true, message: text, data: null });
}
