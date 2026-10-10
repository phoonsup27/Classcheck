import { Router } from "express";
import { ScheduleController } from "./schedule.controller";

const router = Router();

router.post("/", ScheduleController.create);

router.get("/", ScheduleController.getAll);

router.get("/:id", ScheduleController.getById);

router.put("/:id", ScheduleController.update);

router.delete("/:id", ScheduleController.delete);

export default router;