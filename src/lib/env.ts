import { z } from 'zod';

/**
 * Validated, typed environment access.
 * Only variables required by the current foundation are enforced; others are
 * optional until their subsystem is wired up (see .env.example for the full set).
 *
 * Server-only — do not import into client components. Client-safe values must be
 * prefixed `NEXT_PUBLIC_` and read directly from `process.env`.
 */
const serverSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

const parsedServer = serverSchema.safeParse(process.env);
if (!parsedServer.success) {
  // Fail fast with a readable message rather than a cryptic runtime error.
  const issues = parsedServer.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`Invalid server environment variables:\n${issues}`);
}

const parsedClient = clientSchema.safeParse(process.env);
if (!parsedClient.success) {
  const issues = parsedClient.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`Invalid client environment variables:\n${issues}`);
}

export const env = {
  ...parsedServer.data,
  ...parsedClient.data,
};
