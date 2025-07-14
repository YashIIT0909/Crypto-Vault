import { useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract/index.ts';
import axios from 'axios';
import { useWallet as useWalletContext } from '../context/WalletContext';
import { generateSymmetricKey } from '../utils/generateSymmetricKey.ts';
import { encryptSymmetricKey } from '../utils/encryptSymmetricKey.ts';
declare global {
    interface Window {
        ethereum?: any;
    }
}

export function useWallet() {
    const { wallet, setWallet } = useWalletContext();

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

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/authentication`, {
                userAddress: address,
                signature: signature
            },
                {
                    withCredentials: true,
                })
            // console.log(res.data);

            const { encryptedKey } = res.data;

            if (!encryptedKey) {
                const symKey = await generateSymmetricKey();

                // console.log("Generated symmetric key:", symKey);
                // console.log("address:", address);

                const encryptedKey = await encryptSymmetricKey(symKey, address)

                // console.log(encryptedKey);

                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/storekey`, {
                    userAddress: address,
                    encryptedKey: encryptedKey
                });
                // console.log("Server response:", res.data);
                if (res.status !== 200) {
                    throw new Error('Failed to store symmetric key on server');
                }
            }

            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                signer
            );

            setWallet({
                address,
                isConnected: true,
                isConnecting: false,
                error: null,
                signer,
                contract,
            });
            // console.log(contract);

            toast.success('Wallet connected successfully!');

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
            signer: undefined,
            contract: undefined,
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
                        // Ensure address is always a string
                        const address = typeof accounts[0] === 'string' ? accounts[0] : accounts[0].address;
                        const signer = await provider.getSigner();
                        let contract;
                        try {
                            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                        } catch (e) {
                            contract = undefined;
                        }
                        setWallet(prev => ({
                            ...prev,
                            address,
                            isConnected: true,
                            signer,
                            contract,
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