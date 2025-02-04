import { useState } from 'react';
import { Account, UserCredentials } from '../models/Account';
import { verifyPassword, decryptAccountData } from '../utils/AccountUtils';

interface AccountManager {
  account: Account | null;
  credentials: UserCredentials;
  isLoggedIn: boolean;
  loginError: string;
  setAccount: (account: Account | null) => void;
  setCredentials: (credentials: UserCredentials) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleLogout: () => void;
  handleCredentialsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const useAccountManager = (): AccountManager => {
  const [account, setAccount] = useState<Account | null>(null);
  const [credentials, setCredentials] = useState<UserCredentials>({
    username: '',
    password: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      if (!credentials.password) {
        setLoginError('Password is required');
        return;
      }

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.username === credentials.username);
      

      if (!user) {
        setLoginError('User not found');
        return;
      }

      // Verify password
      const isValid = await verifyPassword(credentials.password, user.passwordHash);
      if (!isValid) {
        setLoginError('Invalid password');
        return;
      }

      // Get account data
      const accountsStore = JSON.parse(localStorage.getItem('accountsStore') || '{"accounts":[]}');
      const storedAccount = accountsStore.accounts.find((a: any) => 
        user.accountIds.includes(a.id) && a.username === credentials.username
      );

      if (!storedAccount) {
        setLoginError('Account not found');
        return;
      }

      // Decrypt account data with password
      const privateKey = await decryptAccountData(
        storedAccount.encryptedData,
        credentials.password
      );
      
      // Set account state
      setAccount({
        privateKey,
        address: storedAccount.address,
        balance: '0' // Will be updated by balance checker
      });
      
      setIsLoggedIn(true);
      setLoginError('');

    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Failed to login. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    setAccount(null);
    setCredentials({ username: '', password: '' });
    setIsLoggedIn(false);
    setLoginError('');
  };

  const handleCredentialsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return {
    account,
    credentials,
    isLoggedIn,
    loginError,
    setAccount,
    setCredentials,
    setIsLoggedIn,
    handleLogin,
    handleLogout,
    handleCredentialsChange
  };
}; 