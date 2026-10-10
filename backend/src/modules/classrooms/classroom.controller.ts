import { Request, Response } from "express";
import { ClassroomService } from "./classroom.service";

// ฟังก์ชันกลางสำหรับแปลง BigInt เป็น String
const serializeBigInt = (data: any) => {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

export class ClassroomController {
  static async create(req: Request, res: Response) {
    try {
      const classroom = await ClassroomService.create(req.body);

      return res.status(201).json({
        success: true,
        data: serializeBigInt(classroom),
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      // 🎯 ดึง teacherId จาก query string (เช่น ?teacherId=1)
      const { teacherId } = req.query;
      const classrooms = await ClassroomService.getAll(teacherId as string | undefined);

      return res.json({
        success: true,
        data: serializeBigInt(classrooms),
      });
    } catch (error: any) {
      console.error(error);

      return res.json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id as string);

      const classroom = await ClassroomService.getById(id);

      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found",
        });
      }

      return res.json({
        success: true,
        data: serializeBigInt(classroom),
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id as string);

      const classroom = await ClassroomService.update(id, req.body);

      return res.json({
        success: true,
        data: serializeBigInt(classroom),
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id as string);

      await ClassroomService.delete(id);

      return res.json({
        success: true,
        message: "Classroom deleted successfully",
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