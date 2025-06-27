import express from 'express';
import { CreateVaultController, GetVaultController } from '../controllers/CreateVaultController';
const router = express.Router();

router.post("/vault", CreateVaultController);
router.get("/vault/:address", GetVaultController);

export default router;