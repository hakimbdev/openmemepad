import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WalletConnect from '../components/WalletConnect';
import { getTONBalance, fetchTONTransactions } from '../utils/ton';

interface Transaction {
  hash: string;
  type: 'sent' | 'received' | 'unknown';
  token: string;
  amount: string;
  address: string; // to/from address
  time: string;
  usdValue?: string;
}

const WalletPage = () => {
  const { isAuthenticated, user, setWalletInfo } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  
  // Fetch transactions when wallet is connected
  useEffect(() => {
    if (isAuthenticated && user?.address) {
      fetchTransactions();
    }
  }, [isAuthenticated, user?.address]);

  const fetchTransactions = async () => {
    if (!user?.address) return;
    
    try {
      setLoadingTx(true);
      const response = await fetchTONTransactions(user.address, 10);
      
      if (response && response.transactions) {
        // Transform API response to our transaction format
        const formattedTx: Transaction[] = response.transactions.map((tx: any) => {
          // Determine if this is an incoming or outgoing transaction
          const isSent = tx.in_msg && tx.in_msg.source === user.address;
          const isReceived = tx.in_msg && tx.in_msg.destination === user.address;
          
          // Format time
          const txTime = new Date(tx.utime * 1000);
          const now = new Date();
          const diffMs = now.getTime() - txTime.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor(diffMs / (1000 * 60));
          
          let timeString;
          if (diffHours > 24) {
            timeString = `${Math.floor(diffHours / 24)}d ago`;
          } else if (diffHours > 0) {
            timeString = `${diffHours}h ago`;
          } else {
            timeString = `${diffMins}m ago`;
          }
          
          return {
            hash: tx.hash,
            type: isSent ? 'sent' : isReceived ? 'received' : 'unknown',
            token: 'TON',
            amount: ((tx.value || 0) / 1e9).toFixed(4),
            address: isSent ? tx.in_msg.destination : tx.in_msg.source,
            time: timeString,
            usdValue: tx.value_usd ? `$${Number(tx.value_usd).toFixed(2)}` : undefined
          };
        });
        
        setTransactions(formattedTx);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to example data
      setTransactions([
        { 
          hash: '123456abc', 
          type: 'sent', 
          token: 'TON', 
          amount: '0.5', 
          address: '0x1234...5678', 
          time: '2h ago' 
        },
        { 
          hash: '789012def', 
          type: 'received', 
          token: 'TON', 
          amount: '1.2', 
          address: '0x8765...4321', 
          time: '5h ago' 
        }
      ]);
    } finally {
      setLoadingTx(false);
    }
  };

  const refreshBalance = async () => {
    if (!user || !user.address) return;
    
    try {
      setRefreshing(true);
      const balance = await getTONBalance();
      setWalletInfo(user.address, balance);
      
      // Also refresh transactions
      await fetchTransactions();
    } catch (error) {
      console.error('Error refreshing wallet data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Wallet</h1>
        <div className="bg-white/10 text-white p-6 rounded-lg shadow-lg">
          <p className="text-xl mb-6 text-center">Connect your wallet to access this page</p>
          <div className="flex justify-center">
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Wallet</h1>
      
      <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Wallet className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Balance</h3>
              <p className="text-2xl font-bold text-blue-600">
                {refreshing ? '...' : user?.balance ? `${user.balance.toFixed(4)} TON` : '0 TON'}
              </p>
              <p className="text-sm text-gray-500">
                {user?.address ? `${user.address.slice(0, 10)}...${user.address.slice(-8)}` : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={refreshBalance}
            disabled={refreshing}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Refresh Balance"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            <ArrowUpRight size={20} />
            Send
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            <ArrowDownRight size={20} />
            Receive
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          {user?.address && (
            <a 
              href={`https://tonscan.org/address/${user.address}`}
              target="_blank"
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              <span>View All on TONScan</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
        
        {loadingTx ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-300 border-t-blue-600 rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'sent' ? 'bg-red-100' : 'bg-green-100'}`}>
                    {tx.type === 'sent' ? (
                      <ArrowUpRight className="text-red-600" size={20} />
                    ) : (
                      <ArrowDownRight className="text-green-600" size={20} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {tx.type === 'sent' ? 'Sent' : 'Received'} {tx.token}
                      </p>
                      <a 
                        href={`https://tonscan.org/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <p className="text-sm text-gray-500">
                      {tx.type === 'sent' ? 'To: ' : 'From: '}
                      {tx.address.length > 20 
                        ? `${tx.address.slice(0, 10)}...${tx.address.slice(-8)}`
                        : tx.address}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.type === 'sent' ? '-' : '+'}{tx.amount} {tx.token}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>{tx.time}</span>
                    {tx.usdValue && (
                      <span className="ml-2 text-gray-400">({tx.usdValue})</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No transactions found</p>
        )}
      </div>
    </div>
  );
};

export default WalletPage;