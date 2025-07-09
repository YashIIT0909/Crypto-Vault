import express from 'express';
import { UserAccessController, GetUsersController, RevokeUserAccessController } from '../controllers/UserAccessController';
const router = express.Router();

router.post("/grant-user-access", UserAccessController);
router.get("/vault/:vaultId/users", GetUsersController);
router.post("/revoke-user-access", RevokeUserAccessController);

export default router;