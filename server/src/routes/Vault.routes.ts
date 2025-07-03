import express from 'express';
import { CreateVaultController, GetVaultController, GetVaultOwnerController } from '../controllers/CreateVaultController';
const router = express.Router();

router.post("/vault", CreateVaultController);
router.get("/vault/:address", GetVaultController);
router.get("/getVaultOwner/:vaultId", GetVaultOwnerController);

export default router;