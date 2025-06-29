import express from 'express';
import { GetEncryptedKeyController } from '../controllers/GetEncryptedKeyController';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();

router.get('/getkey', authMiddleware, GetEncryptedKeyController)

export default router;