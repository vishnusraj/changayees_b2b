/**
 * Shared application types.
 * Domain-specific types live alongside their feature in `src/features/*`.
 */

/** Standard API success/error envelope (see architecture §3.2). */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  errorCode: string;
  errors?: { field?: string; message: string }[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Navigation item used by header and bottom nav. */
export interface NavItem {
  label: string;
  href: string;
}
