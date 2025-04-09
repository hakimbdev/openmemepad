import React from 'react';
import { Rocket, Users, TrendingUp, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Token } from '../services/tokenService';

interface TokenCardProps {
  token: Token;
  isSpotlight?: boolean;
  onClick?: () => void;
}

const TokenCard: React.FC<TokenCardProps> = ({
  token,
  isSpotlight = false,
  onClick
}) => {
  const { isAuthenticated } = useAuth();
  const { name, symbol, price, change_24h, volume_24h, marketCap, holders } = token;
  
  const isPositive = change_24h >= 0;
  const daysSinceCreation = Math.floor(
    (new Date().getTime() - new Date(token.created_at).getTime()) / (1000 * 3600 * 24)
  );
  const isNew = daysSinceCreation < 7;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num.toFixed(0)}`;
    }
  };

  const formatVolume = (vol: number): string => {
    if (vol >= 1000000) {
      return `${(vol / 1000000).toFixed(1)}M`;
    } else if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1)}K`;
    } else {
      return vol.toString();
    }
  };

  const handleBuyToken = () => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet first!');
      return;
    }
    
    // Show token details or open buy modal
    toast.success(`Preparing to buy ${symbol}...`);
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      onClick={handleBuyToken}
      className={`p-3 sm:p-4 rounded-xl ${isSpotlight ? 'bg-blue-600 text-white' : 'bg-white'} shadow-lg transition-transform hover:scale-[1.02] cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-1.5 sm:p-2 rounded-full ${isSpotlight ? 'bg-blue-500' : 'bg-blue-100'}`}>
            {isNew ? (
              <Activity size={18} className={`${isSpotlight ? 'text-white' : 'text-blue-600'} sm:w-6 sm:h-6`} />
            ) : (
              <Rocket size={18} className={`${isSpotlight ? 'text-white' : 'text-blue-600'} sm:w-6 sm:h-6`} />
            )}
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="font-bold text-base sm:text-lg">{symbol}</h3>
              {isNew && (
                <span className="ml-1 sm:ml-2 px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs font-medium bg-green-500 text-white rounded">NEW</span>
              )}
            </div>
            <p className={`text-xs sm:text-sm ${isSpotlight ? 'text-blue-100' : 'text-gray-500'}`}>{name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-sm sm:text-lg">{formatNumber(marketCap)}</p>
          <div className="flex items-center justify-end gap-1">
            <TrendingUp 
              size={12} 
              className={`${isPositive ? 'text-green-500' : 'text-red-500'} sm:w-3.5 sm:h-3.5`} 
              style={{ transform: isPositive ? 'none' : 'rotate(180deg)' }}
            />
            <p className={`text-xs sm:text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{change_24h.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
      <div className="mt-2 sm:mt-3 mb-1.5 sm:mb-2">
        <p className={`text-sm sm:text-lg font-semibold ${isSpotlight ? 'text-white' : 'text-gray-700'}`}>
          {price < 0.000001 
            ? price.toExponential(2) 
            : price.toFixed(8)
          } TON
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <Users size={12} className={`${isSpotlight ? 'text-blue-200' : 'text-gray-400'} sm:w-4 sm:h-4`} />
          <span className={`text-xs sm:text-sm ${isSpotlight ? 'text-blue-200' : 'text-gray-500'}`}>
            {holders.toLocaleString()} holders
          </span>
        </div>
        <span className={`text-xs sm:text-sm ${isSpotlight ? 'text-blue-200' : 'text-gray-500'}`}>
          Vol: {formatVolume(volume_24h)}
        </span>
      </div>
    </div>
  );
};

export default TokenCard;