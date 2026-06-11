-- Full-text search for product discovery (architecture D-13).
-- Prisma's schema DSL cannot express a GENERATED tsvector column, so the column
-- definition is applied here as raw SQL. The column + GIN index are registered
-- in schema.prisma (Product.searchVector + @@index(type: Gin)) so Prisma stays
-- in sync and never attempts to drop these DB-managed objects.
-- The search service queries "search_vector" via raw SQL (to_tsquery / websearch).

-- 1. Generated tsvector column derived from the most relevant product fields,
--    weighted A (most relevant) -> D (least).
ALTER TABLE "products"
  ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("product_code", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("short_description", '')), 'B') ||
    setweight(to_tsvector('english', coalesce("fabric_type", '')), 'C') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'D')
  ) STORED;

-- 2. GIN index for fast full-text lookups. Name matches Prisma's default for
--    @@index([searchVector], type: Gin) so the schema and DB agree (no drift).
CREATE INDEX "products_search_vector_idx"
  ON "products" USING GIN ("search_vector");
