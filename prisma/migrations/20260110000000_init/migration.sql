-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PROCESSING', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CREATED', 'ARRIVED', 'PROCESSING', 'DELIVERED', 'DELAYED', 'EXCEPTION');

-- CreateTable
CREATE TABLE "Terminal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "average_processing_days" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Terminal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteNode" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "terminal_id" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waybill" (
    "id" TEXT NOT NULL,
    "tracking_code" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "current_node_index" INTEGER NOT NULL DEFAULT 0,
    "current_terminal_id" TEXT NOT NULL,
    "shipper_name" TEXT NOT NULL,
    "receiver_name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "dimensions" TEXT NOT NULL,
    "estimated_delivery_date" TIMESTAMP(3) NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PROCESSING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waybill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingEvent" (
    "id" TEXT NOT NULL,
    "waybill_id" TEXT NOT NULL,
    "terminal_id" TEXT NOT NULL,
    "event_type" "EventType" NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Terminal_name_key" ON "Terminal"("name");

-- CreateIndex
CREATE INDEX "Terminal_name_idx" ON "Terminal"("name");

-- CreateIndex
CREATE INDEX "Terminal_location_idx" ON "Terminal"("location");

-- CreateIndex
CREATE UNIQUE INDEX "Route_name_key" ON "Route"("name");

-- CreateIndex
CREATE INDEX "Route_name_idx" ON "Route"("name");

-- CreateIndex
CREATE INDEX "Route_is_active_idx" ON "Route"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "RouteNode_route_id_sequence_order_key" ON "RouteNode"("route_id", "sequence_order");

-- CreateIndex
CREATE INDEX "RouteNode_route_id_idx" ON "RouteNode"("route_id");

-- CreateIndex
CREATE INDEX "RouteNode_terminal_id_idx" ON "RouteNode"("terminal_id");

-- CreateIndex
CREATE UNIQUE INDEX "Waybill_tracking_code_key" ON "Waybill"("tracking_code");

-- CreateIndex
CREATE INDEX "Waybill_tracking_code_idx" ON "Waybill"("tracking_code");

-- CreateIndex
CREATE INDEX "Waybill_route_id_idx" ON "Waybill"("route_id");

-- CreateIndex
CREATE INDEX "Waybill_current_terminal_id_idx" ON "Waybill"("current_terminal_id");

-- CreateIndex
CREATE INDEX "Waybill_status_idx" ON "Waybill"("status");

-- CreateIndex
CREATE INDEX "Waybill_created_at_idx" ON "Waybill"("created_at");

-- CreateIndex
CREATE INDEX "TrackingEvent_waybill_id_idx" ON "TrackingEvent"("waybill_id");

-- CreateIndex
CREATE INDEX "TrackingEvent_terminal_id_idx" ON "TrackingEvent"("terminal_id");

-- CreateIndex
CREATE INDEX "TrackingEvent_timestamp_idx" ON "TrackingEvent"("timestamp");

-- AddForeignKey
ALTER TABLE "RouteNode" ADD CONSTRAINT "RouteNode_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteNode" ADD CONSTRAINT "RouteNode_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waybill" ADD CONSTRAINT "Waybill_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waybill" ADD CONSTRAINT "Waybill_current_terminal_id_fkey" FOREIGN KEY ("current_terminal_id") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingEvent" ADD CONSTRAINT "TrackingEvent_waybill_id_fkey" FOREIGN KEY ("waybill_id") REFERENCES "Waybill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingEvent" ADD CONSTRAINT "TrackingEvent_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
