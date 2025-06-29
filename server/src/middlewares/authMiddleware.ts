import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User.models";
import { asyncHandler } from "../utils/asyncHandler";
// Extend Express Request interface to include 'user'
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

export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ error: "Unauthorized access" });
        return
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as { userAddress: string };
        const user = await User.findOne({ userAddress: decodedToken.userAddress }).select("-createdAt -updatedAt -__v ");
        if (!user) {
            res.status(401).json({ error: "User not found" });
            return
        }
        req.user = {
            userAddress: user.userAddress,
            encryptedKey: user.encryptedKey ?? undefined
        };
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ error: "Invalid or expired token" });
    }
});