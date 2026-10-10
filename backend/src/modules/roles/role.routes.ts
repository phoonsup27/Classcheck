import { Router } from "express";
import { RoleController } from "./role.controller";

const router = Router();

router.post("/", RoleController.create);

router.get("/", RoleController.getAll);

router.get("/:id", RoleController.getById);

router.put("/:id", RoleController.update);

router.delete("/:id", RoleController.delete);

export default router;