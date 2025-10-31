-- CreateTable
CREATE TABLE "DisciplinaryAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "issuedById" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "consequences" TEXT,
    "followUpDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "DisciplinaryAction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DisciplinaryAction_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DisciplinaryAction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DisciplinaryAction_organizationId_id_key" ON "DisciplinaryAction"("organizationId", "id");
