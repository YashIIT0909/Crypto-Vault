import mongoose from "mongoose";

const vaultSchema = new mongoose.Schema({
    vaultId: {
        type: String,
        required: true,
        unique: true
    },
    vaultName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: "No Description Provided"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageCount: {
        type: Number,
        default: 0
    },
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    allowedGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }]
}, { timestamps: true })

const Vault = mongoose.model("Vault", vaultSchema);
export default Vault;