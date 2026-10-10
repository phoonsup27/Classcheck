import express from "express";
import { upload } from "../../config/multer";
import { TeacherImportController } from "./teacherImport.controller";


const router = express.Router();


router.post(
 "/",
 upload.single("file"),
 TeacherImportController.upload
);


export default router;