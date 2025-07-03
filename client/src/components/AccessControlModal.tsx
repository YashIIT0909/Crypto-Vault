import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, User, Calendar, Trash2, Plus, UserPlus } from 'lucide-react';
import type { Vault, GroupAccess, UserAccess } from '../types';
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
    const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');
    const [newUserAddress, setNewUserAddress] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [groupMembers, setGroupMembers] = useState<string[]>(['']);
    const [expirationDate, setExpirationDate] = useState('');
    const [loading, setLoading] = useState(false);
    const { contract } = useWallet();

    // Mock data with state management
    const [userAccess, setUserAccess] = useState<UserAccess[]>([]);

    const [groupAccess, setGroupAccess] = useState<GroupAccess[]>([
        {
            groupId: '1',
            groupName: 'Family',
            members: ['0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222'],
            expiresAt: new Date('2024-06-30'),
        },
        {
            groupId: '2',
            groupName: 'Work Team',
            members: ['0x3333333333333333333333333333333333333333'],
        },
    ]);

    // Fetch initial user access data when the modal opens
    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen, vault.id]);

    const fetchUsers = async () => {
        const res = await axios.get(`http://localhost:8000/api/vault/${vault.id}/users`)

        const users: UserAccess[] = res.data.allowedUsers.map((user: any) => ({
            userAddress: user.userAddress,
            grantedAt: new Date(),
            expiresAt: user.expiresAt ? new Date(user.expiresAt) : undefined,
        }));

        setUserAccess(users);

    }

    const handleGrantUserAccess = async () => {
        if (!newUserAddress.trim()) {
            toast.error('Please enter a valid address');
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
            const res = await axios.post('http://localhost:8000/api/grant-user-access', {
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

    const addMemberField = () => {
        setGroupMembers(prev => [...prev, '']);
    };

    const removeMemberField = (index: number) => {
        if (groupMembers.length > 1) {
            setGroupMembers(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateMemberAddress = (index: number, address: string) => {
        setGroupMembers(prev => prev.map((member, i) => i === index ? address : member));
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            toast.error('Please enter a group name');
            return;
        }

        // Filter out empty member addresses
        const validMembers = groupMembers.filter(member => member.trim() !== '');

        if (validMembers.length === 0) {
            toast.error('Please add at least one member to the group');
            return;
        }

        // Check for duplicate addresses
        const uniqueMembers = [...new Set(validMembers.map(addr => addr.toLowerCase()))];
        if (uniqueMembers.length !== validMembers.length) {
            toast.error('Duplicate member addresses found');
            return;
        }

        // Check if group already exists
        if (groupAccess.some(group => group.groupName.toLowerCase() === newGroupName.toLowerCase())) {
            toast.error('Group with this name already exists');
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newGroup: GroupAccess = {
                groupId: (groupAccess.length + 1).toString(),
                groupName: newGroupName,
                members: validMembers,
                expiresAt: expirationDate ? new Date(expirationDate) : undefined,
            };

            setGroupAccess(prev => [...prev, newGroup]);
            toast.success('Group created successfully!');
            setNewGroupName('');
            setGroupMembers(['']);
            setExpirationDate('');
        } catch (error) {
            toast.error('Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeUserAccess = async (userAddress: string) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            setUserAccess(prev => prev.filter(user => user.userAddress !== userAddress));
            toast.success('User access revoked successfully');
        } catch (error) {
            toast.error('Failed to revoke access');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeGroupAccess = async (groupId: string) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            setGroupAccess(prev => prev.filter(group => group.groupId !== groupId));
            toast.success('Group access revoked successfully');
        } catch (error) {
            toast.error('Failed to revoke group access');
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
                        <div className="flex p-1 mb-6 space-x-1 rounded-lg bg-white/10">
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
                        </div>

                        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                            {activeTab === 'users' ? (
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
                            ) : (
                                <div className="space-y-6">
                                    {/* Create Group */}
                                    <div className="p-4 rounded-lg bg-white/5">
                                        <h3 className="mb-4 text-lg font-semibold text-white">
                                            Create New Group
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                                    Group Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newGroupName}
                                                    onChange={(e) => setNewGroupName(e.target.value)}
                                                    placeholder="Enter group name"
                                                    className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                                />
                                            </div>

                                            {/* Group Members */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium text-gray-300">
                                                        Group Members
                                                    </label>
                                                    <button
                                                        onClick={addMemberField}
                                                        className="flex items-center gap-1 px-3 py-1 text-sm text-orange-400 transition-colors rounded-lg bg-orange-600/20 hover:bg-orange-600/30"
                                                        disabled={loading}
                                                    >
                                                        <UserPlus className="w-3 h-3" />
                                                        Add Member
                                                    </button>
                                                </div>
                                                <div className="space-y-2 overflow-y-auto max-h-40">
                                                    {groupMembers.map((member, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={member}
                                                                onChange={(e) => updateMemberAddress(index, e.target.value)}
                                                                placeholder="0x..."
                                                                className="flex-1 px-4 py-2 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                                            />
                                                            {groupMembers.length > 1 && (
                                                                <button
                                                                    onClick={() => removeMemberField(index)}
                                                                    className="p-2 text-red-400 transition-colors rounded-lg hover:bg-red-500/20"
                                                                    disabled={loading}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
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
                                                onClick={handleCreateGroup}
                                                disabled={loading || !newGroupName.trim()}
                                                className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? <LoadingSpinner size="sm" color="text-white" /> : <Plus className="w-4 h-4" />}
                                                Create Group
                                            </button>
                                        </div>
                                    </div>

                                    {/* Group Access List */}
                                    <div className="p-4 rounded-lg bg-white/5">
                                        <h3 className="mb-4 text-lg font-semibold text-white">
                                            Group Access ({groupAccess.length})
                                        </h3>
                                        <div className="space-y-3">
                                            <AnimatePresence>
                                                {groupAccess.map((group, index) => (
                                                    <motion.div
                                                        key={group.groupId}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex items-center justify-between p-3 rounded-lg bg-white/10"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Users className="w-5 h-5 text-orange-400" />
                                                            <div>
                                                                <p className="font-medium text-white">{group.groupName}</p>
                                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                                    <span>{group.members.length} members</span>
                                                                    {group.expiresAt && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="w-3 h-3" />
                                                                            Expires: {formatDate(group.expiresAt)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {/* Show member addresses */}
                                                                <div className="mt-1 text-xs text-gray-500">
                                                                    {group.members.slice(0, 2).map(member => formatAddress(member)).join(', ')}
                                                                    {group.members.length > 2 && ` +${group.members.length - 2} more`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRevokeGroupAccess(group.groupId)}
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
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}