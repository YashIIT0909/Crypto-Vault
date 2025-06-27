import { Request, Response, NextFunction } from "express";
import User from "../models/User.models";
import Vault from "../models/Vault.models";
import { asyncHandler } from "../utils/asyncHandler";

export const CreateVaultController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { vaultId, vaultName, description, owner } = req.body;

        if (!vaultId || !vaultName || !owner) {
            res.status(400).json({ error: "Vault ID, Vault Name, and Owner are required" });
            return;
        }
        // Check if the user exists
        const user = await User.findOne({ userAddress: owner.toLowerCase() });
        if (!user) {
            res.status(400).json({ error: "User not found" });
            return;
        }
        // Create the vault
        console.log("user._id:", user._id, "typeof:", typeof user._id);

        const newVault = await Vault.create({
            vaultId,
            vaultName,
            description: description || "No Description Provided",
            owner: user._id,
        });
        res.status(200).json({
            message: "Vault created successfully",
            vault: newVault
        });
    } catch (error) {
        console.error("Error creating vault:", error);
        res.status(500).json({ error: "Failed to create vault" });
    }
});