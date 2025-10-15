-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT,
    "departmentId" TEXT,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Position_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PositionCompetency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "positionId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1,
    "expectedLvl" INTEGER NOT NULL,
    CONSTRAINT "PositionCompetency_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PositionCompetency_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeePosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "effectiveFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" DATETIME,
    CONSTRAINT "EmployeePosition_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmployeePosition_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Position_organizationId_name_key" ON "Position"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PositionCompetency_positionId_competencyId_key" ON "PositionCompetency"("positionId", "competencyId");
