import express from 'express';
import { StoreKeyController } from '../controllers/StoreKeyController';
const router = express.Router();

router.post('/storekey', StoreKeyController)

export default router;