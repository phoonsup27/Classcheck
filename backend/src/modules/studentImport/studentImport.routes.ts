import express from "express";
import { upload } from "../../config/multer";
import { StudentImportController } from "./studentImport.controller";

const router = express.Router();

router.post(
  "/students",
  upload.single("file"),
  StudentImportController.upload
);

export default router;