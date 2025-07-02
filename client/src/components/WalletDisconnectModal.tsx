import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, AlertTriangle, Clock } from 'lucide-react';

interface WalletDisconnectedModalProps {
    isOpen: boolean;
    onReconnect: () => void;
}

export function WalletDisconnectedModal({ isOpen, onReconnect }: WalletDisconnectedModalProps) {
    const [timeLeft, setTimeLeft] = useState(10);

    useEffect(() => {
        if (isOpen) {
            setTimeLeft(10);
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md p-8 border bg-gradient-to-br from-slate-800 to-slate-900 border-red-500/30 rounded-xl"
                    >
                        {/* Timer in top right */}
                        <div className="absolute flex items-center gap-2 px-3 py-1 rounded-full top-4 right-4 bg-red-500/20">
                            <Clock className="w-4 h-4 text-red-400" />
                            <span className="font-mono text-sm text-red-400">{timeLeft}s</span>
                        </div>

                        <div className="text-center">
                            {/* Warning Icon */}
                            <div className="p-4 mx-auto mb-6 rounded-full bg-red-500/20 w-fit">
                                <AlertTriangle className="w-12 h-12 text-red-400" />
                            </div>

                            {/* Title */}
                            <h2 className="mb-4 text-2xl font-bold text-white">
                                Wallet Disconnected
                            </h2>

                            {/* Description */}
                            <p className="mb-8 leading-relaxed text-gray-300">
                                Your MetaMask wallet has been disconnected. Please reconnect your wallet to continue using the CryptoVault dashboard and access your encrypted files.
                            </p>

                            {/* Reconnect Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onReconnect}
                                className="flex items-center justify-center w-full gap-3 px-6 py-4 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl hover:shadow-purple-500/25"
                            >
                                <Wallet className="w-5 h-5" />
                                Reconnect Wallet
                            </motion.button>

                            {/* Additional Info */}
                            <p className="mt-4 text-sm text-gray-500">
                                Make sure MetaMask is installed and unlocked
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}