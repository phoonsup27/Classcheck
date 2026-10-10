import { Router } from "express";
import { TeacherController } from "./teacher.controller";

const router = Router();

router.post("/", TeacherController.create);

router.get("/", TeacherController.getAll);

router.get("/:id", TeacherController.getById);

router.put("/:id", TeacherController.update);

router.delete("/:id", TeacherController.delete);

export default router;