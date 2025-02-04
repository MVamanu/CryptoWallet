import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { Account, StoredAccount } from '../models/Account';

const USERS_STORE_KEY = 'users';
const ACCOUNTS_STORE_KEY = 'accountsStore';

export const generateAccount = async (privateKey?: string): Promise<Account> => {
  const wallet = privateKey 
    ? new ethers.Wallet(privateKey)
    : ethers.Wallet.createRandom();

  return {
    address: wallet.address,
    balance: '0',
    privateKey: wallet.privateKey
  };
};

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const validateUser = async (username: string, password: string) => {
  const storedUsers = localStorage.getItem(USERS_STORE_KEY);
  if (!storedUsers) {
    return { error: 'No registered users found' };
  }

  const users = JSON.parse(storedUsers);
  const user = users.find((u: any) => u.username === username);
  if (!user) {
    return { error: 'Username not found' };
  }

  const hashedInput = await hashPassword(password);
  if (hashedInput !== user.passwordHash) {
    return { error: 'Invalid password' };
  }

  return { success: true, user };
};

export const loadUserAccount = async (username: string) => {
  const storedAccounts = localStorage.getItem(ACCOUNTS_STORE_KEY);
  if (!storedAccounts) {
    return { error: 'No accounts found' };
  }

  const accountsStore = JSON.parse(storedAccounts);
  const userAccounts = accountsStore.accounts.filter(
    (acc: StoredAccount) => acc.username === username
  );

  if (userAccounts.length === 0) {
    return { error: 'No accounts found for user' };
  }

  return { success: true, accounts: userAccounts };
};

export const decryptAccountData = async (encryptedData: string): Promise<string> => {
  try {
    const decoded = atob(encryptedData);
    const [privateKey] = decoded.split(':');
    return privateKey;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt account data');
  }
};

export const encryptAccountData = async (privateKey: string, password: string): Promise<string> => {
  try {
    return btoa(privateKey + ':' + password);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt account data');
  }
};

export const toFixedIfNecessary = (value: string, decimals: number = 4): string => {
  return (+value).toFixed(decimals).replace(/\.?0+$/, '');
};

export function shortenAddress(address: string) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}