import express from 'express';
import { GetImageMetadataController, GetImageDataController } from '../controllers/GetImageController';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();

router.get('/vaults/:vaultId/images/:ipfsHash', authMiddleware, GetImageMetadataController)
router.get('/images/:ipfsHash', authMiddleware, GetImageDataController)

export default router;