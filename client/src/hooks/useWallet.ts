import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import type { WalletState } from '../types/index.ts';
import toast from 'react-hot-toast';
// import { encryptSymmetricKeyWithPublicKey } from '../utils/encryption.ts';
import axios from 'axios';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export function useWallet() {
    const [wallet, setWallet] = useState<WalletState>({
        address: null,
        isConnected: false,
        isConnecting: false,
        error: null,
    });

    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            toast.error('MetaMask is not installed!');
            return;
        }

        try {
            setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);
            const address = accounts[0];
            const signer = await provider.getSigner();
            const message = `Welcome to our DApp! Please sign this message to connect your wallet.`;
            const signature = await signer.signMessage(message);

            const res = await axios.post("http://localhost:3000/api/authentication", {
                userAddress: address,
                signature: signature
            })
            console.log(res.data);

            const { encryptedKey } = res.data;

            if (!encryptedKey) {
                // 1. Generate a symmetric key
                const symmetricKey = crypto.getRandomValues(new Uint8Array(32));
                const symmetricKeyString = String.fromCharCode(...symmetricKey);
                const symmetricKeyBase64 = btoa(unescape(encodeURIComponent(symmetricKeyString)));

                const publicKey = await window.ethereum.request({
                    method: 'eth_getEncryptionPublicKey',
                    params: [address],
                });
                // 2. Encrypt the key with MetaMask public key
                // const encrypted = await encryptSymmetricKeyWithPublicKey(address, symmetricKeyBase64);
                console.log("Sending to backend:", { publicKey, symmetricKeyBase64 });

                // 3. Send encrypted key to server to store it
                const res = await axios.post("http://localhost:3000/api/storekey", {
                    userAddress: address,
                    symmetricKey: symmetricKeyBase64,
                    publicKey: publicKey,
                });
                console.log("Server response:", res.data);
            }




            if (accounts.length > 0) {
                setWallet({
                    address: accounts[0],
                    isConnected: true,
                    isConnecting: false,
                    error: null,
                });
                toast.success('Wallet connected successfully!');
            }
        } catch (error: any) {
            setWallet(prev => ({
                ...prev,
                isConnecting: false,
                error: error.message || 'Failed to connect wallet',
            }));
            toast.error('Failed to connect wallet');
        }
    }, []);

    const disconnectWallet = useCallback(() => {
        setWallet({
            address: null,
            isConnected: false,
            isConnecting: false,
            error: null,
        });
        toast.success('Wallet disconnected');
    }, []);

    useEffect(() => {
        const checkConnection = async () => {
            if (window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const accounts = await provider.listAccounts();

                    if (accounts.length > 0) {
                        setWallet(prev => ({
                            ...prev,
                            address: accounts[0].address,
                            isConnected: true,
                        }));
                    }
                } catch (error) {
                    console.error('Error checking wallet connection:', error);
                }
            }
        };

        checkConnection();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else {
                    setWallet(prev => ({
                        ...prev,
                        address: accounts[0],
                        isConnected: true,
                    }));
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners('accountsChanged');
                window.ethereum.removeAllListeners('chainChanged');
            }
        };
    }, [disconnectWallet]);

    return {
        ...wallet,
        connectWallet,
        disconnectWallet,
    };
}