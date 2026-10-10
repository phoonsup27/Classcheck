import { Request, Response } from "express";
import { ScheduleService } from "./schedule.service";

export class ScheduleController {
  static async create(req: Request, res: Response) {
    try {
      const schedule = await ScheduleService.create(req.body);

      return res.status(201).json({
        success: true,
        message: "สร้างตารางเรียนสำเร็จ",
        data: schedule,
      });
    } catch (error: any) {
      console.error("Create Schedule Error:", error);

      // ดักจับ Unique Constraint Error (P2002) - ซ้ำคาบ/ซ้ำห้อง/ซ้ำครู
      if (error.code === "P2002") {
        return res.status(400).json({
          success: false,
          message: "ตารางเรียนซ้ำซ้อน! ครูผู้สอนหรือห้องเรียนนี้มีตารางสอนในคาบเวลานี้แล้ว",
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการสร้างตารางเรียน",
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { teacherId } = req.query;

      const schedules = await ScheduleService.getAll(teacherId as string);

      return res.json({
        success: true,
        data: schedules,
      });
    } catch (error: any) {
      console.error("Get All Schedules Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลตารางเรียน",
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "รูปแบบ ID ไม่ถูกต้อง",
        });
      }

      const schedule = await ScheduleService.getById(BigInt(id));

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลตารางเรียน",
        });
      }

      return res.json({
        success: true,
        data: schedule,
      });
    } catch (error: any) {
      console.error("Get Schedule By ID Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "รูปแบบ ID ไม่ถูกต้อง",
        });
      }

      const schedule = await ScheduleService.update(BigInt(id), req.body);

      return res.json({
        success: true,
        message: "อัปเดตตารางเรียนสำเร็จ",
        data: schedule,
      });
    } catch (error: any) {
      console.error("Update Schedule Error:", error);

      if (error.code === "P2002") {
        return res.status(400).json({
          success: false,
          message: "ตารางเรียนซ้ำซ้อน! ครูผู้สอนหรือห้องเรียนนี้มีตารางสอนในคาบเวลานี้แล้ว",
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการอัปเดตตารางเรียน",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "รูปแบบ ID ไม่ถูกต้อง",
        });
      }

      await ScheduleService.delete(BigInt(id));

      return res.json({
        success: true,
        message: "ลบตารางเรียนเรียบร้อยแล้ว",
      });
    } catch (error: any) {
      console.error("Delete Schedule Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการลบตารางเรียน",
      });
    }
  }
}