import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Plus } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import toast from 'react-hot-toast';
import { useWallet } from '../hooks/useWallet';
import axios from 'axios';

interface CreateVaultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVaultCreated: () => void;
}

export function CreateVaultModal({ isOpen, onClose, onVaultCreated }: CreateVaultModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [creating, setCreating] = useState(false);

    const { contract, address } = useWallet();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submit button clicked", contract);


        if (!name.trim()) {
            toast.error('Vault name is required');
            return;
        }

        if (!contract || !address) {
            toast.error('Wallet not connected');
            return;
        }

        setCreating(true);

        try {
            const tx = await contract.createVault();
            const receipt = await tx.wait();

            // console.log('Transaction receipt:', receipt);


            const vaultCreatedEvent = receipt.logs
                .map((log: { topics: ReadonlyArray<string>; data: string; }) => {
                    try {
                        return contract.interface.parseLog(log);
                    } catch (_) {
                        return null;
                    }
                })
                .find((parsed: { name: string; }) => parsed?.name === 'VaultCreated');

            // console.log('Parsed VaultCreated event:', vaultCreatedEvent);


            if (!vaultCreatedEvent) {
                throw new Error('VaultCreated event not found in transaction logs');
            }

            const vaultId = vaultCreatedEvent.args.vaultId.toString();

            // console.log('Vault ID:', vaultId);


            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/vault`, {
                vaultId: vaultId,
                vaultName: name,
                description: description,
                owner: address
            });

            // console.log('Vault created response:', res.data);


            toast.success('Vault created successfully!');
            onVaultCreated();
            onClose();
            setName('');
            setDescription('');
        } catch (error) {
            toast.error('Failed to create vault');
        } finally {
            setCreating(false);
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
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md p-6 border bg-gradient-to-br from-slate-800 to-slate-900 border-white/20 rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Shield className="w-6 h-6 text-purple-400" />
                                <h2 className="text-xl font-bold text-white">Create New Vault</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 transition-colors rounded-lg hover:bg-white/10"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                    Vault Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter vault name"
                                    className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    disabled={creating}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your vault"
                                    rows={3}
                                    className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg resize-none bg-white/10 border-white/20 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    disabled={creating}
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    disabled={creating}
                                />
                                <label htmlFor="isPublic" className="text-sm text-gray-300">
                                    Make vault publicly accessible
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 font-medium text-gray-300 transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={creating || !name.trim()}
                                >
                                    {creating ? (
                                        <LoadingSpinner size="sm" color="text-white" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    {creating ? 'Creating...' : 'Create Vault'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}