-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    "rejectionReason" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LeaveRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LeaveRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "vacationDays" INTEGER NOT NULL DEFAULT 0,
    "sickDays" INTEGER NOT NULL DEFAULT 0,
    "personalDays" INTEGER NOT NULL DEFAULT 0,
    "usedVacation" INTEGER NOT NULL DEFAULT 0,
    "usedSick" INTEGER NOT NULL DEFAULT 0,
    "usedPersonal" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LeaveBalance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "checkIn" DATETIME,
    "checkOut" DATETIME,
    "breakStart" DATETIME,
    "breakEnd" DATETIME,
    "hoursWorked" REAL,
    "overtimeHours" REAL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'present',
    "notes" TEXT,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "AttendanceRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AttendanceRecord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayrollPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "payDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "PayrollPeriod_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "baseSalary" REAL NOT NULL,
    "overtime" REAL NOT NULL DEFAULT 0,
    "bonuses" REAL NOT NULL DEFAULT 0,
    "deductions" REAL NOT NULL DEFAULT 0,
    "taxes" REAL NOT NULL DEFAULT 0,
    "netPay" REAL NOT NULL,
    "hoursWorked" REAL NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payslip_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "PayrollPeriod" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payslip_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayslipItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payslipId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PayslipItem_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES "Payslip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "positionId" TEXT,
    "departmentId" TEXT,
    "salaryMin" REAL,
    "salaryMax" REAL,
    "location" TEXT,
    "employmentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "postedDate" DATETIME,
    "closingDate" DATETIME,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobPosting_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JobPosting_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JobPosting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "resumeUrl" TEXT,
    "linkedinUrl" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Candidate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "appliedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApplicationStage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scheduledDate" DATETIME,
    "completedDate" DATETIME,
    "feedback" TEXT,
    "score" INTEGER,
    CONSTRAINT "ApplicationStage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "provider" TEXT,
    "duration" INTEGER,
    "cost" REAL,
    "maxParticipants" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingCourse_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingEnrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrolledDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" DATETIME,
    "completedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'enrolled',
    "score" INTEGER,
    "feedback" TEXT,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "TrainingEnrollment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TrainingCourse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingEnrollment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employeeId_year_key" ON "LeaveBalance"("employeeId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_employeeId_date_key" ON "AttendanceRecord"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollPeriod_organizationId_name_key" ON "PayrollPeriod"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_employeeId_periodId_key" ON "Payslip"("employeeId", "periodId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_organizationId_email_key" ON "Candidate"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingEnrollment_employeeId_courseId_key" ON "TrainingEnrollment"("employeeId", "courseId");
