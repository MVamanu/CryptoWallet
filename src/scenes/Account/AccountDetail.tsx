import React, {useEffect, useState} from 'react';
import { sendToken } from '../../utils/TransactionUtils';
import { sepolia } from '../../models/Chain';
import { Account } from '../../models/Account';
import AccountTransactions from './AccountTransactions';
import { ethers } from 'ethers';
import { toFixedIfNecessary } from '../../utils/AccountUtils';
import './Account.css';

interface AccountDetailProps {
  account: Account;
  onLogout: () => void;
  username: string;
}

const AccountDetail: React.FC<AccountDetailProps> = ({account, onLogout, username}) => {
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(account.balance)

  const [networkResponse, setNetworkResponse] = useState<{ status: null | 'pending' | 'complete' | 'error', message: string | React.ReactElement }>({
    status: null,
    message: '',
  });

  useEffect(() => {
    const fetchData = async () => {
        const provider = new ethers.providers.JsonRpcProvider(sepolia.rpcUrl);
        let accountBalance = await provider.getBalance(account.address);
        setBalance((String(toFixedIfNecessary(ethers.utils.formatEther(accountBalance)))));
    }
    fetchData();
  }, [account.address])

  function handleDestinationAddressChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDestinationAddress(event.target.value);
  }

  function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAmount(Number.parseFloat(event.target.value));
  }

  async function transfer() {
    // Set the network response status to "pending"
    setNetworkResponse({
      status: 'pending',
      message: '',
    });

    try {
      const { receipt } = await sendToken(amount, account.address, destinationAddress, account.privateKey);

      if (receipt.status === 1) {
        // Set the network response status to "complete" and the message to the transaction hash
        setNetworkResponse({
          status: 'complete',
          message: <p>Transfer complete! <a href={`${sepolia.blockExplorerUrl}/tx/${receipt.transactionHash}`} target="_blank" rel="noreferrer">
            View transaction
            </a></p>,
        });
        return receipt;
      } else {
        // Transaction failed
        console.log(`Failed to send ${receipt}`);
        // Set the network response status to "error" and the message to the receipt
        setNetworkResponse({
          status: 'error',
          message: JSON.stringify(receipt),
        });
        return { receipt };
      }
    } catch (error: any) {
      // An error occurred while sending the transaction
      console.error({ error });
      // Set the network response status to "error" and the message to the error
      setNetworkResponse({
        status: 'error',
        message: error.reason || JSON.stringify(error),
      });
    }
  }

  return (
    <div className="account-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="text-muted mb-0">
          User: {username}
        </h5>
        <button 
          className="btn btn-outline-danger btn-sm"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      <div className="account-info">
        <h4 className="mb-3">
          <div className="mb-2">
            Address: <a 
              href={`${sepolia.blockExplorerUrl}/address/${account.address}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-break"
            >
              {account.address}
            </a>
          </div>
          <div>
            Balance: {balance} ETH
          </div>
        </h4>
      </div>

      <div className="form-group">
        <label>Destination Address:</label>
        <input
          className="form-control"
          type="text"
          value={destinationAddress}
          onChange={handleDestinationAddressChange}
        />
      </div>

      <div className="form-group">
        <label>Amount:</label>
        <input
          className="form-control"
          type="number"
          value={amount}
          onChange={handleAmountChange}
        />
      </div>

      <button
        className="btn btn-primary"
        type="button"
        onClick={transfer}
        disabled={!amount || networkResponse.status === 'pending'}
      >
        Send {amount} ETH
      </button>

      {networkResponse.status &&
        <>
          {networkResponse.status === 'pending' && <p>Transfer is pending...</p>}
          {networkResponse.status === 'complete' && <p>{networkResponse.message}</p>}
          {networkResponse.status === 'error' && <p>Error occurred while transferring tokens: {networkResponse.message}</p>}
        </>
      }

      <AccountTransactions account={account} />
    </div>
  )
}

export default AccountDetail;