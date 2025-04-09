import React, { useState } from 'react';
import { X, AlertTriangle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { stakingApi } from '../services/api';
import { tonContractService, StakingPool } from '../services/tonApi';

interface StakingModalProps {
  pool: StakingPool;
  onClose: () => void;
}

const StakingModal: React.FC<StakingModalProps> = ({ pool, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleStake = async () => {
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
      const stakeAmount = parseFloat(amount);
      
      // Ensure user has enough balance
      if (user.balance && stakeAmount > user.balance) {
        toast.error('Insufficient balance');
        return;
      }

      toast.success(`Staking ${amount} TON in ${pool.name}...`);
      
      // Call staking service using tonContractService
      const result = await tonContractService.stakeTokens({
        poolId: pool.id,
        amount: stakeAmount
      }, user.address);

      if (result.success) {
        setTxHash(result.txHash || null);
        toast.success('Tokens staked successfully!');
      } else {
        throw new Error(result.error || 'Failed to stake tokens');
      }
    } catch (error) {
      console.error('Staking error:', error);
      toast.error(error instanceof Error ? error.message : 'Error staking tokens');
    } finally {
      setProcessing(false);
    }
  };

  // Calculate estimated rewards
  const calculateEstimatedRewards = () => {
    if (!amount || parseFloat(amount) <= 0) return '0';
    
    const amountNum = parseFloat(amount);
    const rewards = tonContractService.calculateStakingRewards(
      amountNum, 
      pool.apr, 
      pool.lockPeriodDays
    );
    
    return rewards.toFixed(4);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold">Stake in {pool.name}</h2>
              <p className="text-gray-500 text-sm">Estimated APR: {pool.apr}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 rounded-full p-1"
            >
              <X size={20} />
            </button>
          </div>

          {txHash ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-3xl">✓</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Staking Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your tokens have been successfully staked.
              </p>
              <div className="text-sm text-gray-500 mb-4">
                Transaction Hash: {txHash.slice(0, 6)}...{txHash.slice(-4)}
              </div>
              <button
                onClick={onClose}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                  <Clock className="text-blue-500" size={20} />
                  <div className="text-sm text-blue-800">
                    Lock period: <span className="font-bold">{pool.lockPeriodDays} days</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Stake
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter amount in TON"
                      disabled={processing}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700">
                      TON
                    </div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>Min: 0.001 TON</span>
                    <span>Balance: {user?.balance?.toFixed(2) || '0'} TON</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">APR:</span>
                    <span className="font-medium text-green-600">{pool.apr}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Lock Period:</span>
                    <span className="font-medium">{pool.lockPeriodDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Estimated Rewards:</span>
                    <span className="font-medium">
                      {calculateEstimatedRewards()} TON
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleStake}
                  disabled={processing || !amount || parseFloat(amount) <= 0}
                  className={`w-full py-2 px-4 rounded-lg font-medium ${
                    processing || !amount || parseFloat(amount) <= 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } transition-colors`}
                >
                  {processing ? 'Processing...' : 'Stake Now'}
                </button>
              </div>
              
              <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium">Risk Warning</p>
                    <p className="text-yellow-700 mt-1">
                      Your tokens will be locked for {pool.lockPeriodDays} days. Early unstaking is not possible.
                      Staking rewards are not guaranteed and can vary based on network conditions.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StakingModal; 