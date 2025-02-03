import { sepolia, mainnet } from "./Chain";

export interface Account {
    privateKey: string,
    address: string,
    balance: string,
    username?: string,
    passwordHash?: string,
}

export interface UserCredentials {
    username: string,
    password: string,
}

export interface StoredAccount {
    id: string;
    name: string;
    address: string;
    encryptedData: string;
    username: string;
}

export interface AccountsStore {
    accounts: StoredAccount[];
    currentAccountId?: string;
}

export interface User {
    username: string;
    passwordHash: string;
    accountIds: string[];
}

export const CHAINS_CONFIG = {
    [sepolia.chainId]: sepolia,
    [mainnet.chainId]: mainnet,
};
