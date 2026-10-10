-- CreateTable
CREATE TABLE "Test" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "roleName" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "roleId" BIGINT NOT NULL,
    "teacherId" BIGINT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" BIGSERIAL NOT NULL,
    "teacherCode" VARCHAR(20) NOT NULL,
    "prefix" VARCHAR(20),
    "fullName" VARCHAR(255) NOT NULL,
    "gender" VARCHAR(20),
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "position" VARCHAR(100),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classrooms" (
    "id" BIGSERIAL NOT NULL,
    "classroomName" VARCHAR(20) NOT NULL,
    "gradeLevel" VARCHAR(20) NOT NULL,
    "roomNumber" VARCHAR(10) NOT NULL,
    "homeroomTeacherId" BIGINT,
    "schoolYearId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" BIGSERIAL NOT NULL,
    "studentCode" VARCHAR(20) NOT NULL,
    "nationalId" VARCHAR(20),
    "prefix" VARCHAR(20),
    "fullName" VARCHAR(255) NOT NULL,
    "gender" VARCHAR(20),
    "birthDate" TIMESTAMP(3),
    "classroomId" BIGINT,
    "studentNumber" INTEGER,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" BIGSERIAL NOT NULL,
    "subjectCode" VARCHAR(20) NOT NULL,
    "subjectName" VARCHAR(200) NOT NULL,
    "credit" DECIMAL(3,1) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_years" (
    "id" BIGSERIAL NOT NULL,
    "yearName" VARCHAR(20) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" BIGSERIAL NOT NULL,
    "semesterName" VARCHAR(20) NOT NULL,
    "schoolYearId" BIGINT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" BIGSERIAL NOT NULL,
    "teacherId" BIGINT NOT NULL,
    "subjectId" BIGINT NOT NULL,
    "classroomId" BIGINT NOT NULL,
    "semesterId" BIGINT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "startTime" TIME(0) NOT NULL,
    "endTime" TIME(0) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" BIGSERIAL NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL,
    "scheduleId" BIGINT NOT NULL,
    "checkedBy" BIGINT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_details" (
    "id" BIGSERIAL NOT NULL,
    "attendanceId" BIGINT NOT NULL,
    "studentId" BIGINT NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_roleName_key" ON "roles"("roleName");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_teacherId_key" ON "users"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_teacherCode_key" ON "teachers"("teacherCode");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_key" ON "teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_studentCode_key" ON "students"("studentCode");

-- CreateIndex
CREATE UNIQUE INDEX "students_nationalId_key" ON "students"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_subjectCode_key" ON "subjects"("subjectCode");

-- CreateIndex
CREATE UNIQUE INDEX "school_years_yearName_key" ON "school_years"("yearName");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_teacherId_dayOfWeek_period_semesterId_key" ON "schedules"("teacherId", "dayOfWeek", "period", "semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_classroomId_dayOfWeek_period_semesterId_key" ON "schedules"("classroomId", "dayOfWeek", "period", "semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_attendanceDate_scheduleId_key" ON "attendance"("attendanceDate", "scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_details_attendanceId_studentId_key" ON "attendance_details"("attendanceId", "studentId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_homeroomTeacherId_fkey" FOREIGN KEY ("homeroomTeacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_checkedBy_fkey" FOREIGN KEY ("checkedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_details" ADD CONSTRAINT "attendance_details_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_details" ADD CONSTRAINT "attendance_details_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
