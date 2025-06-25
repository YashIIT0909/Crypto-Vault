import express from "express";
import cors from "cors";
import connectDB from "./db/connect";
import dotenv from 'dotenv';
dotenv.config();



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



async function serverStart() {
    try {
        const MONGO_URI = process.env.MONGODB_URL;
        if (!MONGO_URI) {
            throw new Error("Missing MONGODB_URL in environment variables");
        }
        await connectDB(MONGO_URI);
        console.log("Connected to MongoDB");

        app.listen(process.env.PORT, () => {
            console.log("Server is running on port 3000");
        });

    } catch (error) {
        console.log(error);
    }


}

serverStart()