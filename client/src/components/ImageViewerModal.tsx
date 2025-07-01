import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Trash2, Calendar, FileText, Lock, Loader2, AlertCircle, Unlock } from 'lucide-react';
import type { VaultImage } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import toast from 'react-hot-toast';

interface ImageViewerModalProps {
    image: VaultImage;
    isOpen: boolean;
    onClose: () => void;
    decryptedImageUrl?: string;
}

export function ImageViewerModal({ image, isOpen, onClose, decryptedImageUrl }: ImageViewerModalProps) {
    const [imageLoading, setImageLoading] = useState(true);
    const [decrypting, setDecrypting] = useState(false);
    const [localDecryptedUrl, setLocalDecryptedUrl] = useState<string | null>(decryptedImageUrl || null);

    // Only decrypt if not already decrypted
    React.useEffect(() => {
        if (isOpen && !decryptedImageUrl && !localDecryptedUrl) {
            setDecrypting(true);

            // Simulate decryption delay
            const timer = setTimeout(() => {
                setLocalDecryptedUrl(image.thumbnail ?? null); // In real app, this would be the decrypted image
                setDecrypting(false);
            }, 2000);

            return () => clearTimeout(timer);
        } else if (decryptedImageUrl) {
            setLocalDecryptedUrl(decryptedImageUrl);
            setDecrypting(false);
        }
    }, [isOpen, image, decryptedImageUrl, localDecryptedUrl]);

    const handleDownload = () => {
        toast.success('Download started');
        // In real implementation, download the decrypted image
    };

    const handleShare = () => {
        toast.success('Share link copied to clipboard');
        // In real implementation, generate secure share link
    };

    const handleDelete = () => {
        toast.success('Image deleted successfully');
        onClose();
        // In real implementation, delete from IPFS and blockchain
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-teal-600/20">
                                    {localDecryptedUrl ? (
                                        <Unlock className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <Lock className="w-5 h-5 text-teal-400" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{image.filename}</h2>
                                    <p className="text-sm text-gray-400">
                                        {localDecryptedUrl ? 'Decrypted Image Viewer' : 'Encrypted Image Viewer'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownload}
                                    className="p-2 transition-colors rounded-lg hover:bg-white/10"
                                    disabled={decrypting || !localDecryptedUrl}
                                >
                                    <Download className="w-5 h-5 text-gray-400" />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-2 transition-colors rounded-lg hover:bg-white/10"
                                    disabled={decrypting || !localDecryptedUrl}
                                >
                                    <Share2 className="w-5 h-5 text-gray-400" />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-red-400 transition-colors rounded-lg hover:bg-red-500/20"
                                    disabled={decrypting}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 transition-colors rounded-lg hover:bg-white/10"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Image Display */}
                            <div className="flex items-center justify-center flex-1 p-6 bg-black/20">
                                {decrypting ? (
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <LoadingSpinner size="lg" color="text-teal-400" />
                                        </div>
                                        <p className="mb-2 text-lg font-medium text-white">Decrypting Image...</p>
                                        <p className="text-sm text-gray-400">This may take a few moments</p>

                                        {/* Decryption Progress */}
                                        <div className="mt-6 space-y-2">
                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                                                Retrieving from IPFS
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse animation-delay-300" />
                                                Decrypting with your key
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse animation-delay-600" />
                                                Preparing for display
                                            </div>
                                        </div>
                                    </div>
                                ) : localDecryptedUrl ? (
                                    <div className="relative max-w-full max-h-full">
                                        {imageLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                                                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                                            </div>
                                        )}
                                        <img
                                            src={localDecryptedUrl}
                                            alt={image.filename}
                                            className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
                                            onLoad={() => setImageLoading(false)}
                                            onError={() => setImageLoading(false)}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                                        <p className="mb-2 text-lg font-medium text-white">Decryption Failed</p>
                                        <p className="text-sm text-gray-400">Unable to decrypt this image</p>
                                    </div>
                                )}
                            </div>

                            {/* Image Info Sidebar */}
                            <div className="flex flex-col p-6 border-l w-80 bg-white/5 border-white/10">
                                <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-white">
                                    <FileText className="w-5 h-5 text-teal-400" />
                                    Image Details
                                </h3>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-400">Filename</label>
                                        <p className="text-sm text-white break-all">{image.filename}</p>
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-400">File Size</label>
                                        <p className="text-sm text-white">{formatFileSize(image.size)}</p>
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-400">Type</label>
                                        <p className="text-sm text-white">{image.mimeType}</p>
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-400">Uploaded</label>
                                        <div className="flex items-center gap-2 text-sm text-white">
                                            <Calendar className="w-4 h-4 text-teal-400" />
                                            {formatDate(image.uploadedAt)}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-400">IPFS Hash</label>
                                        <p className="p-2 font-mono text-xs text-white break-all rounded bg-white/10">
                                            {image.ipfsHash}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-400">Encryption Status</label>
                                        <div className="flex items-center gap-2">
                                            {localDecryptedUrl ? (
                                                <>
                                                    <Unlock className="w-4 h-4 text-green-400" />
                                                    <span className="text-sm font-medium text-green-400">Decrypted</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-4 h-4 text-orange-400" />
                                                    <span className="text-sm font-medium text-orange-400">Encrypted</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 space-y-3">
                                    <button
                                        onClick={handleDownload}
                                        disabled={decrypting || !localDecryptedUrl}
                                        className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Original
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        disabled={decrypting || !localDecryptedUrl}
                                        className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Generate Share Link
                                    </button>

                                    <button
                                        onClick={handleDelete}
                                        disabled={decrypting}
                                        className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-red-400 transition-colors rounded-lg bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Image
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}