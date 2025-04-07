import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import WalletConnect from '../components/WalletConnect';
import { tonContractService, TokenCreationParams } from '../services/tonApi';

interface TokenCreationResult {
  txHash: string;
  tokenAddress: string;
}

const LaunchToken = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState({
    token_name: '',
    token_symbol: '',
    total_supply: '',
    description: ''
  });
  const [createdToken, setCreatedToken] = useState<TokenCreationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please connect your wallet first!');
      return;
    }

    if (!user?.address) {
      toast.error('Wallet address not found. Please reconnect your wallet.');
      return;
    }

    try {
      setLoading(true);
      
      // Parse the total supply as a number
      const totalSupply = Number(tokenData.total_supply);
      if (isNaN(totalSupply) || totalSupply <= 0) {
        toast.error('Total supply must be a positive number');
        return;
      }
      
      // Start token creation process
      toast.success(`Creating token ${tokenData.token_name} (${tokenData.token_symbol}) on TON blockchain...`);
      
      // Prepare token creation parameters
      const tokenParams: TokenCreationParams = {
        name: tokenData.token_name,
        symbol: tokenData.token_symbol,
        initialSupply: totalSupply,
        initialPrice: 0.00000001, // Set a very low initial price
        description: tokenData.description
      };
      
      // Call our TON contract service to create the token
      const result = await tonContractService.launchToken(tokenParams, user.address);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create token');
      }
      
      // Store the created token information
      setCreatedToken({
        txHash: result.txHash!,
        tokenAddress: result.tokenAddress!
      });
      
      toast.success(`Token ${tokenData.token_name} (${tokenData.token_symbol}) created successfully!`);
      
      // Don't reset form when token is created - keep the data visible
    } catch (error) {
      console.error('Error creating token:', error);
      toast.error(error instanceof Error ? error.message : 'Error creating token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTokenData({
      token_name: '',
      token_symbol: '',
      total_supply: '',
      description: ''
    });
    setCreatedToken(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Launch Your Token</h1>
        <div className="bg-white/10 text-white p-6 rounded-lg shadow-lg">
          <p className="text-xl mb-6 text-center">Connect your wallet to launch tokens</p>
          <div className="flex justify-center">
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Launch Your Token</h1>
      
      {createdToken ? (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4 inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-xl font-bold">Token Created Successfully!</h3>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Token Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2"><span className="font-semibold">Name:</span> {tokenData.token_name}</p>
              <p className="mb-2"><span className="font-semibold">Symbol:</span> {tokenData.token_symbol}</p>
              <p className="mb-2"><span className="font-semibold">Total Supply:</span> {tokenData.total_supply}</p>
              <p className="mb-2"><span className="font-semibold">Token Address:</span> <code className="bg-gray-100 px-1 rounded">{createdToken.tokenAddress}</code></p>
              <p className="mb-2"><span className="font-semibold">Transaction Hash:</span> <code className="bg-gray-100 px-1 rounded">{createdToken.txHash}</code></p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={resetForm}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Another Token
            </button>
            
            <a
              href={`https://tonscan.org/tx/${createdToken.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
            >
              View on TONScan
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Name
              </label>
              <input
                type="text"
                value={tokenData.token_name}
                onChange={(e) => setTokenData({ ...tokenData, token_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Awesome Token"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Symbol
              </label>
              <input
                type="text"
                value={tokenData.token_symbol}
                onChange={(e) => setTokenData({ ...tokenData, token_symbol: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., AWE"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The token symbol should be 3-5 characters, all caps (e.g., BTC, ETH, USDT)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Supply
              </label>
              <input
                type="number"
                value={tokenData.total_supply}
                onChange={(e) => setTokenData({ ...tokenData, total_supply: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1000000"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={tokenData.description}
                onChange={(e) => setTokenData({ ...tokenData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Describe your token..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 px-6 rounded-lg font-semibold transition-colors`}
            >
              {loading ? 'Creating Token...' : 'Launch Token'}
            </button>
            {user && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Connected as: {user.address.slice(0, 8)}...{user.address.slice(-6)}
              </p>
            )}
            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-500">
                <strong>Note:</strong> Launching a token requires at least 0.5 TON to cover deployment costs. 
                Your balance: {user?.balance?.toFixed(4) || '0'} TON
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LaunchToken;