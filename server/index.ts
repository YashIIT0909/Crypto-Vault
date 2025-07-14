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
    origin: process.env.CORS_ORIGIN, // Default to localhost if not set
    credentials: true, // This allows setting cookies and headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Crypto Vault Backend</title>
            <style>
                body {
                    background: linear-gradient(135deg, #232526 0%, #414345 100%);
                    color: #fff;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    background: rgba(30, 30, 30, 0.85);
                    padding: 2rem 3rem;
                    border-radius: 18px;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                    text-align: center;
                }
                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    letter-spacing: 2px;
                }
                p {
                    font-size: 1.2rem;
                    margin-bottom: 0.5rem;
                }
                a {
                    color: #00e6d0;
                    text-decoration: none;
                    font-weight: bold;
                    transition: color 0.2s;
                }
                a:hover {
                    color: #fff;
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Crypto Vault Backend Server</h1>
                <p>This is the backend server for Crypto Vault.</p>
                <p>Please visit the <a href="https://crypto-vault-6w31.onrender.com" target="_blank">Crypto Vault Frontend</a> to use the application.</p>
            </div>
        </body>
        </html>
    `);
});

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