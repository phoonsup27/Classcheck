import { Request, Response } from "express";
import { UserService } from "./user.service";

export class UserController {
  static async getAll(req: Request, res: Response) {
    try {
      const users = await UserService.getAll();

      return res.json({
        success: true,
        data: users,
      });
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id as string);

      const user = await UserService.getById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.json({
        success: true,
        data: user,
      });
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { username, password, roleId } = req.body;

      // ตรวจสอบข้อมูลให้ครบถ้วน รวมถึง roleId ที่จำเป็นต้องมีค่า
      if (!username || !password || roleId === undefined || roleId === null || roleId === "") {
        return res.status(400).json({
          success: false,
          message: "กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อผู้ใช้, รหัสผ่าน และสิทธิ์การใช้งาน)",
        });
      }

      // เรียกใช้งาน UserService พร้อมส่ง roleId เป็นตัวเลขที่แน่นอน
      const newUser = await UserService.create({
        username,
        password,
        roleId: Number(roleId),
      });

      return res.status(201).json({
        success: true,
        message: "สร้างบัญชีผู้ใช้สำเร็จ",
        data: newUser,
      });
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id as string);

      await UserService.delete(id);

      return res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }
}