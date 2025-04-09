import React, { useState } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// This is a placeholder component to be used until actual TonConnect can be installed
const TonWalletPlaceholder = () => {
  const { isAuthenticated, user, setWalletInfo, disconnect } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const connectWallet = async () => {
    try {
      setLoading(true);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random TON address for demo purposes
      const address = `EQ${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const balance = 1.5 + Math.random() * 3; // Random balance between 1.5 and 4.5
      
      setWalletInfo(address, balance);
      toast.success('Telegram Wallet connected (simulated)');
    } catch (error) {
      toast.error('Error connecting wallet');
      console.error('Wallet connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer">
          <span className="font-medium">
            {user.balance?.toFixed(4)} TON
          </span>
          <span className="ml-2 opacity-80">
            {user.address.slice(0, 6)}...{user.address.slice(-4)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
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
      onClick={connectWallet}
      disabled={loading}
      className={`flex items-center gap-2 ${
        loading 
          ? 'bg-blue-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white px-4 py-2 rounded-lg transition-colors`}
    >
      <Wallet size={20} />
      {loading ? 'Connecting...' : 'Connect Telegram Wallet'}
    </button>
  );
};

// Mock component for TonConnectUIProvider
export const TonConnectUIProviderPlaceholder: React.FC<{
  children: React.ReactNode;
  manifestUrl?: string;
  uiPreferences?: any;
  walletsListConfiguration?: any;
  actionsConfiguration?: any;
}> = ({ children }) => {
  return <>{children}</>;
};

export default TonWalletPlaceholder; 