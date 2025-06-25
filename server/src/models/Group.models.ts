import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    groupId: {
        type: String,
        required: true,
        unique: true
    },
    groupName: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    vaults: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vault"
    }],
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);
export default Group;