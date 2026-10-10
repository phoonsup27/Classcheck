import { Request, Response } from "express";
import { AttendanceService } from "./attendance.service";

// ใช้รหัสสถานะจาก service (403, 404, 409, ...) ถ้าไม่มีให้เป็น 500
function sendError(res: Response, error: any, fallback: string) {
  return res.status(error.status || 500).json({
    success: false,
    message: error.message || fallback,
  });
}

function parseId(req: Request, res: Response): bigint | null {
  const id = req.params.id as string;
  if (!id || isNaN(Number(id))) {
    res.status(400).json({ success: false, message: "รูปแบบ ID ไม่ถูกต้อง" });
    return null;
  }
  return BigInt(id);
}

export class AttendanceController {
  static async create(req: Request, res: Response) {
    try {
      const attendance = await AttendanceService.create(req.body, (req as any).user);

      return res.status(201).json({
        success: true,
        message: "บันทึกการเข้าเรียนสำเร็จ",
        data: attendance,
      });
    } catch (error: any) {
      console.error("Create Attendance Error:", error);
      return sendError(res, error, "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const attendances = await AttendanceService.getAll((req as any).user);

      return res.json({
        success: true,
        data: attendances,
      });
    } catch (error: any) {
      console.error("Get All Attendance Error:", error);
      return sendError(res, error, "เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseId(req, res);
      if (id === null) return;

      const attendance = await AttendanceService.getById(id, (req as any).user);

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลการเข้าเรียน",
        });
      }

      return res.json({
        success: true,
        data: attendance,
      });
    } catch (error: any) {
      console.error("Get Attendance By ID Error:", error);
      return sendError(res, error, "เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseId(req, res);
      if (id === null) return;

      const attendance = await AttendanceService.update(id, req.body, (req as any).user);

      return res.json({
        success: true,
        message: "แก้ไขข้อมูลสำเร็จ",
        data: attendance,
      });
    } catch (error: any) {
      console.error("Update Attendance Error:", error);
      return sendError(res, error, "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseId(req, res);
      if (id === null) return;

      await AttendanceService.delete(id, (req as any).user);

      return res.json({
        success: true,
        message: "ลบข้อมูลการเข้าเรียนเรียบร้อยแล้ว",
      });
    } catch (error: any) {
      console.error("Delete Attendance Error:", error);
      return sendError(res, error, "เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  }
}
