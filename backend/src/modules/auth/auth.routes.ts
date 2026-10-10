import { Router } from "express";

import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// ============================================================
// LOGIN
// ไม่ต้องใช้ token
// POST /api/auth/login
// ============================================================

router.post("/login", AuthController.login);

// ============================================================
// REGISTER
// ต้องล็อกอินก่อน
// POST /api/auth/register
// ============================================================

router.post(
  "/register",
  authMiddleware,
  AuthController.register
);

// ============================================================
// ME
// ดูข้อมูลผู้ใช้ที่ล็อกอินอยู่
// GET /api/auth/me
// ============================================================

router.get(
  "/me",
  authMiddleware,
  AuthController.me
);

// ============================================================
// EXPORT
// ============================================================

export default router;