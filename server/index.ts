import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./src/db/connect";
import cookieParser from "cookie-parser";

import vaultRoute from "./src/routes/Vault.routes";
import authenticationRoute from "./src/routes/Authentication.routes";
import storekeyRoute from "./src/routes/storekey.routes";
import getkeyRoute from "./src/routes/GetKey.routes";
import uploadimageRoute from "./src/routes/UploadImage.routes";
import getimageRoute from "./src/routes/GetImage.routes";
import userAccessRoute from "./src/routes/UserAccess.routes";


const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true, // This allows setting cookies and headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", authenticationRoute);
app.use("/api", storekeyRoute);
app.use("/api", vaultRoute);
app.use("/api", getkeyRoute);
app.use("/api", uploadimageRoute);
app.use("/api", getimageRoute);
app.use("/api", userAccessRoute);


async function serverStart() {
    try {
        const MONGO_URI = process.env.MONGODB_URL;
        if (!MONGO_URI) {
            throw new Error("Missing MONGODB_URL in environment variables");
        }
        await connectDB(MONGO_URI);
        console.log("Connected to MongoDB");

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.log(error);
    }


}

serverStart()