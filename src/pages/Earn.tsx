import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

const Earn = () => {
  const stakingPools = [
    { name: 'BWS-ETH LP', apr: '120%', tvl: '$1.2M' },
    { name: 'MIRATON-ETH LP', apr: '85%', tvl: '$800K' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Earn Rewards</h1>
      
      <div className="grid gap-6">
        {stakingPools.map((pool, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold">{pool.name}</h3>
              </div>
              <div className="flex items-center gap-2 text-green-500">
                <TrendingUp size={20} />
                <span className="font-semibold">{pool.apr} APR</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>TVL: {pool.tvl}</span>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Stake
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Earn;