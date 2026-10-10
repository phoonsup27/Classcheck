import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import studentRoutes from "./modules/students/student.routes";
import teacherRoutes from "./modules/teachers/teacher.routes";
import classroomRoutes from "./modules/classrooms/classroom.routes";
import schoolYearRoutes from "./modules/schoolYears/schoolYear.routes";
import semesterRoutes from "./modules/semesters/semester.routes";
import subjectRoutes from "./modules/subjects/subject.routes";
import scheduleRoutes from "./modules/schedules/schedule.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import roleRoutes from "./modules/roles/role.routes";
import teacherImportRoutes from "./modules/teacherImport/teacherImport.routes";
import studentImportRoutes from "./modules/studentImport/studentImport.routes";

const app = express();

// ============================================================
// Prisma BigInt -> JSON
// ============================================================

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// ============================================================
// Middleware
// ============================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// ============================================================
// Test
// ============================================================

app.get("/", (req, res) => {
  res.json({
    message: "Classcheck API 🚀",
  });
});

// ============================================================
// ตรวจสอบ Router ก่อน app.use()
// ============================================================

function mountRoute(
  path: string,
  route: any,
  name: string
) {
  if (typeof route !== "function") {
    console.error(
      `❌ ROUTER ERROR: ${name} ไม่ใช่ function`
    );

    console.error("ค่าที่ได้รับ:", route);

    throw new TypeError(
      `${name} ต้อง export Express Router เป็น default`
    );
  }

  app.use(path, route);

  console.log(`✅ Mounted ${name} -> ${path}`);
}

// ============================================================
// Routes
// ============================================================

mountRoute(
  "/api/auth",
  authRoutes,
  "authRoutes"
);

mountRoute(
  "/users",
  userRoutes,
  "userRoutes"
);

mountRoute(
  "/students",
  studentRoutes,
  "studentRoutes"
);

mountRoute(
  "/teachers",
  teacherRoutes,
  "teacherRoutes"
);

mountRoute(
  "/classrooms",
  classroomRoutes,
  "classroomRoutes"
);

mountRoute(
  "/school-years",
  schoolYearRoutes,
  "schoolYearRoutes"
);

mountRoute(
  "/semesters",
  semesterRoutes,
  "semesterRoutes"
);

mountRoute(
  "/subjects",
  subjectRoutes,
  "subjectRoutes"
);

mountRoute(
  "/schedules",
  scheduleRoutes,
  "scheduleRoutes"
);

mountRoute(
  "/attendances",
  attendanceRoutes,
  "attendanceRoutes"
);

mountRoute(
  "/roles",
  roleRoutes,
  "roleRoutes"
);

mountRoute(
  "/api/teachers/import",
  teacherImportRoutes,
  "teacherImportRoutes"
);

mountRoute(
  "/api/students/import",
  studentImportRoutes,
  "studentImportRoutes"
);

export default app;