import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { encryptSymmetricKey } from '../utils/encryption';
import User from '../models/User.models';

export const StoreKeyController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userAddress, symmetricKey, publicKey } = req.body;

        if (!symmetricKey || !userAddress || !publicKey) {
            res.status(400).json({ error: 'Missing required fields: symmetricKey, userAddress or publicKey' });
            return;
        }

        const encryptedKey = encryptSymmetricKey(publicKey, symmetricKey);

        const user = await User.findOneAndUpdate({ userAddress: userAddress },
            {
                encryptedKey: encryptedKey
            },
            {
                new: true, // Return the updated document
            })
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({ message: 'Key stored successfully', user });

    } catch (error) {
        console.error('Error in StoreKeyController:', error);
        res.status(500).json({ error: 'Key could not be stored' });

    }
})
