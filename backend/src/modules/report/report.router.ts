import { Router } from "express";
import { ReportController } from "./report.controller";

const router = Router();

// GET /api/reports?year=2569&semester=1
router.get("/reports", ReportController.getSummary);

// GET /api/reports/recent-attendance
router.get("/reports/recent-attendance", ReportController.getRecentAttendance);

export default router;