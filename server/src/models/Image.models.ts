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
    }

}, { timestamps: true })

const Image = mongoose.model('Image', imageSchema);
export default Image;