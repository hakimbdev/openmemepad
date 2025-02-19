import React, { useState } from 'react';
import toast from 'react-hot-toast';

const LaunchToken = () => {
  const [tokenData, setTokenData] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.ethereum) {
      toast.error('Please connect your wallet first!');
      return;
    }
    toast.success('Token launch initiated! Please confirm the transaction.');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Launch Your Token</h1>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Name
            </label>
            <input
              type="text"
              value={tokenData.name}
              onChange={(e) => setTokenData({ ...tokenData, name: e.target.value })}
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
              value={tokenData.symbol}
              onChange={(e) => setTokenData({ ...tokenData, symbol: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., AWE"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Supply
            </label>
            <input
              type="number"
              value={tokenData.totalSupply}
              onChange={(e) => setTokenData({ ...tokenData, totalSupply: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 1000000"
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
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Launch Token
          </button>
        </form>
      </div>
    </div>
  );
};

export default LaunchToken;