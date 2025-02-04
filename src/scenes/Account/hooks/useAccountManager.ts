import { useState, useCallback } from 'react';
import { Account, UserCredentials, StoredAccount } from '../../../models/Account';
import { validateUser, loadUserAccount, decryptAccountData, generateAccount } from '../../../utils/AccountUtils';

export function useAccountManager() {
  const [account, setAccount] = useState<Account | null>(null);
  const [credentials, setCredentials] = useState<UserCredentials>({
    username: '',
    password: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleCredentialsChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  }, []);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userValidation = await validateUser(credentials.username, credentials.password);
    if ('error' in userValidation) {
      setLoginError(userValidation.error || '');
      return;
    }

    const accountsResult = await loadUserAccount(credentials.username);
    if ('error' in accountsResult) {
      setLoginError(accountsResult.error || '');
      return;
    }

    try {
      const firstAccount = accountsResult.accounts[0];
      const privateKey = await decryptAccountData(
        firstAccount.encryptedData,
        credentials.password
      );
      const accountData = await generateAccount(privateKey);
      
      setAccount(accountData);
      setIsLoggedIn(true);
      setLoginError('');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Failed to load account');
    }
  }, [credentials]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setAccount(null);
    setCredentials({ username: '', password: '' });
    setLoginError('');
  }, []);

  return {
    account,
    credentials,
    isLoggedIn,
    loginError,
    handleLogin,
    handleLogout,
    handleCredentialsChange
  };
} 