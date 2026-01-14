-- DropIndex
DROP INDEX "Visitor_lastVid_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "statusRules" JSONB,
ALTER COLUMN "hashedPassword" DROP NOT NULL;

-- CreateTable
CREATE TABLE "MailConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "targetStatus" "VisitorStatus" NOT NULL,
    "triggerEvent" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "templateType" TEXT NOT NULL DEFAULT 'B2B',
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MailConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MailConfig_targetStatus_triggerEvent_enabled_idx" ON "MailConfig"("targetStatus", "triggerEvent", "enabled");

-- CreateIndex
CREATE INDEX "Visitor_lastVid_idx" ON "Visitor"("lastVid");

-- AddForeignKey
ALTER TABLE "MailConfig" ADD CONSTRAINT "MailConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
