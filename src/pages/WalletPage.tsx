import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

const WalletPage = () => {
  const transactions = [
    { type: 'sent', token: 'ETH', amount: '0.5', to: '0x1234...5678', time: '2h ago' },
    { type: 'received', token: 'BWS', amount: '1000', from: '0x8765...4321', time: '5h ago' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Wallet</h1>
      
      <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <Wallet className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Total Balance</h3>
            <p className="text-2xl font-bold text-blue-600">$1,234.56</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            <ArrowUpRight size={20} />
            Send
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            <ArrowDownRight size={20} />
            Receive
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${tx.type === 'sent' ? 'bg-red-100' : 'bg-green-100'}`}>
                  {tx.type === 'sent' ? (
                    <ArrowUpRight className="text-red-600" size={20} />
                  ) : (
                    <ArrowDownRight className="text-green-600" size={20} />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{tx.type === 'sent' ? 'Sent' : 'Received'} {tx.token}</p>
                  <p className="text-sm text-gray-500">
                    {tx.type === 'sent' ? `To: ${tx.to}` : `From: ${tx.from}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${tx.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                  {tx.type === 'sent' ? '-' : '+'}{tx.amount} {tx.token}
                </p>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock size={14} />
                  <span>{tx.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;