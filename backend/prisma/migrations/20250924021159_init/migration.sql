-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Department_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "departmentId" TEXT,
    "managerId" TEXT,
    "hireDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Employee_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Category_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Competency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Competency_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Competency_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvaluationTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scaleMin" INTEGER NOT NULL DEFAULT 1,
    "scaleMax" INTEGER NOT NULL DEFAULT 5,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "EvaluationTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateCompetency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1,
    "expectedLvl" INTEGER,
    CONSTRAINT "TemplateCompetency_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EvaluationTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TemplateCompetency_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "dueDate" DATETIME,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Evaluation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EvaluationTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvaluationAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evaluationId" TEXT NOT NULL,
    "reviewerEmpId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "EvaluationAssignment_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EvaluationAssignment_reviewerEmpId_fkey" FOREIGN KEY ("reviewerEmpId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvaluationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assignmentId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comments" TEXT,
    CONSTRAINT "EvaluationResult_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "EvaluationAssignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EvaluationResult_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_organizationId_email_key" ON "User"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_organizationId_key" ON "Role"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_organizationId_name_key" ON "Department"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_organizationId_name_key" ON "Category"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_organizationId_name_key" ON "Competency"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationTemplate_organizationId_name_key" ON "EvaluationTemplate"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateCompetency_templateId_competencyId_key" ON "TemplateCompetency"("templateId", "competencyId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationResult_assignmentId_competencyId_key" ON "EvaluationResult"("assignmentId", "competencyId");
