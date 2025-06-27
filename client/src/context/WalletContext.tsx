import React, { createContext, useContext, useState } from 'react';
import type { WalletState } from '../types';


interface WalletContextType {
    wallet: WalletState;
    setWallet: React.Dispatch<React.SetStateAction<WalletState>>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wallet, setWallet] = useState<WalletState>({
        address: null,
        isConnected: false,
        isConnecting: false,
        error: null,
        signer: undefined,
        contract: undefined,
    });

    return (
        <WalletContext.Provider value={{ wallet, setWallet }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};
