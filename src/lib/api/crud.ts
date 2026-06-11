/**
 * Generic CRUD route factory for CMS content modules. Each module supplies a
 * service implementing CrudService + zod schemas + RBAC permissions; the factory
 * produces the standard collection (GET list / POST create) and item
 * (GET / PUT / DELETE) handlers.
 */
import { type NextRequest } from 'next/server';
import { type z } from 'zod';
import { withApi, withApiParams } from './route';
import { ok, okWithMeta, created, message } from './response';
import { ApiError } from './errors';
import { readJson } from './request';
import { authorize } from './guards';

export interface CrudPermissions {
  view: string;
  create: string;
  update: string;
  remove: string;
}

export interface CrudListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CrudListParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

export interface CrudService<TList, TDetail> {
  list(params: CrudListParams): Promise<CrudListResult<TList>>;
  get(id: string): Promise<TDetail | null>;
  create(input: unknown, actorId: string): Promise<{ id: string }>;
  update(id: string, input: unknown, actorId: string): Promise<TDetail | null>;
  remove(id: string, actorId: string): Promise<boolean>;
}

export function makeCollectionRoutes<TL, TD>(opts: {
  service: CrudService<TL, TD>;
  perms: CrudPermissions;
  createSchema: z.ZodTypeAny;
}) {
  const GET = withApi(async (req: NextRequest) => {
    await authorize(req, opts.perms.view);
    const sp = new URL(req.url).searchParams;
    const res = await opts.service.list({
      page: Number(sp.get('page') ?? 1) || 1,
      limit: Number(sp.get('limit') ?? 20) || 20,
      search: sp.get('search') ?? undefined,
      status: sp.get('status') ?? undefined,
    });
    return okWithMeta(res.items, {
      page: res.page,
      limit: res.limit,
      total: res.total,
      totalPages: res.totalPages,
    });
  });

  const POST = withApi(async (req: NextRequest) => {
    const auth = await authorize(req, opts.perms.create);
    const body = opts.createSchema.parse(await readJson(req));
    const result = await opts.service.create(body, auth.userId);
    return created(result, 'Created');
  });

  return { GET, POST };
}

export function makeItemRoutes<TL, TD>(opts: {
  service: CrudService<TL, TD>;
  perms: CrudPermissions;
  updateSchema: z.ZodTypeAny;
}) {
  const GET = withApiParams<{ id: string }>(async (req, { id }) => {
    await authorize(req, opts.perms.view);
    const detail = await opts.service.get(id);
    if (!detail) throw ApiError.notFound();
    return ok(detail);
  });

  const PUT = withApiParams<{ id: string }>(async (req, { id }) => {
    const auth = await authorize(req, opts.perms.update);
    const body = opts.updateSchema.parse(await readJson(req));
    const detail = await opts.service.update(id, body, auth.userId);
    if (!detail) throw ApiError.notFound();
    return ok(detail, 'Updated');
  });

  const DELETE = withApiParams<{ id: string }>(async (req, { id }) => {
    const auth = await authorize(req, opts.perms.remove);
    const removed = await opts.service.remove(id, auth.userId);
    if (!removed) throw ApiError.notFound();
    return message('Deleted');
  });

  return { GET, PUT, DELETE };
}
