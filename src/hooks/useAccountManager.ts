import { useState } from 'react';
import { Account, UserCredentials } from '../models/Account';

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

  const handleCredentialsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Your existing login logic
  };

  const handleLogout = () => {
    setAccount(null);
    setCredentials({ username: '', password: '' });
    setIsLoggedIn(false);
    setLoginError('');
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