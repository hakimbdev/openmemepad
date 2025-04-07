import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface User {
  address: string;
  balance?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setWalletInfo: (address: string, balance?: number) => void;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedWallet = localStorage.getItem('wallet');
    
    if (storedWallet) {
      const walletInfo = JSON.parse(storedWallet);
      setUser(walletInfo);
      setIsAuthenticated(true);
    }
  }, []);

  const setWalletInfo = (address: string, balance: number = 0) => {
    const walletInfo = { address, balance };
    
    // Save to localStorage
    localStorage.setItem('wallet', JSON.stringify(walletInfo));
    
    // Update state
    setUser(walletInfo);
    setIsAuthenticated(true);
    
    toast.success('Wallet connected successfully!');
  };

  const disconnect = () => {
    // Clear localStorage
    localStorage.removeItem('wallet');
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
    
    toast.success('Wallet disconnected');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      setWalletInfo,
      disconnect
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 