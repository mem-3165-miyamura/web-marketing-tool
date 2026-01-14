-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('LEAD', 'PROSPECT', 'CUSTOMER', 'CHURNED');

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "status" "VisitorStatus" NOT NULL DEFAULT 'LEAD';
