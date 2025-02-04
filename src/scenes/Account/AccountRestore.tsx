import React, { useState } from 'react';
import { useAccountManager } from '../../hooks/useAccountManager';
import { decryptAccountData, generateAccount } from '../../utils/AccountUtils';

export const AccountRestore: React.FC = () => {
  const { setAccount, credentials } = useAccountManager();
  const [error, setError] = useState<string>('');

  const handleRestore = async () => {
    try {
      if (!credentials.password) {
        setError('Password is required');
        return;
      }

      // Get accounts from storage
      const accountsStore = localStorage.getItem('accountsStore');
      if (!accountsStore) {
        setError('No accounts found');
        return;
      }

      const accountsResult = JSON.parse(accountsStore);
      if (!accountsResult.accounts || accountsResult.accounts.length === 0) {
        setError('No accounts found');
        return;
      }

      const firstAccount = accountsResult.accounts[0];
      
      // Decrypt the account data with password
      const privateKey = await decryptAccountData(
        firstAccount.encryptedData,
        credentials.password
      );

      // Generate account from private key
      const accountData = await generateAccount(privateKey);

      setAccount(accountData);
      setError('');
    } catch (error) {
      console.error('Failed to restore account:', error);
      setError('Failed to restore account. Please check your credentials.');
    }
  };

  return (
    <div>
      <h2>Restore Account</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <button 
        className="btn btn-primary" 
        onClick={handleRestore}
        disabled={!credentials.password}
      >
        Restore Account
      </button>
    </div>
  );
}; 