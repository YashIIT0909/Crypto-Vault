import express from 'express';
import { UploadImageController } from '../controllers/UploadImageController';
import upload from '../middlewares/multer';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();

router.post('/upload', authMiddleware, upload.single('file'), UploadImageController)

export default router;