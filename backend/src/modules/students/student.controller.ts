import { Request, Response } from "express";
import { StudentService } from "./student.service";

const serializeBigInt = (data: any) => {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

export class StudentController {
  static async create(req: Request, res: Response) {
    try {
      const student = await StudentService.create(req.body);
      return res.status(201).json({ success: true, data: serializeBigInt(student) });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      // ดึง teacherId จาก query parameter (เช่น /students?teacherId=1)
      const { teacherId } = req.query;

      // ส่ง teacherId ไปยัง Service เพื่อทำการกรองข้อมูล
      const students = await StudentService.getAll(teacherId as string | undefined);

      return res.json({
        success: true,
        data: serializeBigInt(students),
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id as string);
      const student = await StudentService.getById(id);
      if (!student) return res.status(404).json({ success: false, message: "Student not found" });
      
      return res.json({ success: true, data: serializeBigInt(student) });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id as string);
      const student = await StudentService.update(id, req.body);
      return res.json({ success: true, data: serializeBigInt(student) });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id as string);
      await StudentService.delete(id);
      return res.json({ success: true, message: "Student deleted successfully" });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}