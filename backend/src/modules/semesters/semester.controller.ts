import { Request, Response } from "express";
import { SemesterService } from "./semester.service";

export class SemesterController {
  static async create(req: Request, res: Response) {
    try {
      const semester = await SemesterService.create(req.body);

      return res.status(201).json({
        success: true,
        data: semester,
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
      const semesters = await SemesterService.getAll();

      return res.json({
        success: true,
        data: semesters,
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

      const semester = await SemesterService.getById(id);

      if (!semester) {
        return res.status(404).json({
          success: false,
          message: "Semester not found",
        });
      }

      return res.json({
        success: true,
        data: semester,
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

      const semester = await SemesterService.update(id, req.body);

      return res.json({
        success: true,
        data: semester,
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

      await SemesterService.delete(id);

      return res.json({
        success: true,
        message: "Semester deleted successfully",
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