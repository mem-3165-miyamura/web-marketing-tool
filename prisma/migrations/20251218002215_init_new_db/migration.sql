-- AlterTable
ALTER TABLE "PopUpConfig" ADD COLUMN     "isAbTest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "testGroup" TEXT;
