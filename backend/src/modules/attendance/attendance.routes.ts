import { Router } from "express";
import { AttendanceController } from "./attendance.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";

const router = Router();

const ALL = ["Admin", "Director", "ViceDirector", "Teacher"];
const MANAGE = ["Admin", "Director", "ViceDirector"];

// ทุกเส้นทางต้องล็อกอินก่อน (ป้องกันไว้ในไฟล์นี้เอง ไม่ต้องพึ่งไฟล์ index อย่างเดียว)
router.use(authMiddleware);

// ครูเช็คชื่อ/ดู/แก้ได้เฉพาะคาบตัวเอง (ตรวจในตัว service อีกชั้น)
router.post("/", roleGuard(...ALL), AttendanceController.create);
router.get("/", roleGuard(...ALL), AttendanceController.getAll);
router.get("/:id", roleGuard(...ALL), AttendanceController.getById);
router.put("/:id", roleGuard(...ALL), AttendanceController.update);

// ลบได้เฉพาะผู้บริหาร
router.delete("/:id", roleGuard(...MANAGE), AttendanceController.delete);

export default router;
