import { Router } from "express";
import { StudentController } from "./student.controller";

const router = Router();

router.post("/", StudentController.create);
router.get("/", StudentController.getAll);
router.get("/:id", StudentController.getById);
router.put("/:id", StudentController.update);
router.delete("/:id", StudentController.delete);

export default router;