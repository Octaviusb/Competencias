-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "InterviewTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewQuestionTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "InterviewQuestionTemplate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InterviewTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Interview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "templateId" TEXT,
    "purpose" TEXT,
    "scheduledDate" DATETIME NOT NULL,
    "actualDate" DATETIME,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "location" TEXT,
    "virtualLink" TEXT,
    "acta" TEXT,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Interview_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Interview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Interview_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InterviewTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Interview" ("actualDate", "duration", "employeeId", "id", "interviewerId", "location", "organizationId", "purpose", "scheduledDate", "status", "type", "virtualLink") SELECT "actualDate", "duration", "employeeId", "id", "interviewerId", "location", "organizationId", "purpose", "scheduledDate", "status", "type", "virtualLink" FROM "Interview";
DROP TABLE "Interview";
ALTER TABLE "new_Interview" RENAME TO "Interview";
CREATE UNIQUE INDEX "Interview_organizationId_id_key" ON "Interview"("organizationId", "id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_organizationId_id_key" ON "AuditLog"("organizationId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewTemplate_organizationId_name_key" ON "InterviewTemplate"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Document_organizationId_id_key" ON "Document"("organizationId", "id");
