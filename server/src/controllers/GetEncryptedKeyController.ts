import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.models';

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

        if (!req.user || !req.user.userAddress) {
            res.status(400).json({ error: 'User address is required' });
            return;
        }
        const { userAddress } = req.user;

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
