import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.models';
import Vault from '../models/Vault.models';

export const UserAccessController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { vaultId, userAddress, expiresAt } = req.body;

        if (!vaultId || !userAddress) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const user = await User.findOne({ userAddress: userAddress.toLowerCase() });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const vault = await Vault.findOne({ vaultId });
        if (!vault) {
            res.status(404).json({ error: 'Vault not found' });
            return;
        }
        // Check if the user already has access
        const existingAccess = vault.allowedUsers.find((u) => u.toString() === user._id.toString());

        if (existingAccess) {
            res.status(400).json({ error: 'User already has access to this vault' });
            return;
        }
        // Add the user to the allowedUsers array
        vault.allowedUsers.push(user._id);
        await vault.save();

        res.status(200).json({ message: 'Access granted successfully' });

    } catch (error) {
        console.error('Error granting access:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
})

export const GetUsersController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { vaultId } = req.params;

        if (!vaultId) {
            res.status(400).json({ error: 'Vault ID is required' });
            return;
        }

        const vault = await Vault.findOne({ vaultId });
        if (!vault) {
            res.status(404).json({ error: 'Vault not found' });
            return;
        }

        const allowedUsers = await User.find({ _id: { $in: vault.allowedUsers } });

        res.status(200).json({ allowedUsers });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})