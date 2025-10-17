-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "avatar" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OAuthProviders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthProviders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_oauth_user_id" ON "OAuthProviders"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthProviders_provider_provider_id_key" ON "OAuthProviders"("provider", "provider_id");

-- AddForeignKey
ALTER TABLE "OAuthProviders" ADD CONSTRAINT "OAuthProviders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
