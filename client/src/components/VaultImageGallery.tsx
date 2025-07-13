import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Download, Eye, Calendar, Lock, Loader2, Search, Grid, List, Upload, Sparkles, Shield, Database, Key, Unlock } from 'lucide-react';
import type { Vault, VaultImage } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ImageViewerModal } from './ImageViewerModal';
import toast from 'react-hot-toast';
import { useWallet } from '../hooks/useWallet';
import axios from 'axios';
import { fetchEncryptedKey } from '../utils/fetchEncryptedKey';
import { decryptSymmetricKey } from '../utils/decryptSymmetricKey';
import { decryptFileWithKey } from '../utils/decryptFile';

interface VaultImageGalleryProps {
    vault: Vault;
    onUploadClick?: () => void;
    refreshTrigger?: boolean;
    refreshVault?: boolean; // Optional prop to trigger vault refresh
}

export function VaultImageGallery({ vault, onUploadClick, refreshTrigger, refreshVault }: VaultImageGalleryProps) {
    const [images, setImages] = useState<VaultImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<VaultImage | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
    const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

    const { address, contract } = useWallet();
    // New state for tracking decrypted images and decryption process
    const [decryptedImages, setDecryptedImages] = useState<Record<string, string>>({});
    const [decryptingImages, setDecryptingImages] = useState<Record<string, boolean>>({});

    // Mock images data - replace with actual API calls
    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true);
            try {
                const groupId = '0x0000000000000000000000000000000000000000000000000000000000000000'; // default group

                // console.log(contract);

                if (!contract) {
                    throw new Error('Wallet contract not available');
                }
                const ipfsHashes: string[] = await contract.getImages(vault.id, groupId);
                // console.log(ipfsHashes);
                // console.log('Fetched IPFS hashes:', ipfsHashes);
                if (!ipfsHashes || ipfsHashes.length === 0) {
                    setImages([]);
                    return;
                }

                const enrichedImages = (
                    await Promise.all(
                        ipfsHashes.map(async (hash) => {
                            try {
                                // 1. Fetch metadata from your backend DB
                                const res = await axios.get(`${process.env.VITE_API_URL}/api/vaults/${vault.id}/images/${hash}`, { withCredentials: true });
                                const metadata = res.data;
                                // 2. Fetch encrypted symmetric key



                                return {
                                    id: metadata.id,
                                    vaultId: vault.id,
                                    ipfsHash: hash,
                                    filename: metadata.filename,
                                    uploadedAt: new Date(metadata.uploadedAt),
                                    thumbnail: null, // decrypted later
                                    size: metadata.size,
                                    mimeType: metadata.mimeType,
                                } as VaultImage;
                            } catch (err) {
                                console.warn(`Skipping hash ${hash}:`, err);
                                return null;
                            }
                        })
                    )
                ).filter((img): img is VaultImage => img !== null);

                setImages(enrichedImages);

            } catch (error) {
                toast.error('Failed to load images');
                console.error('Error loading images:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [vault.id, refreshTrigger, refreshVault]);

    // Function to handle image decryption
    const handleImageDecryption = async (image: VaultImage) => {
        // If already decrypted, just open the modal
        if (decryptedImages[image.id]) {
            setSelectedImage(image);
            return;
        }

        // If currently decrypting, don't start again
        if (decryptingImages[image.id]) {
            return;
        }

        // Start decryption process
        setDecryptingImages(prev => ({ ...prev, [image.id]: true }));

        try {
            // Simulate decryption process
            const vaultOwner = await axios.get(`${process.env.VITE_API_URL}/api/getVaultOwner/${vault.id}`);
            const ownerAddress = vaultOwner.data.owner.toLowerCase();
            console.log(ownerAddress);
            const encryptedKey = await fetchEncryptedKey(ownerAddress, vault.id); // Assume this function fetches the key
            if (!encryptedKey) {
                throw new Error('Failed to fetch encryption key');
            }
            console.log('Fetched encrypted key:', encryptedKey);

            if (!address) {
                throw new Error('Wallet address is not available');
            }


            const symmetricKey = await decryptSymmetricKey(encryptedKey, ownerAddress.toLowerCase()); // Decrypt the key
            if (!symmetricKey) {
                throw new Error('Failed to decrypt symmetric key');
            }
            console.log('Decrypted symmetric key:', symmetricKey);

            const imageData = await axios.get(`${process.env.VITE_API_URL}/api/images/${image.ipfsHash}`, {
                responseType: 'blob',
                withCredentials: true
            });

            if (!imageData || !imageData.data) {
                throw new Error('Failed to fetch image data');
            }
            console.log(imageData.data instanceof Blob); // should be true

            console.log('Fetched image data:', imageData.data);


            // Decrypt the image data using the symmetric key
            const decryptedBuffer = await decryptFileWithKey(imageData.data, symmetricKey);
            console.log('Decrypted image buffer:', decryptedBuffer);

            const blob = new Blob([decryptedBuffer], { type: image.mimeType || 'image/jpeg' || 'image/png' });
            console.log('Decrypted image blob:', blob);

            // Create a URL for the decrypted image
            const decryptedImageUrl = URL.createObjectURL(blob);
            console.log('Decrypted image URL:', decryptedImageUrl);


            // Simulate decryption of the image data


            // Store the decrypted image URL (in real app, this would be the actual decrypted image)
            setDecryptedImages(prev => ({ ...prev, [image.id]: decryptedImageUrl }));

            // Open the modal with the decrypted image
            setSelectedImage(image);

            toast.success('Image decrypted successfully!');
        } catch (error) {
            toast.error('Failed to decrypt image');
            console.error('Decryption error:', error);
        } finally {
            setDecryptingImages(prev => ({ ...prev, [image.id]: false }));
        }
    };

    const handleImageLoad = (imageId: string) => {
        setImageLoadingStates(prev => ({ ...prev, [imageId]: false }));
    };

    const handleImageLoadStart = (imageId: string) => {
        setImageLoadingStates(prev => ({ ...prev, [imageId]: true }));
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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredAndSortedImages = images
        .filter(image =>
            image.filename.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return b.uploadedAt.getTime() - a.uploadedAt.getTime();
                case 'oldest':
                    return a.uploadedAt.getTime() - b.uploadedAt.getTime();
                case 'name':
                    return a.filename.localeCompare(b.filename);
                default:
                    return 0;
            }
        });

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 border bg-white/10 backdrop-blur-sm border-white/20 rounded-xl"
            >
                <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner size="lg" color="text-teal-400" />
                    <p className="mt-4 text-lg font-medium text-white">Loading vault images...</p>
                    <p className="mt-2 text-sm text-gray-400">Fetching encrypted files from IPFS</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border bg-white/10 backdrop-blur-sm border-white/20 rounded-xl"
        >
            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
                <div>
                    <h2 className="flex items-center gap-2 mb-2 text-2xl font-bold text-white">
                        <Image className="w-6 h-6 text-teal-400" />
                        {vault.name} Gallery
                    </h2>
                    <p className="text-gray-400">
                        {filteredAndSortedImages.length} encrypted image{filteredAndSortedImages.length !== 1 ? 's' : ''}
                        {filteredAndSortedImages.filter(img => decryptedImages[img.id]).length > 0 && (
                            <span className="ml-2 text-teal-400">
                                • {filteredAndSortedImages.filter(img => decryptedImages[img.id]).length} decrypted
                            </span>
                        )}
                    </p>
                </div>

                {/* Controls - Only show when there are images */}
                {images.length > 0 && (
                    <div className="flex flex-col items-stretch w-full gap-3 sm:flex-row sm:items-center sm:w-auto">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="text"
                                placeholder="Search images..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-2 pl-10 pr-4 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 sm:w-48"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
                                className="flex-1 px-3 py-2 text-white border rounded-lg sm:flex-none bg-white/10 border-white/20 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name">Name A-Z</option>
                            </select>

                            {/* View Mode */}
                            <div className="flex items-center p-1 rounded-lg bg-white/10">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Images Grid/List or Empty State */}
            {images.length === 0 ? (
                /* Beautiful Empty State */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-12 overflow-hidden border rounded-xl bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-purple-500/10 border-teal-500/20"
                >
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 rounded-full bg-teal-400/30"
                                animate={{
                                    x: [0, Math.random() * 200 - 100],
                                    y: [0, Math.random() * 200 - 100],
                                    opacity: [0.3, 0.8, 0.3],
                                    scale: [1, 2, 1],
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 text-center">
                        {/* Awesome Security Flow Visualization */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center justify-center max-w-2xl gap-6 mx-auto mb-8"
                        >
                            {/* Step 1: Upload */}
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col items-center"
                            >
                                <div className="p-4 mb-2 border rounded-full bg-gradient-to-br from-blue-600/30 to-blue-700/30 border-blue-400/30">
                                    <Upload className="w-8 h-8 text-blue-400" />
                                </div>
                                <span className="text-sm font-medium text-blue-300">Upload</span>
                            </motion.div>

                            {/* Arrow 1 */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center"
                            >
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-teal-400"
                                />
                                <div className="w-2 h-2 -ml-1 transform rotate-45 bg-teal-400 rounded-full" />
                            </motion.div>

                            {/* Step 2: Encrypt */}
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col items-center"
                            >
                                <div className="p-4 mb-2 border rounded-full bg-gradient-to-br from-teal-600/30 to-teal-700/30 border-teal-400/30">
                                    <Key className="w-8 h-8 text-teal-400" />
                                </div>
                                <span className="text-sm font-medium text-teal-300">Encrypt</span>
                            </motion.div>

                            {/* Arrow 2 */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center"
                            >
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                    className="w-8 h-0.5 bg-gradient-to-r from-teal-400 to-purple-400"
                                />
                                <div className="w-2 h-2 -ml-1 transform rotate-45 bg-purple-400 rounded-full" />
                            </motion.div>

                            {/* Step 3: Store */}
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col items-center"
                            >
                                <div className="p-4 mb-2 border rounded-full bg-gradient-to-br from-purple-600/30 to-purple-700/30 border-purple-400/30">
                                    <Database className="w-8 h-8 text-purple-400" />
                                </div>
                                <span className="text-sm font-medium text-purple-300">IPFS</span>
                            </motion.div>
                        </motion.div>

                        {/* Main heading with enhanced design */}
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex items-center justify-center gap-3 mb-4 text-4xl font-bold text-white"
                        >
                            <motion.span
                                animate={{
                                    textShadow: [
                                        '0 0 20px rgba(20, 184, 166, 0.5)',
                                        '0 0 30px rgba(20, 184, 166, 0.8)',
                                        '0 0 20px rgba(20, 184, 166, 0.5)'
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                Your Vault Awaits
                            </motion.span>
                            <motion.div
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <Shield className="w-10 h-10 text-teal-400" />
                            </motion.div>
                        </motion.h3>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="max-w-2xl mx-auto mb-8 text-lg leading-relaxed text-gray-300"
                        >
                            This vault is ready to securely store your precious images. Upload your first image to begin building your encrypted gallery protected by blockchain technology.
                        </motion.p>

                        {/* Feature highlights */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="grid max-w-3xl grid-cols-1 gap-6 mx-auto mb-10 sm:grid-cols-3"
                        >
                            {[
                                {
                                    icon: Lock,
                                    title: 'End-to-End Encryption',
                                    description: 'Your images are encrypted before leaving your device',
                                    color: 'from-purple-500 to-purple-600'
                                },
                                {
                                    icon: Shield,
                                    title: 'IPFS Storage',
                                    description: 'Decentralized storage ensures permanent availability',
                                    color: 'from-teal-500 to-teal-600'
                                },
                                {
                                    icon: Eye,
                                    title: 'Private Access',
                                    description: 'Only you and authorized users can view your images',
                                    color: 'from-blue-500 to-blue-600'
                                }
                            ].map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1.0 + index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="p-6 transition-all duration-300 border bg-white/5 backdrop-blur-sm border-white/10 rounded-xl hover:bg-white/10 group"
                                >
                                    <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="mb-2 font-semibold text-white">{feature.title}</h4>
                                    <p className="text-sm text-gray-400">{feature.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Upload button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.3 }}
                            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onUploadClick}
                                className="flex items-center gap-3 px-8 py-4 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 rounded-xl hover:shadow-teal-500/25"
                            >
                                <Upload className="w-5 h-5" />
                                Upload Your First Image
                            </motion.button>

                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Lock className="w-4 h-4 text-teal-400" />
                                Encrypted & Secure
                            </div>
                        </motion.div>

                        {/* Additional info */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4 }}
                            className="max-w-md p-4 mx-auto mt-8 border rounded-lg bg-teal-500/10 border-teal-500/20"
                        >
                            <p className="flex items-center justify-center gap-2 mb-1 text-sm font-medium text-teal-300">
                                <Sparkles className="w-4 h-4" />
                                Pro Tip
                            </p>
                            <p className="text-sm text-teal-200">
                                Images are encrypted client-side and stored on IPFS for maximum security and decentralization.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            ) : filteredAndSortedImages.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-16 text-center"
                >
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <p className="mb-2 text-lg text-gray-400">
                        No images match your search
                    </p>
                    <p className="text-sm text-gray-500">
                        Try adjusting your search terms
                    </p>
                </motion.div>
            ) : (
                <div className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'space-y-4'
                }>
                    <AnimatePresence>
                        {filteredAndSortedImages.map((image, index) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01 }}
                                className={`cursor-pointer bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-200 ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'group'
                                    }`}
                                onClick={() => handleImageDecryption(image)}
                            >
                                {viewMode === 'grid' ? (
                                    <>
                                        {/* Image Container */}
                                        <div className="relative overflow-hidden aspect-square">
                                            {/* Show encrypted state or decrypted image */}
                                            {!decryptedImages[image.id] ? (
                                                /* Encrypted State with Beautiful Design */
                                                <div className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden border bg-gradient-to-br from-slate-800 via-purple-900/30 to-slate-800 border-purple-500/20">
                                                    {/* Animated background pattern with theme colors */}
                                                    <div className="absolute inset-0">
                                                        {[...Array(15)].map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="absolute w-1 h-1 rounded-full bg-purple-400/20"
                                                                animate={{
                                                                    x: [0, Math.random() * 80 - 40],
                                                                    y: [0, Math.random() * 80 - 40],
                                                                    opacity: [0.2, 0.6, 0.2],
                                                                    scale: [1, 1.5, 1],
                                                                }}
                                                                transition={{
                                                                    duration: 4 + Math.random() * 2,
                                                                    repeat: Infinity,
                                                                    delay: i * 0.2,
                                                                }}
                                                                style={{
                                                                    left: `${Math.random() * 100}%`,
                                                                    top: `${Math.random() * 100}%`,
                                                                }}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Gradient overlay for depth */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10" />

                                                    {decryptingImages[image.id] ? (
                                                        /* Decrypting Animation with Theme Colors */
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="z-10 flex flex-col items-center"
                                                        >
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                                className="p-4 mb-4 border rounded-full bg-gradient-to-br from-teal-600/20 to-blue-600/20 border-teal-400/30"
                                                            >
                                                                <Unlock className="w-8 h-8 text-teal-400" />
                                                            </motion.div>
                                                            <p className="mb-2 text-sm font-medium text-teal-300">Decrypting...</p>
                                                            <div className="w-20 h-1 overflow-hidden rounded-full bg-slate-700">
                                                                <motion.div
                                                                    className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                                                                    animate={{ x: [-80, 80] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                                                />
                                                            </div>
                                                            <p className="mt-2 text-xs text-purple-300 opacity-75">Unlocking your image...</p>
                                                        </motion.div>
                                                    ) : (
                                                        /* Encrypted State with Beautiful Theme Design */
                                                        <motion.div
                                                            whileHover={{ scale: 1.05 }}
                                                            className="z-10 flex flex-col items-center"
                                                        >
                                                            <motion.div
                                                                animate={{
                                                                    scale: [1, 1.1, 1],
                                                                    opacity: [0.8, 1, 0.8]
                                                                }}
                                                                transition={{ duration: 3, repeat: Infinity }}
                                                                className="p-4 mb-4 border rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-400/30 backdrop-blur-sm"
                                                            >
                                                                <Lock className="w-8 h-8 text-purple-300" />
                                                            </motion.div>
                                                            <motion.p
                                                                animate={{ opacity: [0.7, 1, 0.7] }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                                className="mb-1 text-sm font-medium text-purple-200"
                                                            >
                                                                🔐 Encrypted
                                                            </motion.p>
                                                            <motion.p
                                                                whileHover={{ scale: 1.05 }}
                                                                className="px-3 py-1 text-xs text-teal-300 border rounded-full bg-teal-500/10 border-teal-500/20"
                                                            >
                                                                Click to decrypt
                                                            </motion.p>

                                                            {/* Subtle pulsing border effect */}
                                                            <motion.div
                                                                animate={{
                                                                    opacity: [0.3, 0.6, 0.3],
                                                                    scale: [1, 1.02, 1]
                                                                }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                                className="absolute inset-0 border-2 rounded-lg border-purple-400/20"
                                                            />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Decrypted Image */
                                                <>
                                                    {imageLoadingStates[image.id] && (
                                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-800/50">
                                                            <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
                                                        </div>
                                                    )}
                                                    <img
                                                        src={decryptedImages[image.id]}
                                                        alt={image.filename}
                                                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                                                        onLoadStart={() => handleImageLoadStart(image.id)}
                                                        onLoad={() => handleImageLoad(image.id)}
                                                        onError={() => handleImageLoad(image.id)}
                                                    />

                                                    {/* Decrypted Overlay */}
                                                    <div className="absolute inset-0 transition-opacity duration-200 opacity-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:opacity-100">
                                                        <div className="absolute bottom-3 left-3 right-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Unlock className="w-4 h-4 text-green-400" />
                                                                    <span className="text-sm font-medium text-white">Decrypted</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedImage(image);
                                                                        }}
                                                                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                                                    >
                                                                        <Eye className="w-4 h-4 text-white" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toast.success('Download started');
                                                                        }}
                                                                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                                                    >
                                                                        <Download className="w-4 h-4 text-white" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            <h3 className="mb-1 font-medium text-white truncate">{image.filename}</h3>
                                            <div className="flex items-center justify-between text-sm text-gray-400">
                                                <span>{formatFileSize(image.size)}</span>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(image.uploadedAt)}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* List View */}
                                        <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg">
                                            {!decryptedImages[image.id] ? (
                                                /* Encrypted State in List View with Theme Colors */
                                                <div className="flex items-center justify-center w-full h-full border bg-gradient-to-br from-slate-800 via-purple-900/30 to-slate-800 border-purple-500/20">
                                                    {decryptingImages[image.id] ? (
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                            className="p-2 rounded-full bg-teal-600/20"
                                                        >
                                                            <Unlock className="w-4 h-4 text-teal-400" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            animate={{
                                                                scale: [1, 1.1, 1],
                                                                opacity: [0.7, 1, 0.7]
                                                            }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                            className="p-2 rounded-full bg-purple-600/20"
                                                        >
                                                            <Lock className="w-4 h-4 text-purple-300" />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    {imageLoadingStates[image.id] && (
                                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-800/50">
                                                            <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                                                        </div>
                                                    )}
                                                    <img
                                                        src={decryptedImages[image.id]}
                                                        alt={image.filename}
                                                        className="object-cover w-full h-full"
                                                        onLoadStart={() => handleImageLoadStart(image.id)}
                                                        onLoad={() => handleImageLoad(image.id)}
                                                        onError={() => handleImageLoad(image.id)}
                                                    />
                                                </>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="mb-1 font-medium text-white truncate">{image.filename}</h3>
                                            <div className="flex flex-col gap-2 text-sm text-gray-400 sm:flex-row sm:items-center sm:gap-4">
                                                <span>{formatFileSize(image.size)}</span>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(image.uploadedAt)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {decryptedImages[image.id] ? (
                                                        <>
                                                            <Unlock className="w-3 h-3 text-green-400" />
                                                            <span className="font-medium text-green-400">Decrypted</span>
                                                        </>
                                                    ) : decryptingImages[image.id] ? (
                                                        <>
                                                            <Loader2 className="w-3 h-3 text-teal-400 animate-spin" />
                                                            <span className="font-medium text-teal-400">Decrypting</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="w-3 h-3 text-purple-300" />
                                                            <span className="font-medium text-purple-300">Encrypted</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (decryptedImages[image.id]) {
                                                        setSelectedImage(image);
                                                    } else {
                                                        handleImageDecryption(image);
                                                    }
                                                }}
                                                className="p-2 transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                                                disabled={decryptingImages[image.id]}
                                            >
                                                <Eye className="w-4 h-4 text-white" />
                                            </button>
                                            {/* <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toast.success('Download started');
                                                }}
                                                className="p-2 transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                                                disabled={!decryptedImages[image.id]}
                                            >
                                                <Download className="w-4 h-4 text-white" />
                                            </button> */}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Image Viewer Modal */}
            {selectedImage && (
                <ImageViewerModal
                    image={selectedImage}
                    isOpen={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                    decryptedImageUrl={decryptedImages[selectedImage.id]}
                />
            )}
        </motion.div>
    );
}