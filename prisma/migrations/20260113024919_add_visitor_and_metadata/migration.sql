-- AlterTable
ALTER TABLE "PopUpConfig" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'standard';

-- AlterTable
ALTER TABLE "TrackingLog" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "visitorId" TEXT;

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "lastVid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_email_key" ON "Visitor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_lastVid_key" ON "Visitor"("lastVid");

-- CreateIndex
CREATE INDEX "TrackingLog_userId_idx" ON "TrackingLog"("userId");

-- CreateIndex
CREATE INDEX "TrackingLog_visitorId_idx" ON "TrackingLog"("visitorId");

-- AddForeignKey
ALTER TABLE "TrackingLog" ADD CONSTRAINT "TrackingLog_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
