import { Router } from "express";
import { SchoolYearController } from "./schoolYear.controller";

const router = Router();

router.post("/", SchoolYearController.create);

router.get("/", SchoolYearController.getAll);

router.get("/:id", SchoolYearController.getById);

router.put("/:id", SchoolYearController.update);

router.delete("/:id", SchoolYearController.delete);

export default router;