import { Router } from "express";
import { SemesterController } from "./semester.controller";

const router = Router();

router.post("/", SemesterController.create);

router.get("/", SemesterController.getAll);

router.get("/:id", SemesterController.getById);

router.put("/:id", SemesterController.update);

router.delete("/:id", SemesterController.delete);

export default router;