import { ethers } from 'ethers';
import { AES, enc } from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { Account, StoredAccount } from '../models/Account';

const USERS_STORE_KEY = 'users';
const ACCOUNTS_STORE_KEY = 'accountsStore';

export const generateAccount = async (existingPrivateKey?: string) => {
  const wallet = existingPrivateKey 
    ? new ethers.Wallet(existingPrivateKey)
    : ethers.Wallet.createRandom();
    
  return {
    privateKey: wallet.privateKey,
    address: wallet.address,
    balance: '0'
  };
};

export const hashPassword = async (password: string): Promise<string> => {
  // In a real app, use a proper password hashing library like bcrypt
  return enc.Base64.stringify(enc.Utf8.parse(password));
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
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

export const encryptAccountData = async (data: string, password: string): Promise<string> => {
  return AES.encrypt(data, password).toString();
};

export const decryptAccountData = async (encryptedData: string, password: string): Promise<string> => {
  try {
    const bytes = AES.decrypt(encryptedData, password);
    const decrypted = bytes.toString(enc.Utf8);
    if (!decrypted) {
      throw new Error('Failed to decrypt data');
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt account data. Please check your password.');
  }
};

export const toFixedIfNecessary = (value: string, decimals: number = 4): string => {
  return (+value).toFixed(decimals).replace(/\.?0+$/, '');
};

export function shortenAddress(address: string) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}