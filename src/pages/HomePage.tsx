import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { Token } from '../types/Token';
import { Hero } from '../components/Hero';
import { TokenCard } from '../components/TokenCard';
import { TokenDetailModal } from '../components/TokenDetailModal';
import { LoaderCircle } from '../components/LoaderCircle';

function HomePage() {
  const [trendingTokens, setTrendingTokens] = useState<Token[]>([]);
  const [newTokens, setNewTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const trendingData = await api.getTrendingTokens();
        const newData = await api.getNewTokens();
        setTrendingTokens(trendingData);
        setNewTokens(newData);
      } catch (error) {
        console.error('Error fetching tokens:', error);
        toast.error('Failed to load tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const handleTokenClick = (token: Token) => {
    setSelectedToken(token);
    setIsDetailsOpen(true);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Hero />
      
      {loading ? (
        <div className="flex justify-center my-8">
          <LoaderCircle className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : (
        <>
          <section className="mt-6 sm:mt-10">
            <div className="flex justify-between items-center mb-3 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-bold">Trending</h2>
              <Link to="/tokens" className="text-blue-600 text-xs sm:text-sm font-medium hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {trendingTokens.slice(0, 3).map((token) => (
                <TokenCard 
                  key={token.id}
                  token={token}
                  onClick={() => handleTokenClick(token)}
                />
              ))}
            </div>
          </section>
          
          <section className="mt-6 sm:mt-10">
            <div className="flex justify-between items-center mb-3 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-bold">Recently Launched</h2>
              <Link to="/tokens" className="text-blue-600 text-xs sm:text-sm font-medium hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {newTokens.slice(0, 3).map((token) => (
                <TokenCard 
                  key={token.id}
                  token={token}
                  onClick={() => handleTokenClick(token)}
                />
              ))}
            </div>
          </section>
        </>
      )}
      
      {selectedToken && (
        <TokenDetailModal 
          token={selectedToken}
          onClose={() => setIsDetailsOpen(false)}
          isOpen={isDetailsOpen}
        />
      )}
    </div>
  );
}

export default HomePage; 