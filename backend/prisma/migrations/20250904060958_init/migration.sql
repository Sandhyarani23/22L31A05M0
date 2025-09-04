-- CreateTable
CREATE TABLE "ShortUrl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalUrl" TEXT NOT NULL,
    "shortcode" TEXT NOT NULL,
    "expiry" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Click" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shorturlId" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrer" TEXT,
    "geo" TEXT,
    CONSTRAINT "Click_shorturlId_fkey" FOREIGN KEY ("shorturlId") REFERENCES "ShortUrl" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortUrl_shortcode_key" ON "ShortUrl"("shortcode");
