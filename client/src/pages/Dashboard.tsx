import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Shield, Image, Users, Settings, User, Copy, ExternalLink } from 'lucide-react';
import { VaultList } from '../components/VaultList';
// import { VaultImageGallery } from './VaultImageGallery';
import { CreateVaultModal } from '../components/CreateVaultModal';
import { ImageUploadModal } from '../components/ImageUploadModal';
// import { AccessControlModal } from './AccessControlModal';
// import { WalletDisconnectedModal } from './WalletDisconnectedModal';
import { useWallet } from '../hooks/useWallet';
import type { Vault } from '../types';
import toast from 'react-hot-toast';

export const Dashboard = () => {
    // const { address, isConnected, connectWallet } = useWallet();
    const { address, isConnected } = useWallet();
    const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    // const [showAccessModal, setShowAccessModal] = useState(false);
    // const [showDisconnectedModal, setShowDisconnectedModal] = useState(false);
    const [wasConnected, setWasConnected] = useState(false);
    const [refreshVaults, setRefreshVaults] = useState(false);

    // Track connection state changes
    useEffect(() => {
        if (isConnected) {
            setWasConnected(true);
            // setShowDisconnectedModal(false);
        } else if (wasConnected && !isConnected) {
            // Wallet was connected but now disconnected
            // setShowDisconnectedModal(true);
            setSelectedVault(null); // Clear selected vault
        }
    }, [isConnected, wasConnected]);

    const stats = [
        {
            icon: Shield,
            label: 'Total Vaults',
            value: '12',
            color: 'from-purple-500 to-purple-600',
        },
        {
            icon: Image,
            label: 'Encrypted Images',
            value: '248',
            color: 'from-blue-500 to-blue-600',
        },
        {
            icon: Users,
            label: 'Shared Access',
            value: '34',
            color: 'from-teal-500 to-teal-600',
        },
        {
            icon: Settings,
            label: 'Active Groups',
            value: '8',
            color: 'from-orange-500 to-orange-600',
        },
    ];

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            toast.success('Address copied to clipboard');
        }
    };

    const openEtherscan = () => {
        if (address) {
            window.open(`https://etherscan.io/address/${address}`, '_blank');
        }
    };

    // const handleReconnect = async () => {
    //     try {
    //         await connectWallet();
    //     } catch (error) {
    //         toast.error('Failed to reconnect wallet');
    //     }
    // };

    // Don't render dashboard if not connected
    // if (!isConnected) {
    //     return (
    //         <WalletDisconnectedModal
    //             isOpen={showDisconnectedModal}
    //             onReconnect={handleReconnect}
    //         />
    //     );
    // }
    const handleCreateVault = () => {
        setShowCreateModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container px-6 py-8 mx-auto">
                {/* Header with Account Info */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <h1 className="mb-2 text-4xl font-bold text-white">
                                Crypto Vault Dashboard
                            </h1>
                            <p className="text-gray-400">
                                Securely manage your encrypted images with blockchain technology
                            </p>
                        </div>

                        {/* Connected Account Info */}
                        {address && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 border bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border-purple-500/20 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Connected Account</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono font-medium text-white">
                                                {formatAddress(address)}
                                            </p>
                                            <button
                                                onClick={copyAddress}
                                                className="p-1 transition-colors rounded hover:bg-white/10"
                                                title="Copy address"
                                            >
                                                <Copy className="w-3 h-3 text-gray-400" />
                                            </button>
                                            <button
                                                onClick={openEtherscan}
                                                className="p-1 transition-colors rounded hover:bg-white/10"
                                                title="View on Etherscan"
                                            >
                                                <ExternalLink className="w-3 h-3 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className="p-6 transition-all duration-200 border bg-white/10 backdrop-blur-sm border-white/20 rounded-xl hover:bg-white/15"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm text-gray-400">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-4 mb-8"
                >
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl hover:shadow-purple-500/25"
                    >
                        <Plus className="w-5 h-5" />
                        Create Vault
                    </button>
                    {selectedVault && (
                        <>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 rounded-xl hover:shadow-teal-500/25"
                            >
                                <Image className="w-5 h-5" />
                                Upload Image
                            </button>
                            {/* <button
                                onClick={() => setShowAccessModal(true)}
                                className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl hover:shadow-orange-500/25"
                            >
                                <Users className="w-5 h-5" />
                                Manage Access
                            </button> */}
                        </>
                    )}
                </motion.div>

                {/* Main Content - Single Column Layout */}
                <div className="space-y-8">
                    {/* Vault List */}
                    <VaultList
                        selectedVault={selectedVault}
                        onSelectVault={setSelectedVault}
                        onCreateVault={handleCreateVault}
                        refreshTrigger={refreshVaults}
                    />

                    {/* Vault Images */}
                    {/* {selectedVault && (
                        <VaultImageGallery vault={selectedVault} />
                    )} */}
                </div>

                {/* Modals */}
                {showCreateModal && (
                    <CreateVaultModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onVaultCreated={() => setRefreshVaults(prev => !prev)}
                    />
                )}
                {showUploadModal && selectedVault && (
                    <ImageUploadModal
                        isOpen={showUploadModal}
                        onClose={() => setShowUploadModal(false)}
                        vault={selectedVault}
                    />
                )}
                {/* {showAccessModal && selectedVault && (
                    <AccessControlModal
                        isOpen={showAccessModal}
                        onClose={() => setShowAccessModal(false)}
                        vault={selectedVault}
                    />
                )} */}

                {/* Wallet Disconnected Modal */}
                {/* <WalletDisconnectedModal
                    isOpen={showDisconnectedModal}
                    onReconnect={handleReconnect}
                /> */}
            </div>
        </div>
    );
}