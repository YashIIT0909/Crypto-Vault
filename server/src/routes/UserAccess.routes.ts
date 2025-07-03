import express from 'express';
import { UserAccessController, GetUsersController } from '../controllers/UserAccessController';
const router = express.Router();

router.post("/grant-user-access", UserAccessController);
router.get("/vault/:vaultId/users", GetUsersController)


export default router;