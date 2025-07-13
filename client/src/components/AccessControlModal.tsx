import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, User, Calendar, Trash2, Plus, } from 'lucide-react';
import type { Vault, UserAccess } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useWallet } from '../hooks/useWallet';

interface AccessControlModalProps {
    isOpen: boolean;
    onClose: () => void;
    vault: Vault;
}

export function AccessControlModal({ isOpen, onClose, vault }: AccessControlModalProps) {
    // const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');
    const [newUserAddress, setNewUserAddress] = useState('');
    // const [newGroupName, setNewGroupName] = useState('');
    // const [groupMembers, setGroupMembers] = useState<string[]>(['']);
    const [expirationDate, setExpirationDate] = useState('');
    const [loading, setLoading] = useState(false);
    const { contract, address } = useWallet();

    // Mock data with state management
    const [userAccess, setUserAccess] = useState<UserAccess[]>([]);



    // Fetch initial user access data when the modal opens
    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen, vault.id]);

    const fetchUsers = async () => {
        const res = await axios.get(`${process.env.VITE_API_URL}/api/vault/${vault.id}/users`)

        const users: UserAccess[] = res.data.allowedUsers.filter((entry: any) =>
            !entry.expiresAt || new Date(entry.expiresAt) > new Date() // Filter out expired users
        )
            .map((entry: any) => ({
                userAddress: entry.user.userAddress,
                grantedAt: new Date(), // Replace with real grantedAt if available
                expiresAt: entry.expiresAt ? new Date(entry.expiresAt) : undefined,
            }));

        setUserAccess(users);

    }

    const handleGrantUserAccess = async () => {
        if (!newUserAddress.trim()) {
            toast.error('Please enter a valid address');
            return;
        }

        if (newUserAddress.toLowerCase() === address?.toLowerCase()) {
            toast.error('You cannot grant access to your own address');
            return;
        }

        // Check if user already has access
        if (userAccess.some(user => user.userAddress.toLowerCase() === newUserAddress.toLowerCase())) {
            toast.error('User already has access to this vault');
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            const res = await axios.post(`${process.env.VITE_API_URL}/api/grant-user-access`, {
                vaultId: vault.id,
                userAddress: newUserAddress,
                expiresAt: expirationDate ? new Date(expirationDate) : undefined,
            });

            if (res.status !== 200) {
                throw new Error('Failed to grant access');
            }

            // convert the expiration date to a number to send to the contract
            const expiresAt = expirationDate ? new Date(expirationDate).getTime() : 0;

            if (!contract) {
                toast.error('Contract not initialized. Please connect your wallet.');
                setLoading(false);
                return;
            }

            const tx = await contract.grantAccess(vault.id, newUserAddress, expiresAt);
            await tx.wait();


            await fetchUsers();

            toast.success('Access granted successfully!');
            setNewUserAddress('');
            setExpirationDate('');
        } catch (error) {
            toast.error('Failed to grant access');
        } finally {
            setLoading(false);
        }
    };



    const handleRevokeUserAccess = async (userAddress: string) => {
        setLoading(true);
        try {

            const res = await axios.post(`${process.env.VITE_API_URL}/api/revoke-user-access`, {
                vaultId: vault.id,
                userAddress,
            });

            if (res.status !== 200) {
                throw new Error('Failed to revoke access');
            }

            // call the contract to revoke access
            if (!contract) {
                toast.error('Contract not initialized. Please connect your wallet.');
                setLoading(false);
                return;
            }

            const tx = await contract.revokeAccess(vault.id, userAddress);
            await tx.wait();


            setUserAccess(prev => prev.filter(user => user.userAddress !== userAddress));
            toast.success('User access revoked successfully');
        } catch (error) {
            toast.error('Failed to revoke access');
        } finally {
            setLoading(false);
        }
    };


    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Users className="w-6 h-6 text-orange-400" />
                                <h2 className="text-xl font-bold text-white">
                                    Manage Access - {vault.name}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 transition-colors rounded-lg hover:bg-white/10"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        {/* <div className="flex p-1 mb-6 space-x-1 rounded-lg bg-white/10">
                            {[
                                { id: 'users', label: 'Users', icon: User },
                                { id: 'groups', label: 'Groups', icon: Users },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'users' | 'groups')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                                        : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div> */}

                        <div className="space-y-6 max-h-[60vh] overflow-y-auto">

                            {/* eslint-disable-next-line react/jsx-no-undef */}
                            <div className="space-y-6">
                                {/* Grant User Access */}
                                <div className="p-4 rounded-lg bg-white/5">
                                    <h3 className="mb-4 text-lg font-semibold text-white">
                                        Grant User Access
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-300">
                                                User Address
                                            </label>
                                            <input
                                                type="text"
                                                value={newUserAddress}
                                                onChange={(e) => setNewUserAddress(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-300">
                                                Expiration Date (Optional)
                                            </label>
                                            <input
                                                type="date"
                                                value={expirationDate}
                                                onChange={(e) => setExpirationDate(e.target.value)}
                                                className="w-full px-4 py-3 text-white border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                            />
                                        </div>
                                        <button
                                            onClick={handleGrantUserAccess}
                                            disabled={loading || !newUserAddress.trim()}
                                            className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? <LoadingSpinner size="sm" color="text-white" /> : <Plus className="w-4 h-4" />}
                                            Grant Access
                                        </button>
                                    </div>
                                </div>

                                {/* User Access List */}
                                <div className="p-4 rounded-lg bg-white/5">
                                    <h3 className="mb-4 text-lg font-semibold text-white">
                                        Current User Access ({userAccess.length})
                                    </h3>
                                    <div className="space-y-3">
                                        <AnimatePresence>
                                            {userAccess.map((user, index) => (
                                                <motion.div
                                                    key={user.userAddress}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-white/10"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <User className="w-5 h-5 text-orange-400" />
                                                        <div>
                                                            <p className="font-medium text-white">
                                                                {formatAddress(user.userAddress)}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                                <span>Granted: {formatDate(user.grantedAt)}</span>
                                                                {user.expiresAt && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" />
                                                                        Expires: {formatDate(user.expiresAt)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRevokeUserAccess(user.userAddress)}
                                                        className="p-2 text-red-400 transition-colors rounded-lg hover:bg-red-500/20"
                                                        disabled={loading}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}