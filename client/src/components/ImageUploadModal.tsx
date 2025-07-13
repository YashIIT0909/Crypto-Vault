import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image, AlertCircle, Trash2 } from 'lucide-react';
import type { Vault, UploadProgress } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import toast from 'react-hot-toast';
import { fetchEncryptedKey } from '../utils/fetchEncryptedKey';
import { decryptSymmetricKey } from '../utils/decryptSymmetricKey'; // Assume this function fetches the encryption key
import { useWallet } from '../hooks/useWallet';
import { encryptFileWithKey } from '../utils/encryptFile'; // Assume this function encrypts the file with the symmetric key
import axios from 'axios';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    vault: Vault;
    onImageUploaded: () => void; // Optional callback for when an image is uploaded
    onVaultCreated: () => void; // Optional callback for when a vault is created
}

export function ImageUploadModal({ isOpen, onClose, vault, onImageUploaded, onVaultCreated }: ImageUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<UploadProgress | null>(null);
    const [dragOver, setDragOver] = useState(false);



    const { address, contract } = useWallet();


    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!selectedFile && !uploading) {
            setDragOver(true);
        }
    }, [selectedFile, uploading]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        if (selectedFile || uploading) return;

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );

        if (files.length > 0) {
            setSelectedFile(files[0]); // Only take the first image
            if (files.length > 1) {
                toast.error('Only one image can be uploaded at a time');
            }
        }
    }, [selectedFile, uploading]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0 && !selectedFile && !uploading) {
            setSelectedFile(files[0]);
        }
        // Reset the input value to allow selecting the same file again if needed
        e.target.value = '';
    };

    const removeFile = () => {
        if (!uploading) {
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select an image');
            return;
        }

        setUploading(true);

        try {
            setProgress({
                stage: 'fetching key',
                progress: 0,
                message: `Fetching encryption key...`,
            });

            if (!address) {
                throw new Error('Wallet address is not available');
            }

            const encryptedKey = await fetchEncryptedKey(address, vault.id); // Assume this function fetches the key
            if (!encryptedKey) {
                throw new Error('Failed to fetch encryption key');
            }
            // console.log('Fetched encrypted key:', encryptedKey);

            setProgress({
                stage: 'decrypting key',
                progress: 10,
                message: `Decrypting key...`,
            });

            console.log(`Address: ${address}`);
            console.log("Vault", vault)

            if (!address) {
                throw new Error('Wallet address is not available');
            }

            const symmetricKey = await decryptSymmetricKey(encryptedKey, address.toLowerCase()); // Decrypt the key
            if (!symmetricKey) {
                throw new Error('Failed to decrypt symmetric key');
            }
            // console.log('Decrypted symmetric key:', symmetricKey);

            // Stage 1: Encrypting
            setProgress({
                stage: 'encrypting',
                progress: 20,
                message: `Encrypting ${selectedFile.name}...`,
            });

            const encryptedData = await encryptFileWithKey(selectedFile, symmetricKey);
            if (!encryptedData) {
                throw new Error('Failed to encrypt file');
            }
            // console.log('Encrypted file data:', encryptedData);


            // Stage 2: Uploading to IPFS
            setProgress({
                stage: 'uploading',
                progress: 40,
                message: `Uploading ${selectedFile.name} to IPFS...`,
            });


            const formData = new FormData();
            formData.append('file', encryptedData, selectedFile.name); // file name is preserved
            formData.append('vaultId', vault.id);
            formData.append('originalName', selectedFile.name);
            formData.append('originalSize', selectedFile.size.toString());

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData, {
                withCredentials: true,
            });

            if (res.status !== 200) {
                throw new Error('Failed to upload file to IPFS');
            }

            // console.log('File uploaded to IPFS:', res.data);

            // Stage 3: Saving to blockchain
            setProgress({
                stage: 'saving',
                progress: 80,
                message: `Saving ${selectedFile.name} to contract...`,
            });

            // Simulate blockchain interaction
            if (!contract) {
                throw new Error('Smart contract instance is not available');
            }
            const tx = await contract.addImageToVault(vault.id, res.data.resPinata.cid)

            await tx.wait()
            // Stage 4: Complete
            setProgress({
                stage: 'complete',
                progress: 100,
                message: 'Image uploaded successfully!',
            });

            onImageUploaded(); // Trigger refresh of images in gallery
            onVaultCreated(); // Trigger refresh of vaults if needed
            toast.success('Image uploaded successfully!');

            setTimeout(() => {
                onClose();
                setSelectedFile(null);
                setProgress(null);
            }, 1500);

        } catch (error) {
            toast.error('Upload failed. Please try again.');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleClose = () => {
        if (!uploading) {
            onClose();
            setSelectedFile(null);
            setProgress(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Image className="w-6 h-6 text-teal-400" />
                                <h2 className="text-xl font-bold text-white">
                                    Upload Image to {vault.name}
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 transition-colors rounded-lg hover:bg-white/10"
                                disabled={uploading}
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {progress ? (
                            <div className="py-12">
                                {/* Centered loading content */}
                                <div className="flex flex-col items-center justify-center space-y-6">
                                    {/* Spinner and message in same container */}
                                    <div className="flex flex-col items-center space-y-4">
                                        <LoadingSpinner size="lg" color="text-teal-400" />
                                        <p className="text-lg font-medium text-center text-white">
                                            {progress.message}
                                        </p>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full max-w-md">
                                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress.progress}%` }}
                                                className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-center text-gray-400">
                                            {progress.progress.toFixed(0)}% complete
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Drop Zone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${selectedFile
                                        ? 'border-gray-600 bg-gray-800/30 cursor-not-allowed'
                                        : dragOver
                                            ? 'border-teal-400 bg-teal-400/10'
                                            : 'border-white/30 hover:border-white/50'
                                        }`}
                                >
                                    {selectedFile ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-center">
                                                <div className="p-3 rounded-full bg-teal-600/20">
                                                    <Image className="w-8 h-8 text-teal-400" />
                                                </div>
                                            </div>
                                            <p className="font-medium text-gray-400">
                                                Image selection disabled
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Remove the current image to select a different one
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p className="mb-2 font-medium text-white">
                                                Drag and drop an image here, or click to browse
                                            </p>
                                            <p className="mb-4 text-sm text-gray-400">
                                                Supports JPG, PNG, GIF, WebP formats (Single image only)
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="file-upload"
                                                disabled={uploading || !!selectedFile}
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className={`inline-block px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200 ${uploading || selectedFile
                                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white'
                                                    }`}
                                            >
                                                Browse Files
                                            </label>
                                        </>
                                    )}
                                </div>

                                {/* Selected File Display */}
                                {selectedFile && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-lg bg-white/10"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-teal-600/20">
                                                    <Image className="w-5 h-5 text-teal-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{selectedFile.name}</p>
                                                    <p className="text-sm text-gray-400">
                                                        {formatFileSize(selectedFile.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={removeFile}
                                                disabled={uploading}
                                                className={`p-2 rounded-lg transition-colors ${uploading
                                                    ? 'text-gray-500 cursor-not-allowed'
                                                    : 'hover:bg-red-500/20 text-red-400'
                                                    }`}
                                                title="Remove image"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Warning */}
                                <div className="flex items-start gap-3 p-4 border rounded-lg bg-orange-500/10 border-orange-500/20">
                                    <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-orange-300">
                                            Single Image Upload
                                        </p>
                                        <p className="text-sm text-orange-200">
                                            Only one image can be uploaded at a time. The image will be encrypted client-side before upload for maximum security.
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 px-4 py-3 font-medium text-gray-300 transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        className="flex-1 px-4 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={uploading || !selectedFile}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Image'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}