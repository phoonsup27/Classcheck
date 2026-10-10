import { Request, Response } from "express";
import { StudentImportService } from "./studentImport.service";

export class StudentImportController {
  static async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "กรุณาเลือกไฟล์ Excel",
        });
      }

      if (!req.body.classroomId) {
        return res.status(400).json({
          success: false,
          message: "กรุณาเลือกห้องเรียน",
        });
      }

      const classroomId = BigInt(req.body.classroomId);

      const result = await StudentImportService.importExcel(
        req.file.buffer,
        classroomId
      );

      return res.status(200).json({
        success: true,
        message: "นำเข้าข้อมูลนักเรียนสำเร็จ",
        data: {
          imported: result.count,
        },
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}