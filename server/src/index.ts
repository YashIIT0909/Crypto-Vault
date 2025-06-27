import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./db/connect";
import vaultRoute from "./routes/Vault.routes";
import authenticationRoute from "./routes/Authentication.routes";
import storekeyRoute from "./routes/storekey.routes";



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api", authenticationRoute);
app.use("/api", storekeyRoute);
app.use("/api", vaultRoute);
app.use((req, res) => {
    console.log(`404 - ${req.method} ${req.originalUrl}`);
    res.status(404).send('Not found');
});



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