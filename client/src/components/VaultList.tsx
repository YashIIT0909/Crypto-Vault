import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Image, Users, Calendar, Lock, Unlock, Search, Filter, ChevronLeft, ChevronRight, SortAsc, SortDesc, Plus, Sparkles } from 'lucide-react';
import type { Vault } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { useWallet } from '../hooks/useWallet';
import axios from 'axios';

interface VaultListProps {
    selectedVault: Vault | null;
    onSelectVault: (vault: Vault) => void;
    onCreateVault?: () => void;
    refreshTrigger?: boolean; // Optional prop to trigger refresh
}

export function VaultList({ selectedVault, onSelectVault, onCreateVault, refreshTrigger }: VaultListProps) {
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'images'>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const vaultsPerPage = 4;
    const { address } = useWallet()

    // Extended mock vaults data with more entries
    useEffect(() => {
        setLoading(true);

        const fetchVaults = async () => {
            if (!address) return;

            try {
                const res = await axios.get(`http://localhost:8000/api/vault/${address}`);
                console.log("Fetched vaults:", res.data.vaults);
                const fetchedVaults = res.data.vaults.map((v: any) => ({
                    ...v,
                    id: v.vaultId,
                    name: v.vaultName, // Add this alias
                    allowedUsersCount: v.allowedUsers?.length || 0,
                }));
                setVaults(fetchedVaults);
            } catch (error) {
                console.error("Error fetching vaults:", error);
            }
        };

        fetchVaults();

        setLoading(false);
    }, [address, refreshTrigger]);

    // Filter and sort vaults
    const filteredAndSortedVaults = useMemo(() => {
        let filtered = vaults.filter(vault =>
            vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vault.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'images':
                    return b.imageCount - a.imageCount;
                default:
                    return 0;
            }
        });


        return filtered;
    }, [vaults, searchTerm, sortBy]);

    // Pagination logic
    const totalPages = Math.ceil(filteredAndSortedVaults.length / vaultsPerPage);
    const startIndex = (currentPage - 1) * vaultsPerPage;
    const endIndex = startIndex + vaultsPerPage;
    const currentVaults = filteredAndSortedVaults.slice(startIndex, endIndex);

    // Reset to first page when search or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy]);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const getSortIcon = () => {
        switch (sortBy) {
            case 'newest':
            case 'images':
                return <SortDesc className="w-4 h-4" />;
            case 'oldest':
            case 'name':
                return <SortAsc className="w-4 h-4" />;
            default:
                return <Filter className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 border bg-white/10 backdrop-blur-sm border-white/20 rounded-xl"
            >
                <div className="flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-gray-300">Loading your vaults...</span>
                </div>
            </motion.div>
        );
    }

    // Show empty state when no vaults exist at all
    if (vaults.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative p-8 overflow-hidden border bg-white/10 backdrop-blur-sm border-white/20 rounded-xl"
            >
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-purple-400/20"
                            animate={{
                                x: [0, 50, 0],
                                y: [0, -50, 0],
                                opacity: [0.2, 0.6, 0.2],
                            }}
                            transition={{
                                duration: 3 + i,
                                repeat: Infinity,
                                delay: i * 0.5,
                            }}
                            style={{
                                left: `${10 + i * 15}%`,
                                top: `${20 + i * 10}%`,
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 py-16 text-center">
                    {/* Icon with gradient background */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        className="p-6 mx-auto mb-8 border rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 w-fit border-purple-500/30"
                    >
                        <Shield className="w-16 h-16 text-purple-400" />
                    </motion.div>

                    {/* Main heading */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center justify-center gap-2 mb-4 text-3xl font-bold text-white"
                    >
                        Welcome to CryptoVault
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="max-w-md mx-auto mb-8 text-lg leading-relaxed text-gray-300"
                    >
                        Create your first secure vault to start storing and protecting your valuable images with blockchain technology.
                    </motion.p>

                    {/* Features list */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="grid max-w-2xl grid-cols-1 gap-4 mx-auto mb-8 sm:grid-cols-3"
                    >
                        {[
                            { icon: Lock, text: 'End-to-End Encryption' },
                            { icon: Shield, text: 'Blockchain Security' },
                            { icon: Users, text: 'Access Control' },
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.text}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.9 + index * 0.1 }}
                                className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-white/5 border-white/10"
                            >
                                <feature.icon className="w-6 h-6 text-purple-400" />
                                <span className="text-sm font-medium text-gray-300">{feature.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Create vault button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onCreateVault}
                        className="flex items-center gap-3 px-8 py-4 mx-auto font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl hover:shadow-purple-500/25"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Vault
                    </motion.button>

                    {/* Additional info */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                        className="mt-6 text-sm text-gray-500"
                    >
                        Your images will be encrypted and stored securely on IPFS
                    </motion.p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 border bg-white/10 backdrop-blur-sm border-white/20 rounded-xl"
        >
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 mb-6 lg:flex-row lg:items-center">
                <div>
                    <h2 className="flex items-center gap-2 mb-2 text-2xl font-bold text-white">
                        <Shield className="w-6 h-6 text-purple-400" />
                        Your Vaults
                    </h2>
                    <p className="text-gray-400">
                        {filteredAndSortedVaults.length} vault{filteredAndSortedVaults.length !== 1 ? 's' : ''} found
                        {searchTerm && ` for "${searchTerm}"`}
                    </p>
                </div>

                {/* Search and Sort Controls */}
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                            type="text"
                            placeholder="Search vaults..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:w-64"
                        />
                    </div>

                    {/* Sort */}
                    <div className="relative">

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name' | 'images')}
                            className="relative w-full py-2 pl-4 pr-10 text-white border rounded-lg appearance-none cursor-pointer bg-white/10 border-white/20 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name">Name A-Z</option>
                            <option value="images">Most Images</option>
                        </select>
                        <div className="absolute transform -translate-y-1/2 pointer-events-none right-3 top-1/2">
                            {getSortIcon()}
                        </div>
                    </div>


                </div>
            </div>

            {/* Vaults List */}
            <div className="mb-6 space-y-4">
                <AnimatePresence mode="wait">
                    {currentVaults.length === 0 ? (
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-16 text-center"
                        >
                            <Search className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                            <p className="mb-2 text-lg text-gray-400">
                                No vaults match your search
                            </p>
                            <p className="mb-6 text-sm text-gray-500">
                                Try adjusting your search terms or create a new vault
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onCreateVault}
                                className="flex items-center gap-2 px-6 py-3 mx-auto font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl hover:shadow-purple-500/25"
                            >
                                <Plus className="w-4 h-4" />
                                Create New Vault
                            </motion.button>
                        </motion.div>
                    ) : (
                        currentVaults.map((vault, index) => (
                            <motion.div
                                key={vault.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.01 }}
                                onClick={() => onSelectVault(vault)}
                                className={`cursor-pointer p-6 rounded-xl border transition-all duration-200 ${selectedVault?.id === vault.id
                                    ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50 shadow-lg shadow-purple-500/25'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {vault.isPublic ? (
                                            <Unlock className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <Lock className="w-5 h-5 text-purple-400" />
                                        )}
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">
                                                {vault.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-300">
                                                {vault.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(vault.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Image className="w-4 h-4" />
                                            <span>{vault.imageCount} images</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Users className="w-4 h-4" />
                                            <span>{vault.allowedUsersCount + 1} users</span>
                                        </div>
                                    </div>
                                    {selectedVault?.id === vault.id && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-3 h-3 bg-purple-400 rounded-full"
                                        />
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between pt-4 border-t border-white/10"
                >
                    <div className="text-sm text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedVaults.length)} of {filteredAndSortedVaults.length} vaults
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${currentPage === 1
                                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                : 'bg-white/10 hover:bg-white/20 text-white hover:scale-105'
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1 mx-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg font-medium transition-all duration-200 ${currentPage === page
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                        : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${currentPage === totalPages
                                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                : 'bg-white/10 hover:bg-white/20 text-white hover:scale-105'
                                }`}
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}