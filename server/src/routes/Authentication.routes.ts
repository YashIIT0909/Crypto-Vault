import express from "express";
import { AuthController } from "../controllers/AuthController";


const router = express.Router();

router.post("/authentication", AuthController);

export default router;