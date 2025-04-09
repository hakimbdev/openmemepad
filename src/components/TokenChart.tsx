import React, { useEffect, useState } from 'react';
import { tokenService, PricePoint } from '../services/tokenService';

interface TokenChartProps {
  tokenAddress: string;
  days?: number;
}

const TokenChart: React.FC<TokenChartProps> = ({ tokenAddress, days = 7 }) => {
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [highestPrice, setHighestPrice] = useState<number>(0);
  const [lowestPrice, setLowestPrice] = useState<number>(0);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await tokenService.getTokenPriceHistory(tokenAddress, days);
        setPriceData(data);
        
        // Calculate highest and lowest prices for scaling
        if (data.length > 0) {
          const prices = data.map(point => point.price);
          setHighestPrice(Math.max(...prices));
          setLowestPrice(Math.min(...prices));
        }
      } catch (err) {
        console.error('Error fetching price history:', err);
        setError('Failed to load price history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPriceHistory();
  }, [tokenAddress, days]);

  // Simple function to normalize price for chart display
  const normalizePrice = (price: number): number => {
    if (highestPrice === lowestPrice) return 50; // Middle position if all prices are the same
    return 100 - ((price - lowestPrice) / (highestPrice - lowestPrice) * 100);
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      );
    }
    
    if (error || priceData.length === 0) {
      return (
        <div className="flex justify-center items-center h-full text-gray-500">
          No price data available
        </div>
      );
    }
    
    // Generate SVG path for the chart line
    const pathData = priceData.map((point, index) => {
      const x = (index / (priceData.length - 1)) * 100;
      const y = normalizePrice(point.price);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    // Determine if price trend is positive
    const isPositive = priceData.length >= 2 && 
      priceData[priceData.length - 1].price >= priceData[0].price;
    
    const chartColor = isPositive ? '#22c55e' : '#ef4444'; // green-500 or red-500
    
    return (
      <div className="relative w-full h-full">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Chart line */}
          <path
            d={pathData}
            fill="none"
            stroke={chartColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Fill area beneath line */}
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill={`${chartColor}20`} // 20% opacity
          />
        </svg>
        
        {/* Price range indicator */}
        <div className="absolute top-0 right-0 text-xs font-medium text-gray-500">
          {highestPrice.toFixed(6)} TON
        </div>
        <div className="absolute bottom-0 right-0 text-xs font-medium text-gray-500">
          {lowestPrice.toFixed(6)} TON
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-32 bg-white rounded-lg p-4">
      <div className="flex justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Price History</h3>
        <span className="text-sm text-gray-500">Last {days} days</span>
      </div>
      <div className="h-20">
        {renderChart()}
      </div>
    </div>
  );
};

export default TokenChart; 