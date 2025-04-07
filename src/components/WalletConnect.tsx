import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { walletApi } from '../services/api';

declare global {
  interface Window {
    ethereum: any;
    TON: any;
  }
}

const WalletConnect = () => {
  const { isAuthenticated, user, setWalletInfo, disconnect } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const fetchWalletBalance = async (address: string): Promise<number> => {
    try {
      setBalanceLoading(true);
      
      // For TON wallet
      if (window.TON && window.TON.isTonConnected) {
        try {
          const balanceNano = await window.TON.ton.getBalance();
          // Convert from nano TON to TON (1 TON = 10^9 nano TON)
          return Number(balanceNano) / 1000000000;
        } catch (error) {
          console.error('Error fetching TON balance:', error);
        }
      }
      
      // For Ethereum wallet or fallback to API
      try {
        const response = await walletApi.getBalance(address);
        if (response.data && response.data.balance) {
          return Number(response.data.balance);
        }
      } catch (error) {
        console.error('Error fetching balance from API:', error);
        
        // Fallback to provider for Ethereum
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(address);
          return Number(ethers.formatEther(balance));
        }
      }
      
      // Return default balance if all methods fail
      return 0;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return 0;
    } finally {
      setBalanceLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    try {
      // Check for TON wallet
      if (window.TON) {
        const isTonConnected = await window.TON.isTonConnected;
        if (isTonConnected) {
          const tonAddress = await window.TON.ton.address;
          const balance = await fetchWalletBalance(tonAddress);
          // Auto-connect known wallet
          setWalletInfo(tonAddress, balance);
          return;
        }
      }
      
      // Fallback to Ethereum wallet (for development/testing)
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        try {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const balance = await fetchWalletBalance(accounts[0].address);
            // Auto-connect known wallet
            setWalletInfo(accounts[0].address, balance);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connections:', error);
    }
  };

  const connectTonWallet = async () => {
    try {
      setLoading(true);
      
      if (window.TON) {
        try {
          // Connect to TON wallet
          await window.TON.connect();
          const tonAddress = await window.TON.ton.address;
          const balance = await fetchWalletBalance(tonAddress);
          setWalletInfo(tonAddress, balance);
        } catch (error) {
          console.error('TON wallet connection error:', error);
          toast.error('Failed to connect TON wallet');
        }
      } else {
        // Fallback to Ethereum wallet (for development/testing)
        await connectEthereumWallet();
      }
    } catch (error) {
      toast.error('Error connecting wallet');
      console.error('Wallet connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectEthereumWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        const balance = await fetchWalletBalance(accounts[0]);
        setWalletInfo(accounts[0], balance);
      } catch (error) {
        toast.error('Failed to connect Ethereum wallet');
        console.error('Error connecting Ethereum wallet:', error);
      }
    } else {
      toast.error('Please install a wallet (TON or MetaMask)');
    }
  };

  const refreshBalance = async () => {
    if (user && user.address) {
      setBalanceLoading(true);
      try {
        const balance = await fetchWalletBalance(user.address);
        setWalletInfo(user.address, balance);
        toast.success('Balance updated');
      } catch (error) {
        console.error('Error refreshing balance:', error);
        toast.error('Failed to refresh balance');
      } finally {
        setBalanceLoading(false);
      }
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer" onClick={refreshBalance}>
          <span className="font-medium">
            {balanceLoading ? '...' : `${user.balance?.toFixed(4)}`} TON
          </span>
          <span className="ml-2 opacity-80">
            {user.address.slice(0, 6)}...{user.address.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
          title="Disconnect Wallet"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectTonWallet}
      disabled={loading}
      className={`flex items-center gap-2 ${
        loading 
          ? 'bg-blue-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white px-4 py-2 rounded-lg transition-colors`}
    >
      <Wallet size={20} />
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

export default WalletConnect;