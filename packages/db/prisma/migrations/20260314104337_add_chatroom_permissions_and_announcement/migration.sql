-- CreateEnum
CREATE TYPE "MessagePermission" AS ENUM ('EVERYONE', 'ADMIN_ONLY');

-- AlterEnum
ALTER TYPE "ChatRoomType" ADD VALUE 'ANNOUNCEMENT';

-- DropForeignKey
ALTER TABLE "ChatRoom" DROP CONSTRAINT "ChatRoom_batchId_fkey";

-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "messagingMode" "MessagePermission" NOT NULL DEFAULT 'EVERYONE',
ALTER COLUMN "batchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
