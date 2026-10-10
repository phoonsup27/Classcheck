import { Request, Response } from "express";
import { SchoolYearService } from "./schoolYear.service";

export class SchoolYearController {
  static async create(req: Request, res: Response) {
    try {
      const schoolYear = await SchoolYearService.create(req.body);

      return res.status(201).json({
        success: true,
        data: schoolYear,
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
      const schoolYears = await SchoolYearService.getAll();

      return res.json({
        success: true,
        data: schoolYears,
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

      const schoolYear = await SchoolYearService.getById(id);

      if (!schoolYear) {
        return res.status(404).json({
          success: false,
          message: "School Year not found",
        });
      }

      return res.json({
        success: true,
        data: schoolYear,
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

      const schoolYear = await SchoolYearService.update(id, req.body);

      return res.json({
        success: true,
        data: schoolYear,
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

      await SchoolYearService.delete(id);

      return res.json({
        success: true,
        message: "School Year deleted successfully",
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