import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Student from "../pages/students/Student";
import DashboardLayout from "../components/layout/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import Teacher from "../pages/teachers/Teacher";
import Classroom from "../pages/classrooms/Classroom";
import Attendance from "../pages/attendance/Attendance";
import SubjectPage from "../pages/subjects/Subject";
import SchedulePage from "../pages/schedules/Schedule";
import ReportPage from "../pages/reports/Reports";
import SettingsPage from "../pages/settings/Settings";
import UserManagement from "../pages/settings/UserManagement";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login - รองรับทั้ง path "/" และ "/login" */}
        <Route
          path="/"
          element={<Login />}
        />
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/students"
            element={<Student />}
          />

          <Route
            path="/teachers"
            element={<Teacher />}
          />

          <Route
            path="/classrooms"
            element={<Classroom />}
          />

          <Route
            path="/attendance"
            element={<Attendance />}
          />

          <Route
            path="/subjects"
            element={<SubjectPage />}
          />

          <Route
            path="/schedules"
            element={<SchedulePage />}
          />

          <Route
            path="/reports"
            element={<ReportPage />}
          />

          <Route
            path="/users"
            element={<UserManagement />}
          />

          <Route
            path="/settings"
            element={<SettingsPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}