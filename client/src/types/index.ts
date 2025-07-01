import { ethers } from 'ethers';
export interface Vault {
    id: string;
    name: string;
    description: string;
    owner: string;
    createdAt: Date;
    imageCount: number;
    isPublic: boolean;
}

export interface VaultImage {
    id: string;
    vaultId: string;
    ipfsHash: string;
    filename: string;
    uploadedAt: Date;
    thumbnail?: string | null;
    size: number;
    mimeType: string;
}

export interface GroupAccess {
    groupId: string;
    groupName: string;
    members: string[];
    expiresAt?: Date;
}

export interface UserAccess {
    userAddress: string;
    grantedAt: Date;
    expiresAt?: Date;
}

export interface VaultAccess {
    groups: GroupAccess[];
    users: UserAccess[];
}

export interface WalletState {
    address: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    signer?: ethers.Signer;
    contract?: ethers.Contract;
}

export interface UploadProgress {
    stage: 'fetching key' | 'decrypting key' | 'encrypting' | 'uploading' | 'saving' | 'complete';
    progress: number;
    message: string;
}