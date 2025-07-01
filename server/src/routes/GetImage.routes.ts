import express from 'express';
import { GetImageMetadataController } from '../controllers/GetImageController';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();

router.get('/vaults/:vaultId/images/:ipfsHash', authMiddleware, GetImageMetadataController)

export default router;