import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    imageName: {
        type: String,
        required: true
    },
    imageSize: {
        type: Number,
        required: true
    },
    vault: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vault',
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    ipfsHash: {
        type: String,
        required: true,
        index: true
    },

}, { timestamps: true })

const Image = mongoose.model('Image', imageSchema);
export default Image;