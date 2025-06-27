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

export const GetVaultController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { address } = req.params;

        if (!address) {
            res.status(400).json({ error: "Address is required" });
            return;
        }

        const user = await User.findOne({ userAddress: address.toLowerCase() });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const vaults = await Vault.find({ owner: user._id });

        if (!vaults || vaults.length === 0) {
            res.status(404).json({ error: "No vaults found for this user" });
            return
        }

        res.status(200).json({ vaults });
    } catch (error) {
        console.error("Error fetching vaults:", error);
        res.status(500).json({ error: "Failed to fetch vaults" });
    }
});
