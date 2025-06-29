import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.models';

export const StoreKeyController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userAddress, encryptedKey } = req.body;

        if (!userAddress || !encryptedKey) {
            res.status(400).json({ error: 'Missing required fields: userAddress or encrypted key' });
            return;
        }


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
