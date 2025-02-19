import React from 'react';
import { MessageCircle, Users, Twitter } from 'lucide-react';

const Community = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Community</h1>
      
      <div className="grid gap-6">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageCircle className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Telegram Group</h3>
              <p className="text-gray-600">Join our active Telegram community</p>
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Join Telegram
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <Twitter className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Twitter</h3>
              <p className="text-gray-600">Follow us for latest updates</p>
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Follow on Twitter
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Discord Server</h3>
              <p className="text-gray-600">Join our Discord community</p>
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Join Discord
          </button>
        </div>
      </div>
    </div>
  );
};

export default Community;