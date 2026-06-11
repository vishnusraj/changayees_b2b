/**
 * Thin client-side fetch helper for the admin portal. Same-origin requests send
 * the httpOnly auth cookie automatically. Throws on non-2xx / envelope failure.
 */
export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiEnvelope<T>> {
  const res = await fetch(`/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new Error('Unexpected server response');
  }
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? 'Request failed');
  }
  return json;
}

export const apiGet = <T>(path: string) => apiRequest<T>(path);

export const apiSend = <T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
) =>
  apiRequest<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
