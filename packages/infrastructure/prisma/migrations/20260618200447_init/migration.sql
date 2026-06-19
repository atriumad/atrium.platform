-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "loyaltyConfig" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "googlePlaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "customerId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "channel" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "itemsCount" INTEGER NOT NULL,
    "sourceRef" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "acquisitionSource" TEXT,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpentAmount" INTEGER NOT NULL DEFAULT 0,
    "totalSpentCurrency" TEXT NOT NULL DEFAULT 'USD',
    "avgTicketAmount" INTEGER NOT NULL DEFAULT 0,
    "visitFrequency" DOUBLE PRECISION,
    "preferredChannel" TEXT,
    "loyaltyTier" TEXT NOT NULL DEFAULT 'standard',
    "churnRisk" DOUBLE PRECISION,
    "churnRiskReason" TEXT,
    "churnRiskUpdatedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "notes" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_identifiers" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "provider" TEXT,

    CONSTRAINT "customer_identifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_activities" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_segments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rules" JSONB NOT NULL,

    CONSTRAINT "customer_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT,
    "reply" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "sentimentScore" DOUBLE PRECISION,
    "sourceRef" TEXT NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_snapshots" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "totalRevenue" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "orderCount" INTEGER NOT NULL,
    "avgTicket" INTEGER NOT NULL,

    CONSTRAINT "revenue_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_health" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "reputation" DOUBLE PRECISION NOT NULL,
    "traffic" DOUBLE PRECISION NOT NULL,
    "retention" DOUBLE PRECISION NOT NULL,
    "trend" TEXT NOT NULL,

    CONSTRAINT "location_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traffic_snapshots" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "sessions" INTEGER NOT NULL,
    "users" INTEGER NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "traffic_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyword_snapshots" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "keyword" TEXT NOT NULL,
    "position" DOUBLE PRECISION NOT NULL,
    "impressions" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,

    CONSTRAINT "keyword_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "promoCode" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "clerkUserId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector_credentials" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connector_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector_events" (
    "id" TEXT NOT NULL,
    "locationId" TEXT,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connector_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "orders_sourceRef_key" ON "orders"("sourceRef");

-- CreateIndex
CREATE INDEX "orders_locationId_occurredAt_idx" ON "orders"("locationId", "occurredAt");

-- CreateIndex
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");

-- CreateIndex
CREATE INDEX "customers_tenantId_idx" ON "customers"("tenantId");

-- CreateIndex
CREATE INDEX "customers_tenantId_loyaltyTier_idx" ON "customers"("tenantId", "loyaltyTier");

-- CreateIndex
CREATE INDEX "customers_tenantId_churnRisk_idx" ON "customers"("tenantId", "churnRisk");

-- CreateIndex
CREATE INDEX "customer_identifiers_customerId_idx" ON "customer_identifiers"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_identifiers_type_value_key" ON "customer_identifiers"("type", "value");

-- CreateIndex
CREATE INDEX "customer_activities_customerId_occurredAt_idx" ON "customer_activities"("customerId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "customer_segments_tenantId_name_key" ON "customer_segments"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_sourceRef_key" ON "reviews"("sourceRef");

-- CreateIndex
CREATE INDEX "reviews_locationId_publishedAt_idx" ON "reviews"("locationId", "publishedAt");

-- CreateIndex
CREATE INDEX "revenue_snapshots_locationId_periodType_periodStart_idx" ON "revenue_snapshots"("locationId", "periodType", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "revenue_snapshots_locationId_periodType_periodStart_key" ON "revenue_snapshots"("locationId", "periodType", "periodStart");

-- CreateIndex
CREATE INDEX "location_health_locationId_computedAt_idx" ON "location_health"("locationId", "computedAt");

-- CreateIndex
CREATE INDEX "traffic_snapshots_locationId_periodStart_idx" ON "traffic_snapshots"("locationId", "periodStart");

-- CreateIndex
CREATE INDEX "keyword_snapshots_locationId_capturedAt_idx" ON "keyword_snapshots"("locationId", "capturedAt");

-- CreateIndex
CREATE INDEX "alerts_tenantId_triggeredAt_idx" ON "alerts"("tenantId", "triggeredAt");

-- CreateIndex
CREATE INDEX "recommendations_tenantId_status_idx" ON "recommendations"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkUserId_key" ON "users"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "connector_credentials_locationId_provider_key" ON "connector_credentials"("locationId", "provider");

-- CreateIndex
CREATE INDEX "connector_events_locationId_provider_idx" ON "connector_events"("locationId", "provider");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_identifiers" ADD CONSTRAINT "customer_identifiers_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_activities" ADD CONSTRAINT "customer_activities_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_segments" ADD CONSTRAINT "customer_segments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_snapshots" ADD CONSTRAINT "revenue_snapshots_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_health" ADD CONSTRAINT "location_health_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traffic_snapshots" ADD CONSTRAINT "traffic_snapshots_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyword_snapshots" ADD CONSTRAINT "keyword_snapshots_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector_credentials" ADD CONSTRAINT "connector_credentials_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
