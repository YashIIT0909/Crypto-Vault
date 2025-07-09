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
        const existingAccess = vault.allowedUsers.find((u) => u.user.toString() === user._id.toString());

        if (existingAccess) {
            res.status(400).json({ error: 'User already has access to this vault' });
            return;
        }
        // Add the user to the allowedUsers array
        vault.allowedUsers.push({
            user: user._id,
            expiresAt: expiresAt ? new Date(expiresAt) : null
        });
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

        const vaultUsers = await Vault.aggregate([
            { $match: { vaultId } },
            { $unwind: "$allowedUsers" },
            {
                $match: {
                    $or: [
                        { "allowedUsers.expiresAt": { $exists: false } },
                        { "allowedUsers.expiresAt": null },
                        { "allowedUsers.expiresAt": { $gt: new Date() } }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "allowedUsers.user",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" },
            {
                $project: {
                    _id: 0,
                    user: "$userInfo",
                    expiresAt: "$allowedUsers.expiresAt"
                }
            }
        ]);

        res.status(200).json({ allowedUsers: vaultUsers });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

export const RevokeUserAccessController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { vaultId, userAddress } = req.body;

        if (!vaultId || !userAddress) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const user = await User.findOne({ userAddress: userAddress.toLowerCase() });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const vault = await Vault.findOneAndUpdate(
            { vaultId },
            { $pull: { allowedUsers: { user: user._id } } },
            { new: true }
        );


        if (!vault) {
            res.status(404).json({ error: 'Vault not found' });
            return;
        }


        res.status(200).json({ message: 'Access revoked successfully' });

    } catch (error) {
        console.error('Error revoking access:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})