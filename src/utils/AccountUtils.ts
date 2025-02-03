import { ethers } from 'ethers';
import { Account } from '../models/Account';

interface AccountGenerationResult {
  account: Account;
  mnemonic: string | null;
}

export async function generateAccount(recoveryPhrase?: string): Promise<AccountGenerationResult> {
  let wallet: ethers.Wallet;
  let mnemonic: string | null = null;

  if (recoveryPhrase) {
    // Check if the recovery phrase is a mnemonic or private key
    if (recoveryPhrase.split(' ').length > 1) {
      wallet = ethers.Wallet.fromMnemonic(recoveryPhrase);
    } else {
      wallet = new ethers.Wallet(recoveryPhrase);
    }
  } else {
    // Generate a random wallet with mnemonic
    const randomWallet = ethers.Wallet.createRandom();
    wallet = randomWallet;
    mnemonic = randomWallet.mnemonic.phrase;
  }

  const account: Account = {
    privateKey: wallet.privateKey,
    address: wallet.address,
    balance: '0',
  };

  return {
    account,
    mnemonic
  };
}

export function shortenAddress(address: string) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function toFixedIfNecessary(value: string, dp: number = 6) {
  return (+value).toFixed(dp);
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}