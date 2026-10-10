import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);

// 👉 เพิ่มบรรทัดนี้ เพื่อให้ระบบสามารถรับข้อมูลสร้างผู้ใช้ใหม่ได้ (POST /users)
router.post("/", UserController.create); 

router.delete("/:id", UserController.delete);

export default router;