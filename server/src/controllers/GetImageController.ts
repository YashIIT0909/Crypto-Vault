import { Request, Response, NextFunction } from "express";
import User from "../models/User.models";
import Vault from "../models/Vault.models";
import Image from "../models/Image.models";
import { asyncHandler } from "../utils/asyncHandler";
import { PinataSDK } from "pinata";
import axios from "axios";

async function fetchImageFromPinata(ipfsHash: string): Promise<any> {
    const PINATA_GATEWAY = `https://${process.env.PINATA_GATEWAY}/ipfs/`
    const res = await axios.get(`${PINATA_GATEWAY}${ipfsHash}`, { responseType: 'stream' })
    return res.data;
}

export const GetImageMetadataController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { vaultId, ipfsHash } = req.params;

        if (!vaultId || !ipfsHash) {
            res.status(400).json({ error: "Vault ID and IPFS hash are required." });
            return;
        }

        const vault = await Vault.findOne({ vaultId });
        if (!vault) {
            res.status(404).json({ error: "Vault not found." });
            return
        }

        const image = await Image.findOne({ vault: vault._id, ipfsHash });

        if (!image) {
            res.status(404).json({ error: "Image not found." });
            return;
        }

        res.status(200).json({
            id: image._id,
            filename: image.imageName,
            size: image.imageSize,
            mimeType: image.mimeType,
            uploadedAt: image.createdAt,
            ipfsHash: image.ipfsHash
        });



    } catch (error) {
        console.error("Error fetching image metadata:", error);
        res.status(500).json({ error: "Failed to fetch image metadata." });


    }
});

export const GetImageDataController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ipfsHash } = req.params;

        if (!ipfsHash) {
            res.status(400).json({ error: "IPFS hash is required." });
            return;
        }

        const imageData = await fetchImageFromPinata(ipfsHash);

        if (!imageData) {
            res.status(404).json({ error: "Image not found on IPFS." });
            return;
        }

        res.setHeader('Content-Type', 'application/octet-stream');
        imageData.pipe(res);

    } catch (error) {
        console.error("Error fetching image data:", error);
        res.status(500).json({ error: "Failed to fetch image data." });
    }
});