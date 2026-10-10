import { Request, Response } from "express";
import { TeacherImportService } from "./teacherImport.service";

export class TeacherImportController {
  static async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "กรุณาเลือกไฟล์ Excel",
        });
      }

      const result = await TeacherImportService.importExcel(
        req.file.buffer
      );

      return res.status(200).json({
        success: true,
        message: "นำเข้าข้อมูลครูสำเร็จ",
        data: {
          imported: result.count,
        },
      });
    } catch (error: any) {
      console.error("===== IMPORT TEACHER ERROR =====");
      console.error(error);
      console.error("===============================");

      return res.status(500).json({
        success: false,
        message: error.message || "Import ไม่สำเร็จ",
        error:
          process.env.NODE_ENV === "development"
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : undefined,
      });
    }
  }
}