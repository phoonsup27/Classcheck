import { Request, Response } from "express";
import { RoleService } from "./role.service";

export class RoleController {
  static async create(req: Request, res: Response) {
    try {
      const role = await RoleService.create(req.body);

      return res.status(201).json({
        success: true,
        data: role,
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
      const roles = await RoleService.getAll();

      return res.json({
        success: true,
        data: roles,
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

      const role = await RoleService.getById(id);

      if (!role) {
        return res.status(404).json({
          success: false,
          message: "Role not found",
        });
      }

      return res.json({
        success: true,
        data: role,
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

      const role = await RoleService.update(id, req.body);

      return res.json({
        success: true,
        data: role,
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

      await RoleService.delete(id);

      return res.json({
        success: true,
        message: "Role deleted successfully",
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