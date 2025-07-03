import { ethers } from "ethers";
import { Request, Response, NextFunction } from "express";
import User from "../models/User.models";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";


export const AuthController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userAddress, signature } = req.body;

        if (!signature || !userAddress) {
            res.status(400).json({ error: "Signature and user address are required" });
            return;
        }

        const message = `Welcome to our DApp! Please sign this message to connect your wallet.`;
        const signerAddress = ethers.verifyMessage(message, signature);


        if (signerAddress.toLowerCase() !== userAddress.toLowerCase()) {
            res.status(401).json({ error: "Invalid signature" });
            return;
        }
        console.log("User Address:", userAddress);

        let user = await User.findOne({ userAddress });

        if (!user) {
            user = await User.create({ userAddress });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }

        const token = jwt.sign(
            { userAddress: userAddress },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        const options = {
            httpOnly: true,
            secure: true
        }

        res.status(200)
            .cookie("token", token, options)
            .json({ message: "User created successfully", encryptedKey: user.encryptedKey || null });

    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({ error: "Authentication Failed" });
    }
});