import express from 'express';
import { CreateVaultController } from '../controllers/CreateVaultController';
const router = express.Router();

router.post("/vault", CreateVaultController);

export default router;