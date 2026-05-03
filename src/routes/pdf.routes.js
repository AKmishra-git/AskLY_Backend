import express from "express";
import multer from "multer";
import { uploadPDF } from "../controllers/pdf.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", authMiddleware, upload.single("file"), uploadPDF);

export default router;