import React from 'react';
import { StoredAccount } from '../../models/Account';

interface AccountSelectorProps {
  accounts: StoredAccount[];
  currentAccountId: string | undefined;
  onAccountSwitch: (accountId: string) => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  currentAccountId,
  onAccountSwitch
}) => {
  return (
    <div className="account-selector mb-3">
      <select 
        className="form-select"
        value={currentAccountId}
        onChange={(e) => onAccountSwitch(e.target.value)}
      >
        {accounts.map(acc => (
          <option key={acc.id} value={acc.id}>
            {acc.name} ({acc.address.substring(0, 6)}...{acc.address.substring(acc.address.length - 4)})
          </option>
        ))}
      </select>
    </div>
  );
};

export default AccountSelector; 