import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CalendarClock, Clock } from 'lucide-react';
import StakingModal from '../components/StakingModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { tonContractService, StakingPool, UserStake } from '../services/tonApi';

const Earn = () => {
  const { isAuthenticated, user } = useAuth();
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [userStakes, setUserStakes] = useState<UserStake[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch staking pools
        const pools = await tonContractService.getStakingPools();
        setStakingPools(pools);
        
        // Fetch user stakes if authenticated
        if (isAuthenticated && user?.address) {
          const stakes = await tonContractService.getUserStakes(user.address);
          setUserStakes(stakes);
        }
      } catch (error) {
        console.error('Error fetching staking data:', error);
        toast.error('Failed to load staking data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, user?.address]);
  
  const openStakingModal = (pool: StakingPool) => {
    setSelectedPool(pool);
  };
  
  const closeStakingModal = () => {
    setSelectedPool(null);
    
    // Refresh user stakes when modal is closed (in case they staked)
    if (isAuthenticated && user?.address) {
      tonContractService.getUserStakes(user.address)
        .then(stakes => setUserStakes(stakes))
        .catch(error => console.error('Error refreshing stakes:', error));
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Earn Rewards</h1>
      
      {isAuthenticated && userStakes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Your Active Stakes</h2>
          <div className="grid gap-4">
            {userStakes.map((stake) => (
              <div key={stake.id} className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <BarChart3 className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{stake.poolName}</h3>
                      <p className="text-sm text-gray-500">Staked on {formatDate(stake.staked_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-500">
                    <TrendingUp size={20} />
                    <span className="font-semibold">{stake.apr} APR</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Staked</p>
                    <p className="font-semibold">{stake.amount} TON</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Est. Reward</p>
                    <p className="font-semibold text-green-600">+{stake.estimated_reward.toFixed(2)} TON</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Remaining</p>
                      <p className="font-semibold">{stake.days_remaining} days</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={async () => {
                    if (user?.address) {
                      try {
                        toast.success('Processing unstake request...');
                        const result = await tonContractService.unstakeTokens(stake.id, user.address);
                        if (result.success) {
                          toast.success('Unstake request successful!');
                          // Refresh stakes
                          const updatedStakes = await tonContractService.getUserStakes(user.address);
                          setUserStakes(updatedStakes);
                        } else {
                          throw new Error(result.error);
                        }
                      } catch (error) {
                        console.error('Unstake error:', error);
                        toast.error(error instanceof Error ? error.message : 'Error processing unstake');
                      }
                    }
                  }}
                  className="mt-2 w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  disabled={stake.days_remaining > 0}
                >
                  {stake.days_remaining > 0 ? `Locked for ${stake.days_remaining} more days` : 'Unstake'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <h2 className="text-xl font-bold text-white mb-4">Available Pools</h2>
      
      {isLoading ? (
        <div className="text-center py-8 text-white/80">
          <div className="animate-spin h-8 w-8 border-4 border-blue-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p>Loading pools...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {stakingPools.map((pool) => (
            <div key={pool.id} className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <BarChart3 className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{pool.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <CalendarClock size={14} />
                      <span>{pool.lockPeriodDays} days lock</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-500">
                  <TrendingUp size={20} />
                  <span className="font-semibold">{pool.apr} APR</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>TVL: {pool.tvl}</span>
                <button 
                  onClick={() => openStakingModal(pool)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Stake
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedPool && (
        <StakingModal 
          pool={selectedPool} 
          onClose={closeStakingModal} 
        />
      )}
    </div>
  );
};

export default Earn;