import React, { useState } from 'react';
import { Copy, X, ExternalLink, TrendingUp, TrendingDown, Users, Calendar, AlertTriangle, Check, Globe, MessageCircle, Twitter, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Token, tokenService } from '../services/tokenService';
import TokenChart from './TokenChart';

interface TokenDetailModalProps {
  token: Token;
  onClose: () => void;
}

type TradeTab = 'buy' | 'sell' | 'liquidity';

const TokenDetailModal: React.FC<TokenDetailModalProps> = ({ token, onClose }) => {
  const { name, symbol, address, price, change_24h, volume_24h, marketCap, holders, created_at, isVerified, socialLinks, stats } = token;
  const { isAuthenticated, user } = useAuth();
  
  const [copying, setCopying] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [tonAmount, setTonAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TradeTab>('buy');
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

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

  const handleBuyToken = async () => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setProcessing(true);
    try {
      const tokenAmount = parseFloat(amount);
      const tonValue = tokenAmount * price;
      
      // In real implementation, call blockchain contract
      toast.success(`Buying ${amount} ${symbol} for ${tonValue.toFixed(4)} TON...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction time
      
      toast.success(`Successfully purchased ${amount} ${symbol}`);
      setAmount('');
      setTxHash(`EQ${Math.random().toString(36).substring(2, 42)}`); // Mock transaction hash
    } catch (error) {
      console.error("Error buying token:", error);
      toast.error("Failed to buy tokens. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  
  const handleSellToken = async () => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setProcessing(true);
    try {
      const tokenAmount = parseFloat(amount);
      const tonValue = tokenAmount * price;
      
      // In real implementation, call blockchain contract
      toast.success(`Selling ${amount} ${symbol} for ${tonValue.toFixed(4)} TON...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction time
      
      toast.success(`Successfully sold ${amount} ${symbol}`);
      setAmount('');
      setTxHash(`EQ${Math.random().toString(36).substring(2, 42)}`); // Mock transaction hash
    } catch (error) {
      console.error("Error selling token:", error);
      toast.error("Failed to sell tokens. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet first!');
      return;
    }

    if (!amount || parseFloat(amount) <= 0 || !tonAmount || parseFloat(tonAmount) <= 0) {
      toast.error('Please enter valid amounts');
      return;
    }

    try {
      setProcessing(true);
      const tokenAmountValue = parseFloat(amount);
      const tonAmountValue = parseFloat(tonAmount);
      
      // In real implementation, call blockchain contract
      toast.success(`Adding liquidity: ${amount} ${symbol} + ${tonAmount} TON...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction time
      
      toast.success('Liquidity added successfully!');
      setTxHash(`EQ${Math.random().toString(36).substring(2, 42)}`); // Mock transaction hash
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error(error instanceof Error ? error.message : 'Error adding liquidity');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setTonAmount('');
    setTxHash(null);
  };

  const renderTradeForm = () => {
    return (
      <div className="mt-4">
        {txHash ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="text-green-600 font-medium mb-2">Transaction Successful!</div>
            <div className="text-xs text-gray-500 break-all mb-2">{txHash}</div>
            <button 
              onClick={resetForm}
              className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2.5 mt-2"
            >
              New Transaction
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {activeTab === 'buy' ? `Amount to Buy (${symbol})` : 
                   activeTab === 'sell' ? `Amount to Sell (${symbol})` : 
                   `Token Amount (${symbol})`}
                </label>
                {activeTab !== 'liquidity' && (
                  <div className="text-xs text-gray-500">
                    {activeTab === 'buy' ? 'Cost' : 'Receive'}: {amount ? `${(parseFloat(amount || '0') * price).toFixed(4)} TON` : '0 TON'}
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  disabled={processing}
                />
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded-md"
                  onClick={() => setAmount((activeTab === 'buy' ? price * 10 : price * 5).toFixed(2))}
                >
                  MAX
                </button>
              </div>
            </div>
            
            {activeTab === 'liquidity' && (
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">TON Amount</label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={tonAmount}
                    onChange={(e) => setTonAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    disabled={processing}
                  />
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded-md"
                    onClick={() => setTonAmount('1.0')}
                  >
                    MAX
                  </button>
                </div>
              </div>
            )}
            
            <button
              onClick={
                activeTab === 'buy' ? handleBuyToken : 
                activeTab === 'sell' ? handleSellToken : 
                handleAddLiquidity
              }
              disabled={processing || !amount || (activeTab === 'liquidity' && !tonAmount)}
              className={`w-full py-2.5 rounded-lg font-medium text-white 
                ${processing ? 'bg-gray-400 cursor-not-allowed' : 
                  activeTab === 'buy' ? 'bg-green-600 hover:bg-green-700' : 
                  activeTab === 'sell' ? 'bg-red-600 hover:bg-red-700' : 
                  'bg-blue-600 hover:bg-blue-700'} 
                transition-colors`}
            >
              {processing ? 'Processing...' : 
               activeTab === 'buy' ? 'Buy Tokens' : 
               activeTab === 'sell' ? 'Sell Tokens' : 
               'Add Liquidity'}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-xl p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h2 className="font-bold text-lg sm:text-xl">{symbol}</h2>
            {isVerified && (
              <span className="bg-blue-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center">
                <Check size={10} className="mr-0.5 sm:w-3 sm:h-3" /> Verified
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={18} className="text-gray-500 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{name}</h1>
              <div className="flex items-center text-gray-500 text-xs sm:text-sm mt-1">
                <button 
                  onClick={copyToClipboard} 
                  className="flex items-center hover:text-blue-600 transition-colors"
                >
                  {copying ? (
                    <Check size={12} className="mr-1 text-green-500 sm:w-3.5 sm:h-3.5" />
                  ) : (
                    <Copy size={12} className="mr-1 sm:w-3.5 sm:h-3.5" />
                  )}
                  {address.substring(0, 6)}...{address.substring(address.length - 4)}
                </button>
                <a 
                  href={`https://tonscan.org/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 flex items-center hover:text-blue-600 transition-colors"
                >
                  <ExternalLink size={12} className="mr-1 sm:w-3.5 sm:h-3.5" />
                  View on TONScan
                </a>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-2xl font-bold">{price.toFixed(6)} TON</div>
              <div className={`flex items-center justify-end ${change_24h >= 0 ? 'text-green-500' : 'text-red-500'} text-xs sm:text-sm`}>
                {change_24h >= 0 ? (
                  <>
                    <TrendingUp size={14} className="mr-1 sm:w-4 sm:h-4" />
                    +{change_24h.toFixed(2)}%
                  </>
                ) : (
                  <>
                    <TrendingDown size={14} className="mr-1 sm:w-4 sm:h-4" />
                    {change_24h.toFixed(2)}%
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Token Chart */}
          <div className="mb-3 sm:mb-4">
            <TokenChart tokenAddress={address} days={7} />
          </div>
          
          {/* Token Info */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
              <div className="text-gray-500 text-xs">Market Cap</div>
              <div className="font-semibold text-xs sm:text-sm">${marketCap.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
              <div className="text-gray-500 text-xs">Volume 24h</div>
              <div className="font-semibold text-xs sm:text-sm">${volume_24h.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
              <div className="text-gray-500 text-xs">Holders</div>
              <div className="font-semibold text-xs sm:text-sm">{holders.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
              <div className="text-gray-500 text-xs">Launch Date</div>
              <div className="font-semibold text-xs sm:text-sm">{formatLaunchDate()}</div>
            </div>
          </div>
          
          {/* Additional Stats button */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center justify-between w-full p-2 sm:p-3 bg-gray-50 rounded-lg mb-3 sm:mb-4 text-sm"
          >
            <span className="font-medium">Token Statistics</span>
            {showStats ? <ChevronUp size={16} className="sm:w-4.5 sm:h-4.5" /> : <ChevronDown size={16} className="sm:w-4.5 sm:h-4.5" />}
          </button>
          
          {/* Collapsible Stats */}
          {showStats && stats && (
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <div className="text-gray-500 text-xs">All-Time High</div>
                <div className="font-semibold text-xs sm:text-sm">{stats.allTimeHigh?.toFixed(6)} TON</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">All-Time Low</div>
                <div className="font-semibold text-xs sm:text-sm">{stats.allTimeLow?.toFixed(6)} TON</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Launch Price</div>
                <div className="font-semibold text-xs sm:text-sm">{stats.launchPrice?.toFixed(6)} TON</div>
              </div>
            </div>
          )}
          
          {/* Social Links */}
          {socialLinks && (
            <div className="flex space-x-2 mb-3 sm:mb-4">
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
              )}
              {socialLinks.telegram && (
                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Twitter size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
              )}
            </div>
          )}
          
          {/* Trading Tabs */}
          <div className="mb-3 sm:mb-4">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => { 
                  setActiveTab('buy');
                  resetForm();
                }}
                className={`py-1.5 sm:py-2 px-3 sm:px-4 flex-1 font-medium text-xs sm:text-sm 
                  ${activeTab === 'buy' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              >
                Buy
              </button>
              <button
                onClick={() => { 
                  setActiveTab('sell');
                  resetForm();
                }}
                className={`py-1.5 sm:py-2 px-3 sm:px-4 flex-1 font-medium text-xs sm:text-sm 
                  ${activeTab === 'sell' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              >
                Sell
              </button>
              <button
                onClick={() => { 
                  setActiveTab('liquidity');
                  resetForm();
                }}
                className={`py-1.5 sm:py-2 px-3 sm:px-4 flex-1 font-medium text-xs sm:text-sm 
                  ${activeTab === 'liquidity' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              >
                <Plus size={14} className="inline mr-1 sm:w-4 sm:h-4" />
                Liquidity
              </button>
            </div>
            
            {renderTradeForm()}
          </div>
          
          {/* Warning */}
          <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg text-xs flex text-yellow-800">
            <AlertTriangle size={14} className="mr-2 flex-shrink-0 sm:w-4 sm:h-4" />
            <div>
              Trading tokens involves significant risk. Prices can fluctuate rapidly and you may lose your investment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetailModal; 