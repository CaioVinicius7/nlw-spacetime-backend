/*
  Warnings:

  - Added the required column `date` to the `memories` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_memories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "memories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_memories" ("content", "coverUrl", "createdAt", "id", "isPublic", "userId") SELECT "content", "coverUrl", "createdAt", "id", "isPublic", "userId" FROM "memories";
DROP TABLE "memories";
ALTER TABLE "new_memories" RENAME TO "memories";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
