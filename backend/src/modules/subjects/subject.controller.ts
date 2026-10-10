import { Request, Response } from "express";
import { SubjectService } from "./subject.service";

// ฟังก์ชันช่วยแปลง BigInt เป็น Number เพื่อป้องกัน JSON.stringify พัง
const serializeSubject = (subject: any) => {
  if (!subject) return null;
  return {
    ...subject,
    id: Number(subject.id),
    credit: subject.credit ? Number(subject.credit) : 0,
  };
};

export class SubjectController {
  static async create(req: Request, res: Response) {
    try {
      const subject = await SubjectService.create(req.body);

      return res.status(201).json({
        success: true,
        data: serializeSubject(subject),
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
      const subjects = await SubjectService.getAll();

      return res.json({
        success: true,
        data: subjects.map(serializeSubject),
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
      const subject = await SubjectService.getById(id);

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found",
        });
      }

      return res.json({
        success: true,
        data: serializeSubject(subject),
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
      const subject = await SubjectService.update(id, req.body);

      return res.json({
        success: true,
        data: serializeSubject(subject),
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
      await SubjectService.delete(id);

      return res.json({
        success: true,
        message: "Subject deleted successfully",
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