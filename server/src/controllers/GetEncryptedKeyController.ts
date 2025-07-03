import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.models';
import Vault from '../models/Vault.models';

interface UserType {
    userAddress: string;
    encryptedKey?: string;

}
declare global {
    namespace Express {
        interface Request {
            user?: UserType | null;
        }
    }
}

export const GetEncryptedKeyController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.user) {
            res.status(400).json({ error: 'User address is required in req.user' });
            return;
        }
        const { userAddress, vaultId } = req.params;
        const { userAddress: reqUserAddress } = req.user;

        const allowedUser = await User.findOne({ userAddress: reqUserAddress.toLowerCase() });

        if (!allowedUser) {
            res.status(404).json({ error: 'Allowed user not found' });
            return;
        }


        if (!vaultId) {
            res.status(400).json({ error: 'Vault ID is required' });
            return;
        }
        if (!userAddress) {
            res.status(400).json({ error: 'User address is required' });
            return;
        }
        const vault = await Vault.findOne({ vaultId });
        if (!vault) {
            res.status(404).json({ error: 'Vault not found' });
            return;
        }
        // Check if the user is allowed to access the vault
        if (!vault.allowedUsers || vault.allowedUsers.length === 0) {
            res.status(403).json({
                error: 'No users have access to this vault'
            });
            return;
        }
        // Check if the user is in the allowedUsers array
        const isUserAllowed = vault.allowedUsers.some((userId) => userId.toString() === allowedUser._id.toString());
        if (!isUserAllowed) {
            res.status(403).json({ error: 'User does not have access to this vault' });
            return;
        }

        // check if the user is the owner
        const isOwner = vault.owner.toString() === allowedUser._id.toString();
        if (isOwner) {
            res.status(200).json({ encryptedKey: allowedUser.encryptedKey });
            return;
        }

        const userData = await User.findOne({ userAddress: userAddress.toLowerCase() });
        if (!userData) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({ encryptedKey: userData.encryptedKey });

    } catch (error) {
        console.error('Error in GetEncryptedKeyController:', error);
        res.status(500).json({ error: 'Could not retrieve encrypted key' });
    }
})
