import React, { useCallback, useEffect, useState } from 'react';
import { generateAccount, hashPassword } from '../../utils/AccountUtils';
import { Account, UserCredentials, StoredAccount, AccountsStore } from '../../models/Account';
import AccountDetail from './AccountDetail';
import { v4 as uuidv4 } from 'uuid';

const ACCOUNTS_STORE_KEY = 'accountsStore';
const USERS_STORE_KEY = 'users';
const recoveryPhraseKeyName = 'recoveryPhrase';

// Encryption functions
const encryptAccountData = async (privateKey: string, password: string): Promise<string> => {
  try {
    return btoa(privateKey + ':' + password);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt account data');
  }
};

const decryptAccountData = async (encryptedData: string): Promise<string> => {
  try {
    const decoded = atob(encryptedData);
    const [privateKey] = decoded.split(':');
    return privateKey;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt account data');
  }
};

function AccountCreate() {
  const [seedphrase, setSeedphrase] = useState('');
  const [account, setAccount] = useState<Account | null>(null);
  const [showRecoverInput, setShowRecoverInput] = useState(false);
  const [newSeedPhrase, setNewSeedPhrase] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showCreateCredentials, setShowCreateCredentials] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhraseConfirmed, setSeedPhraseConfirmed] = useState(false);
  const [credentials, setCredentials] = useState<UserCredentials>({
    username: '',
    password: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string | undefined>();

  function handleCredentialsChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCredentials({
      ...credentials,
      [event.target.name]: event.target.value
    });
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSeedphrase(event.target.value);
  }

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      recoverAccount(seedphrase);
    }
  }

  const recoverAccount = useCallback(
    async (recoveryPhrase: string) => {
      const result = await generateAccount(recoveryPhrase);
      setAccount(result.account);
      setShowLoginForm(true);

      if (localStorage.getItem(recoveryPhraseKeyName) !== recoveryPhrase) {
        localStorage.setItem(recoveryPhraseKeyName, recoveryPhrase);
      }
    }, []
  );

  useEffect(() => {
    const localStorageRecoveryPhrase = localStorage.getItem(recoveryPhraseKeyName);
    const storedUsers = localStorage.getItem(USERS_STORE_KEY);
    
    if (localStorageRecoveryPhrase && storedUsers) {
      setSeedphrase(localStorageRecoveryPhrase);
      setShowLoginForm(true);
    }
  }, []);

  async function initiateAccountCreation() {
    setShowCreateCredentials(true);
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      // Check if username already exists
      const storedUsers = localStorage.getItem(USERS_STORE_KEY);
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      const userExists = users.some((user: any) => user.username === credentials.username);
      if (userExists) {
        setLoginError('Username already exists. Please choose another.');
        return;
      }

      const result = await generateAccount();
      const accountId = uuidv4();
      
      // Hash the password
      const hashedPassword = await hashPassword(credentials.password);

      // Create new user entry
      const newUser = {
        username: credentials.username,
        passwordHash: hashedPassword,
        accountIds: [accountId] // Array to store multiple account IDs for this user
      };

      // Store user
      localStorage.setItem(USERS_STORE_KEY, JSON.stringify([...users, newUser]));

      // Encrypt sensitive data
      const encryptedData = await encryptAccountData(
        result.account.privateKey,
        credentials.password
      );

      // Create new account entry
      const newStoredAccount: StoredAccount = {
        id: accountId,
        name: `Account ${accounts.length + 1}`,
        address: result.account.address,
        encryptedData,
        username: credentials.username // Link account to user
      };

      // Update accounts store
      const updatedAccounts = [...accounts, newStoredAccount];
      const accountsStore: AccountsStore = {
        accounts: updatedAccounts,
        currentAccountId: accountId
      };

      // Save to localStorage
      localStorage.setItem(ACCOUNTS_STORE_KEY, JSON.stringify(accountsStore));
      
      // Update state
      setAccounts(updatedAccounts);
      setCurrentAccountId(accountId);
      setAccount(result.account);
      setNewSeedPhrase(result.mnemonic);
      
      // Continue with seed phrase display
      setShowCreateCredentials(false);
      setShowSeedPhrase(true);
    } catch (error) {
      console.error("Error creating account:", error);
      setLoginError('Error creating account. Please try again.');
    }
  }

  async function handleSeedPhraseConfirm() {
    if (newSeedPhrase && account) {
      localStorage.setItem(recoveryPhraseKeyName, newSeedPhrase);
      setShowSeedPhrase(false);
      setIsLoggedIn(true);
    }
  }

  const getCurrentAccount = useCallback(() => {
    if (currentAccountId && accounts.length > 0) {
      return accounts.find(acc => acc.id === currentAccountId);
    }
    return null;
  }, [currentAccountId, accounts]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const storedUsers = localStorage.getItem(USERS_STORE_KEY);
    
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const user = users.find((u: any) => u.username === credentials.username);
      
      if (user) {
        const hashedInput = await hashPassword(credentials.password);
        
        if (hashedInput === user.passwordHash) {
          const storedAccounts = localStorage.getItem(ACCOUNTS_STORE_KEY);
          if (storedAccounts) {
            const accountsStore = JSON.parse(storedAccounts);
            const userAccounts = accountsStore.accounts.filter(
              (acc: StoredAccount) => acc.username === credentials.username
            );
            
            if (userAccounts.length > 0) {
              setAccounts(userAccounts);
              const firstAccountId = userAccounts[0].id;
              setCurrentAccountId(firstAccountId);

              // Load first account
              const firstAccount = userAccounts[0];
              const privateKey = await decryptAccountData(firstAccount.encryptedData);
              const result = await generateAccount(privateKey);
              
              setAccount(result.account);
              setIsLoggedIn(true);
              setLoginError('');
            }
          }
        } else {
          setLoginError('Invalid password');
        }
      } else {
        setLoginError('Username not found');
      }
    } else {
      setLoginError('No registered users found');
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAccount(null);
    setCredentials({ username: '', password: '' });
    setShowLoginForm(false);
    setShowCreateCredentials(false);
    setShowSeedPhrase(false);
    setNewSeedPhrase(null);
    setSeedPhraseConfirmed(false);
    setShowRecoverInput(false);
    setSeedphrase('');
    setLoginError('');
    setCurrentAccountId(undefined);
  };

  const showInitialButtons = !isLoggedIn && !showCreateCredentials && !showLoginForm && !showSeedPhrase;

  if (showCreateCredentials) {
    return (
      <div className='AccountCreate p-5 m-3 card shadow'>
        <h1>Create Your Login</h1>
        <form onSubmit={handleCredentialsSubmit} className="mt-4">
          <div className="form-group mb-3">
            <label htmlFor="username">Choose a Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleCredentialsChange}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="password">Choose a Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleCredentialsChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Create Account
          </button>
        </form>
      </div>
    );
  }

  if (showSeedPhrase && newSeedPhrase) {
    return (
      <div className='AccountCreate p-5 m-3 card shadow'>
        <div className="seed-phrase-confirmation">
          <div className="alert alert-warning">
            <h4>Important! Save Your Recovery Phrase</h4>
            <p>This is your wallet's recovery phrase. Save it somewhere safe - you'll need it if you ever forget your password.</p>
            <div className="seed-phrase-display p-3 mb-3 bg-light border rounded">
              <code>{newSeedPhrase}</code>
            </div>
            <div className="form-check mb-3">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="confirmCheck"
                onChange={(e) => setSeedPhraseConfirmed(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="confirmCheck">
                I have safely stored my recovery phrase
              </label>
            </div>
            <button 
              className="btn btn-primary"
              onClick={handleSeedPhraseConfirm}
              disabled={!seedPhraseConfirmed}
            >
              Enter Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <h1 className="card-title text-center mb-4">Crypto Wallet</h1>
              
              {isLoggedIn && account && (
                <>
                  <hr className="my-4" />
                  <AccountDetail 
                    account={account} 
                    onLogout={handleLogout}
                    username={credentials.username}
                  />
                </>
              )}

              {showInitialButtons && (
                <div className="d-grid gap-3">
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={initiateAccountCreation}
                  >
                    New Account
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={() => setShowLoginForm(true)}
                  >
                    Login
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => showRecoverInput ? recoverAccount(seedphrase) : setShowRecoverInput(true)}
                    disabled={showRecoverInput && !seedphrase}
                  >
                    Recover Account
                  </button>
                  
                  {showRecoverInput && (
                    <div className="form-group mt-3">
                      <input 
                        type="text" 
                        placeholder="Recovery phrase" 
                        className="form-control"
                        value={seedphrase} 
                        onChange={handleChange} 
                        onKeyDown={handleKeyDown} 
                      />
                    </div>
                  )}
                </div>
              )}

              {showLoginForm && !isLoggedIn && (
                <div className="login-form">
                  <h2 className="h4 mb-4">Login to Existing Account</h2>
                  <form onSubmit={handleLogin}>
                    {loginError && (
                      <div className="alert alert-danger" role="alert">
                        {loginError}
                      </div>
                    )}
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        value={credentials.username}
                        onChange={handleCredentialsChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleCredentialsChange}
                        required
                      />
                    </div>
                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-primary">
                        Login
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setShowLoginForm(false);
                          setCredentials({ username: '', password: '' });
                          setLoginError('');
                        }}
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {showSeedPhrase && newSeedPhrase && (
                <div className="seed-phrase-section">
                  <div className="alert alert-warning">
                    <h4 className="alert-heading">Important! Save Your Recovery Phrase</h4>
                    <p>This is your wallet's recovery phrase. Save it somewhere safe - you'll need it if you ever forget your password.</p>
                    <div className="bg-light p-3 rounded mb-3">
                      <code className="user-select-all">{newSeedPhrase}</code>
                    </div>
                    <div className="form-check mb-3">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="confirmCheck"
                        onChange={(e) => setSeedPhraseConfirmed(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="confirmCheck">
                        I have safely stored my recovery phrase
                      </label>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSeedPhraseConfirm}
                      disabled={!seedPhraseConfirmed}
                    >
                      Enter Wallet
                    </button>
                  </div>
                </div>
              )}

              {/* Footer cu stil */}
              <div className="text-center mt-4">
                <hr className="my-4" />
                <p className="text-muted mb-0" style={{ 
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  letterSpacing: '0.5px'
                }}>
                  Made with ❤️ by Zorbu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountCreate;