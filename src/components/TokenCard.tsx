import React from 'react';
import { Rocket, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface TokenCardProps {
  name: string;
  symbol: string;
  holders: number;
  volume: string;
  marketCap: string;
  change: string;
  isSpotlight?: boolean;
}

const TokenCard: React.FC<TokenCardProps> = ({
  name,
  symbol,
  holders,
  volume,
  marketCap,
  change,
  isSpotlight
}) => {
  const changeValue = parseFloat(change);
  const isPositive = changeValue >= 0;

  const handleBuyToken = () => {
    if (!window.ethereum) {
      toast.error('Please connect your wallet first!');
      return;
    }
    toast.success(`Preparing to buy ${symbol}...`);
  };

  return (
    <div 
      onClick={handleBuyToken}
      className={`p-4 rounded-xl ${isSpotlight ? 'bg-blue-600 text-white' : 'bg-white'} shadow-lg transition-transform hover:scale-[1.02] cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isSpotlight ? 'bg-blue-500' : 'bg-blue-100'}`}>
            <Rocket size={24} className={isSpotlight ? 'text-white' : 'text-blue-600'} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{symbol}</h3>
            <p className={`text-sm ${isSpotlight ? 'text-blue-100' : 'text-gray-500'}`}>{name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{marketCap}</p>
          <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{change}%
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className={isSpotlight ? 'text-blue-200' : 'text-gray-400'} />
          <span className={`text-sm ${isSpotlight ? 'text-blue-200' : 'text-gray-500'}`}>
            {holders.toLocaleString()} holders
          </span>
        </div>
        <span className={`text-sm ${isSpotlight ? 'text-blue-200' : 'text-gray-500'}`}>
          Vol: {volume}
        </span>
      </div>
    </div>
  );
};

export default TokenCard;