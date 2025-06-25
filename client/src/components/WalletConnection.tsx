
import { motion } from 'framer-motion';
import { Wallet, LogOut, User } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export function WalletConnection() {
    const { address, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (isConnected && address) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl px-3 py-2 sm:px-4 sm:py-2"
            >
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <User className="w-4 h-4 text-purple-400" />
                    <span className="text-xs sm:text-sm font-medium text-gray-200">
                        {formatAddress(address)}
                    </span>
                </div>
                <button
                    onClick={disconnectWallet}
                    className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                </button>
            </motion.div>
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 sm:px-6 sm:py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25 text-xs sm:text-base"
        >
            <Wallet className="w-3 h-3 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            <span className="sm:hidden">{isConnecting ? 'Connecting...' : 'Connect'}</span>
        </motion.button>
    );
}