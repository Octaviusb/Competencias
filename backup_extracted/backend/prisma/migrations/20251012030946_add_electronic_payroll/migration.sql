-- CreateTable
CREATE TABLE "ElectronicPayrollDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payslipId" TEXT NOT NULL,
    "cune" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "employerNit" TEXT NOT NULL,
    "employerName" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeNit" TEXT,
    "employeeName" TEXT NOT NULL,
    "employeeLastName" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "salary" REAL NOT NULL,
    "workedDays" INTEGER NOT NULL,
    "earnedIncome" REAL NOT NULL,
    "deductions" REAL NOT NULL,
    "netPayment" REAL NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "generationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transmissionDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "rejectionReason" TEXT,
    "digitalSignature" TEXT,
    "xmlContent" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "ElectronicPayrollDocument_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES "Payslip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ElectronicPayrollDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectronicPayrollTransmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "transmissionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "responseCode" TEXT,
    "responseMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetryDate" DATETIME,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "ElectronicPayrollTransmission_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ElectronicPayrollDocument" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ElectronicPayrollTransmission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ElectronicPayrollDocument_payslipId_key" ON "ElectronicPayrollDocument"("payslipId");

-- CreateIndex
CREATE UNIQUE INDEX "ElectronicPayrollDocument_cune_key" ON "ElectronicPayrollDocument"("cune");

-- CreateIndex
CREATE UNIQUE INDEX "ElectronicPayrollDocument_organizationId_cune_key" ON "ElectronicPayrollDocument"("organizationId", "cune");
