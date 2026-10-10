import { Request, Response } from "express";
import { ReportService } from "./report.service";

export class ReportController {
  static async getSummary(req: Request, res: Response) {
    try {
      const year = req.query.year ? Number(req.query.year) : undefined;
      const semester = req.query.semester ? Number(req.query.semester) : undefined;

      const summary = await ReportService.getSummaryReport(year, semester);

      return res.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      console.error("Get Report Summary Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลรายงานภาพรวม",
      });
    }
  }

  static async getRecentAttendance(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const recentData = await ReportService.getRecentAttendance(limit);

      return res.json({
        success: true,
        data: recentData,
      });
    } catch (error: any) {
      console.error("Get Recent Attendance Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการดึงประวัติการเช็คชื่อ",
      });
    }
  }
}