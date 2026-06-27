import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

import { PrismaClient } from '@/generated/prisma';

/**
 * Prisma client singleton — Neon serverless (WebSocket) driver.
 *
 * Routes all database traffic through Neon's WebSocket endpoint (wss, port
 * 443) instead of a raw PostgreSQL socket (port 5432). This makes local dev
 * work on networks that block outbound 5432, and is equivalent in production.
 *
 * The dev hot-reload singleton below prevents exhausting the connection pool
 * by reusing one instance across module reloads.
 */

// Neon's serverless driver needs a WebSocket implementation in Node. The `ws`
// package is what Neon recommends; Node's global undici WebSocket is not
// compatible with Neon's connection handshake.
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
