-- CreateTable
CREATE TABLE "WorkSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WorkDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduleId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'WORK',
    "hours" REAL NOT NULL DEFAULT 8.0,
    CONSTRAINT "WorkDay_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "WorkSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkSchedule_userId_year_month_key" ON "WorkSchedule"("userId", "year", "month");
