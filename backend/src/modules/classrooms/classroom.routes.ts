import { Router } from "express";
import { ClassroomController } from "./classroom.controller";

const router = Router();

router.post("/", ClassroomController.create);

router.get("/", ClassroomController.getAll);

router.get("/:id", ClassroomController.getById);

router.put("/:id", ClassroomController.update);

router.delete("/:id", ClassroomController.delete);

export default router;