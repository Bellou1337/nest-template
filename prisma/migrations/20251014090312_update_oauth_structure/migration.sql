/*
  Warnings:

  - You are about to drop the column `email` on the `OAuthProviders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OAuthProviders` table. All the data in the column will be lost.
  - Made the column `email` on table `Users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('YANDEX', 'TELEGRAM', 'GOOGLE', 'GITHUB', 'EMAIL');

-- AlterTable
ALTER TABLE "OAuthProviders" DROP COLUMN "email",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL;
