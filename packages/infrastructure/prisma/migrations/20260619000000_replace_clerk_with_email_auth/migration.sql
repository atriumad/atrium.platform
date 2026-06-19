-- Migration: replace Clerk auth with email/password auth
-- Drop clerkUserId, add email + passwordHash + emailVerifiedAt + createdAt

ALTER TABLE "users" DROP COLUMN IF EXISTS "clerkUserId";

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Remove the temporary default after adding the column
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP DEFAULT;

-- email must be unique and not null (set placeholder for existing rows first)
UPDATE "users" SET "email" = 'placeholder_' || id || '@atrium.internal' WHERE "email" IS NULL;
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
