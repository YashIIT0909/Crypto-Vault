import { Request, Response, NextFunction } from "express";
import User from "../models/User.models";
import Vault from "../models/Vault.models";
import Image from "../models/Image.models";
import { asyncHandler } from "../utils/asyncHandler";
import { PinataSDK } from "pinata";

export const UploadImageController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const file = req.file;
        const { originalName, originalSize, vaultId } = req.body;

        if (!file || !vaultId) {
            res.status(400).json({ error: 'Missing file or vault' });
            return;
        }

        const vault = await Vault.findOne({ vaultId: vaultId });

        if (!vault) {
            res.status(400).json({ error: "Vault not found" });
            return;
        }

        const pinata = new PinataSDK({
            pinataJwt: process.env.PINATA_JWT,
            pinataGateway: process.env.PINATA_GATEWAY,
        });

        const resPinata = await pinata.upload.public.json({ file });

        const image = await Image.create({
            imageName: originalName,
            imageSize: originalSize,
            vault: vault._id,
            mimeType: file.mimetype,
            ipfsHash: resPinata.cid,
        })

        res.status(200).json({ message: "Image created successfully", image, resPinata })

    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ error: "Failed to upload image" });

    }
});
