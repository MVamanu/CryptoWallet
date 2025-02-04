import React, { useCallback, useState } from 'react';
import { Account, UserCredentials, StoredAccount } from '../../models/Account';
import AccountDetail from './AccountDetail';
import Layout from '../../components/Layout/Layout';
import { LoginForm } from './components/LoginForm';
// import { RecoveryForm } from './components/RecoveryForm';
// import { CreateAccountForm } from './components/CreateAccountForm';
import { useAccountManager } from '../../hooks/useAccountManager';
import { generateAccount, hashPassword, encryptAccountData } from '../../utils/AccountUtils';
import { CreateAccountForm } from './components/CreateAccountForm';
import { RecoveryForm } from './components/RecoveryForm';
import { v4 as uuidv4 } from 'uuid';

function AccountCreate() {
  const {
    account,
    credentials,
    isLoggedIn,
    loginError,
    handleLogin,
    handleLogout,
    handleCredentialsChange,
    setAccount,
    setCredentials,
    setIsLoggedIn
  } = useAccountManager();

  const [showRecoverInput, setShowRecoverInput] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showCreateCredentials, setShowCreateCredentials] = useState(false);
  const [seedphrase, setSeedphrase] = useState('');

  const handleRecoverySubmit = useCallback(async (phrase: string) => {
    try {
      const result = await generateAccount(phrase);
      // ... handle recovery logic
    } catch (error) {
      console.error('Recovery failed:', error);
    }
  }, []);

  const handleSeedPhraseChange = (value: string) => {
    setSeedphrase(value);
  };

  const showInitialButtons = !isLoggedIn && !showCreateCredentials && !showLoginForm;

  const handleCreateAccount = async (newCredentials: UserCredentials) => {
    try {
      // Generate new account
      const newAccount = await generateAccount();
      
      // Hash password
      const passwordHash = await hashPassword(newCredentials.password);
      
      // Encrypt private key
      const encryptedData = await encryptAccountData(newAccount.privateKey, newCredentials.password);
      
      // Create stored account object
      const storedAccount: StoredAccount = {
        id: uuidv4(),
        name: `Account ${newCredentials.username}`,
        address: newAccount.address,
        encryptedData,
        username: newCredentials.username
      };
      
      // Save user data
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push({
        username: newCredentials.username,
        passwordHash,
        accountIds: [storedAccount.id]
      });
      localStorage.setItem('users', JSON.stringify(users));
      
      // Save account data
      const accountsStore = JSON.parse(localStorage.getItem('accountsStore') || '{"accounts":[]}');
      accountsStore.accounts.push(storedAccount);
      localStorage.setItem('accountsStore', JSON.stringify(accountsStore));
      
      // Update state
      setAccount(newAccount);
      setCredentials(newCredentials);
      setIsLoggedIn(true);
      setShowCreateCredentials(false);
      
    } catch (error) {
      console.error('Failed to create account:', error);
      // Handle error appropriately
    }
  };

  return (
    <Layout>
      <h1 className="card-title text-center mb-4">Crypto Wallet</h1>
      
      {isLoggedIn && account && (
        <AccountDetail 
          account={account} 
          onLogout={handleLogout}
          username={credentials.username}
        />
      )}

      {showInitialButtons && (
        <div className="d-grid gap-3">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateCredentials(true)}
          >
            New Account
          </button>
          
          <button 
            className="btn btn-outline-primary"
            onClick={() => setShowLoginForm(true)}
          >
            Login
          </button>
          
          <button 
            className="btn btn-outline-secondary"
            onClick={() => setShowRecoverInput(true)}
          >
            Recover Account
          </button>
        </div>
      )}

      {showLoginForm && (
        <LoginForm
          credentials={credentials}
          error={loginError}
          onChange={handleCredentialsChange}
          onSubmit={handleLogin}
          onCancel={() => setShowLoginForm(false)}
        />
      )}

      {showCreateCredentials && (
        <CreateAccountForm
          onSubmit={handleCreateAccount}
          onCancel={() => setShowCreateCredentials(false)}
        />
      )}

      {showRecoverInput && (
        <RecoveryForm
          seedphrase={seedphrase}
          onChange={handleSeedPhraseChange}
          onSubmit={handleRecoverySubmit}
          onCancel={() => setShowRecoverInput(false)}
        />
      )}
    </Layout>
  );
}

export default AccountCreate;