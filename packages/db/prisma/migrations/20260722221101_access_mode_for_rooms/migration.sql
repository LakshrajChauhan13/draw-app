-- CreateEnum
CREATE TYPE "AccessMode" AS ENUM ('PRIVATE', 'PUBLIC_VIEW', 'PUBLIC_EDIT');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "accessMode" "AccessMode" NOT NULL DEFAULT 'PRIVATE';
