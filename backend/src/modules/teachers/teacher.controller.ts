import { Request, Response } from "express";
import { TeacherService } from "./teacher.service";

export class TeacherController {
  static async create(req: Request, res: Response) {
    try {
      const teacher = await TeacherService.create(req.body);

      return res.status(201).json({
        success: true,
        data: teacher,
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
      const teachers = await TeacherService.getAll();

      return res.json({
        success: true,
        data: teachers,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id as string);

      const teacher = await TeacherService.getById(id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      return res.json({
        success: true,
        data: teacher,
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

      const teacher = await TeacherService.update(id, req.body);

      return res.json({
        success: true,
        data: teacher,
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

      await TeacherService.delete(id);

      return res.json({
        success: true,
        message: "Teacher deleted successfully",
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