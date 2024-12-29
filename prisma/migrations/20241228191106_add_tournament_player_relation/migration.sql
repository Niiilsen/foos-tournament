/*
  Warnings:

  - Added the required column `password` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tournament_player" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "tournament_player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tournament_player_tournamentId_playerId_key" ON "tournament_player"("tournamentId", "playerId");

-- AddForeignKey
ALTER TABLE "tournament_player" ADD CONSTRAINT "tournament_player_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_player" ADD CONSTRAINT "tournament_player_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
