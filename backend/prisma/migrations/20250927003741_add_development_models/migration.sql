-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Indicator_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateIndicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "TemplateIndicator_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EvaluationTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TemplateIndicator_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PositionProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "positionId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "knowledge" TEXT,
    "specificSkills" TEXT,
    "experienceYears" INTEGER,
    "educationLevel" TEXT,
    "responsibilities" TEXT,
    "authorityLevel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PositionProfile_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PositionProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "positionId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "occupantEmployeeId" TEXT,
    "supervisorEmployeeId" TEXT,
    "departmentId" TEXT,
    "purpose" TEXT,
    "primaryDutyIndex" INTEGER,
    "observations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobAnalysis_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JobAnalysis_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JobAnalysis_occupantEmployeeId_fkey" FOREIGN KEY ("occupantEmployeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JobAnalysis_supervisorEmployeeId_fkey" FOREIGN KEY ("supervisorEmployeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JobAnalysis_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EssentialFunction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobAnalysisId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "importance" INTEGER NOT NULL,
    "timePercent" INTEGER,
    CONSTRAINT "EssentialFunction_jobAnalysisId_fkey" FOREIGN KEY ("jobAnalysisId") REFERENCES "JobAnalysis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "observerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "context" TEXT,
    "overallRating" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Observation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Observation_observerId_fkey" FOREIGN KEY ("observerId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Observation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ObservationNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "observationId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT,
    CONSTRAINT "ObservationNote_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ObservationBehavior" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "observationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rating" INTEGER,
    "impact" TEXT,
    CONSTRAINT "ObservationBehavior_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ObservationCompetency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "observationId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "evidence" TEXT,
    "suggestions" TEXT,
    CONSTRAINT "ObservationCompetency_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ObservationCompetency_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "purpose" TEXT,
    "scheduledDate" DATETIME NOT NULL,
    "actualDate" DATETIME,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "location" TEXT,
    "virtualLink" TEXT,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Interview_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Interview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interviewId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "InterviewQuestion_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "rating" INTEGER,
    "followUp" TEXT,
    CONSTRAINT "InterviewAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interviewId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comments" TEXT,
    "strengths" TEXT,
    "improvements" TEXT,
    CONSTRAINT "InterviewEvaluation_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InterviewEvaluation_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interviewId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT,
    CONSTRAINT "InterviewNote_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobAnalysisContext" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobAnalysisId" TEXT NOT NULL,
    "workEnvironment" TEXT,
    "interpersonalRelationships" TEXT,
    "toolsAndResources" TEXT,
    "trainingRequired" TEXT,
    "physicalDemands" TEXT,
    "workingConditions" TEXT,
    "travelRequirements" TEXT,
    "safetyConsiderations" TEXT,
    CONSTRAINT "JobAnalysisContext_jobAnalysisId_fkey" FOREIGN KEY ("jobAnalysisId") REFERENCES "JobAnalysis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobAnalysisCompetency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobAnalysisId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "importance" INTEGER NOT NULL,
    "requiredLevel" INTEGER NOT NULL,
    "acquisitionMethod" TEXT,
    "validationMethod" TEXT,
    CONSTRAINT "JobAnalysisCompetency_jobAnalysisId_fkey" FOREIGN KEY ("jobAnalysisId") REFERENCES "JobAnalysis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JobAnalysisCompetency_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobAnalysisExpectation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobAnalysisId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "measurementCriteria" TEXT,
    "timeframe" TEXT,
    "weight" REAL,
    CONSTRAINT "JobAnalysisExpectation_jobAnalysisId_fkey" FOREIGN KEY ("jobAnalysisId") REFERENCES "JobAnalysis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DevelopmentPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "managerId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "targetDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "budget" REAL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "DevelopmentPlan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DevelopmentPlan_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DevelopmentPlan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DevelopmentGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "competencyId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetLevel" INTEGER,
    "currentLevel" INTEGER,
    "measurement" TEXT,
    "weight" REAL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "dueDate" DATETIME,
    CONSTRAINT "DevelopmentGoal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "DevelopmentPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DevelopmentGoal_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DevelopmentActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "duration" INTEGER,
    "cost" REAL,
    "provider" TEXT,
    "location" TEXT,
    "notes" TEXT,
    CONSTRAINT "DevelopmentActivity_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "DevelopmentGoal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DevelopmentReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "goalId" TEXT,
    "reviewerId" TEXT NOT NULL,
    "reviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallProgress" INTEGER,
    "overallRating" INTEGER,
    "comments" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "nextReview" DATETIME,
    CONSTRAINT "DevelopmentReview_planId_fkey" FOREIGN KEY ("planId") REFERENCES "DevelopmentPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DevelopmentReview_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "DevelopmentGoal" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DevelopmentReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DevelopmentResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "cost" REAL,
    "notes" TEXT,
    CONSTRAINT "DevelopmentResource_planId_fkey" FOREIGN KEY ("planId") REFERENCES "DevelopmentPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_organizationId_name_key" ON "Indicator"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateIndicator_templateId_indicatorId_key" ON "TemplateIndicator"("templateId", "indicatorId");

-- CreateIndex
CREATE UNIQUE INDEX "PositionProfile_positionId_key" ON "PositionProfile"("positionId");

-- CreateIndex
CREATE UNIQUE INDEX "JobAnalysis_positionId_key" ON "JobAnalysis"("positionId");

-- CreateIndex
CREATE UNIQUE INDEX "EssentialFunction_jobAnalysisId_index_key" ON "EssentialFunction"("jobAnalysisId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "Observation_organizationId_id_key" ON "Observation"("organizationId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Interview_organizationId_id_key" ON "Interview"("organizationId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "JobAnalysisContext_jobAnalysisId_key" ON "JobAnalysisContext"("jobAnalysisId");

-- CreateIndex
CREATE UNIQUE INDEX "JobAnalysisCompetency_jobAnalysisId_competencyId_key" ON "JobAnalysisCompetency"("jobAnalysisId", "competencyId");

-- CreateIndex
CREATE UNIQUE INDEX "DevelopmentPlan_organizationId_id_key" ON "DevelopmentPlan"("organizationId", "id");
