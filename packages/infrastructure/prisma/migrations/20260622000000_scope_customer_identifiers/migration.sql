-- Scope customer identifiers by tenant and provider.
-- This prevents one restaurant from claiming identifiers owned by another tenant
-- and lets different external providers reuse the same external reference value.

DROP INDEX IF EXISTS "customer_identifiers_type_value_key";

ALTER TABLE "customer_identifiers" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

UPDATE "customer_identifiers" ci
SET "tenantId" = c."tenantId"
FROM "customers" c
WHERE ci."customerId" = c."id"
  AND ci."tenantId" IS NULL;

ALTER TABLE "customer_identifiers" ALTER COLUMN "tenantId" SET NOT NULL;

UPDATE "customer_identifiers"
SET "provider" = ''
WHERE "provider" IS NULL;

ALTER TABLE "customer_identifiers" ALTER COLUMN "provider" SET NOT NULL;
ALTER TABLE "customer_identifiers" ALTER COLUMN "provider" SET DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS "customer_identifiers_tenantId_type_provider_value_key"
ON "customer_identifiers"("tenantId", "type", "provider", "value");

CREATE INDEX IF NOT EXISTS "customer_identifiers_tenantId_idx"
ON "customer_identifiers"("tenantId");
