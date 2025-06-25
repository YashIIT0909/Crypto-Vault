import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userAddress: {
        type: String,
        required: true,
        unique: true
    },
    encryptedKey: {
        type: String
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;