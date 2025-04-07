import React, { useState } from 'react';
import { Copy, X, ExternalLink, TrendingUp, BarChart2, Users, Calendar, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Token } from '../services/tonApi';
import { tonContractService, TradeParams } from '../services/tonApi';

interface TokenDetailModalProps {
  token: Token;
  onClose: () => void;
}

const TokenDetailModal: React.FC<TokenDetailModalProps> = ({ token, onClose }) => {
  const { name, symbol, address, price, change_24h, volume_24h, marketCap, holders, created_at } = token;
  const { isAuthenticated, user } = useAuth();
  
  const [copying, setCopying] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [isBuying, setIsBuying] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const copyToClipboard = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy address');
    } finally {
      setTimeout(() => setCopying(false), 2000);
    }
  };

  const formatLaunchDate = () => {
    const date = new Date(created_at);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const handleBuySell = async () => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet first!');
      return;
    }

    if (!user?.address) {
      toast.error('Wallet address not found');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setProcessing(true);
      const amountValue = parseFloat(amount);
      
      const tradeParams: TradeParams = {
        tokenAddress: address,
        amount: amountValue
      };

      let result;
      if (isBuying) {
        toast.success(`Buying ${amount} ${symbol}...`);
        result = await tonContractService.buyTokens(tradeParams, user.address);
      } else {
        toast.success(`Selling ${amount} ${symbol}...`);
        result = await tonContractService.sellTokens(tradeParams, user.address);
      }

      if (result.success) {
        setTxHash(result.txHash || '');
        toast.success(`${isBuying ? 'Buy' : 'Sell'} order completed!`);
      } else {
        throw new Error(result.error || `Failed to ${isBuying ? 'buy' : 'sell'} tokens`);
      }
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error(error instanceof Error ? error.message : `Error processing ${isBuying ? 'buy' : 'sell'} order`);
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setTxHash(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold">{name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{symbol}</span>
                <div className="flex items-center">
                  <button 
                    onClick={copyToClipboard}
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs"
                  >
                    {copying ? 'Copied!' : address.slice(0, 8)}...{address.slice(-6)}
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 rounded-full p-1"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="border-b border-gray-200 mb-4 pb-4">
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">${price.toFixed(10)}</span>
              <span className={`flex items-center ${change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change_24h >= 0 ? '+' : ''}{change_24h.toFixed(2)}%
                <TrendingUp size={16} className={change_24h >= 0 ? '' : 'transform rotate-180'} />
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <BarChart2 size={16} />
                <span className="text-xs">Market Cap</span>
              </div>
              <div className="font-semibold">${marketCap.toLocaleString()}</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <BarChart2 size={16} />
                <span className="text-xs">Volume (24h)</span>
              </div>
              <div className="font-semibold">${volume_24h.toLocaleString()}</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Users size={16} />
                <span className="text-xs">Holders</span>
              </div>
              <div className="font-semibold">{holders.toLocaleString()}</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar size={16} />
                <span className="text-xs">Launch Date</span>
              </div>
              <div className="font-semibold">{formatLaunchDate()}</div>
            </div>
          </div>
          
          {txHash ? (
            <div className="mb-6 border-t pt-4">
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                <h3 className="font-bold mb-2">Transaction Complete!</h3>
                <p className="text-sm mb-2">Your {isBuying ? 'purchase' : 'sale'} was successful.</p>
                <div className="flex items-center justify-between text-xs bg-green-100 p-2 rounded">
                  <span className="font-mono">{txHash.slice(0, 15)}...{txHash.slice(-6)}</span>
                  <a 
                    href={`https://tonscan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 inline-flex items-center"
                  >
                    View <ExternalLink size={12} className="ml-1" />
                  </a>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={resetForm}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Make Another {isBuying ? 'Purchase' : 'Sale'}
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t pt-4">
              <div className="mb-4">
                <div className="flex border rounded-lg overflow-hidden">
                  <button 
                    className={`flex-1 py-2 px-4 ${isBuying ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setIsBuying(true)}
                  >
                    Buy
                  </button>
                  <button 
                    className={`flex-1 py-2 px-4 ${!isBuying ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setIsBuying(false)}
                  >
                    Sell
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to {isBuying ? 'Buy' : 'Sell'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter amount in ${symbol}`}
                    disabled={processing}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700">
                    {symbol}
                  </div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>Min: 10 {symbol}</span>
                  {isBuying && (
                    <span>Balance: {user?.balance?.toFixed(2) || '0'} TON</span>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <button
                  onClick={handleBuySell}
                  disabled={processing || !amount || parseFloat(amount) <= 0}
                  className={`w-full py-2 px-4 rounded-lg font-medium ${
                    isBuying
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } ${processing ? 'opacity-70 cursor-not-allowed' : ''} transition-colors`}
                >
                  {processing 
                    ? 'Processing...' 
                    : `${isBuying ? 'Buy' : 'Sell'} ${symbol}`}
                </button>
              </div>
              
              <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg text-yellow-800 text-sm">
                <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
                <p>
                  Trading meme tokens involves significant risk. Only trade with funds you can afford to lose.
                  {isBuying ? ' Purchase will be executed at the current market price.' : ' Sale will be executed at the current market price.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenDetailModal; 