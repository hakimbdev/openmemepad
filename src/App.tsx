import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Rocket, Users, Wallet as WalletIcon, BarChart3, Search, MessageCircle, ExternalLink } from 'lucide-react';
import WalletConnect from './components/WalletConnect';
import TokenCard, { Token } from './components/TokenCard';
import TokenDetailModal from './components/TokenDetailModal';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { tonContractService } from './services/tonApi';

// Import pages
import LaunchToken from './pages/LaunchToken';
import Earn from './pages/Earn';
import Community from './pages/Community';
import WalletPage from './pages/WalletPage';

function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/earn"
          className={`flex flex-col items-center transition-colors ${
            isActive('/earn') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
          }`}
        >
          <BarChart3 size={24} />
          <span className="text-sm mt-1">Earn</span>
        </Link>
        <Link
          to="/"
          className={`flex flex-col items-center transition-colors ${
            isActive('/') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
          }`}
        >
          <Rocket size={24} />
          <span className="text-sm mt-1">Memepad</span>
        </Link>
        <Link
          to="/community"
          className={`flex flex-col items-center transition-colors ${
            isActive('/community') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
          }`}
        >
          <Users size={24} />
          <span className="text-sm mt-1">Community</span>
        </Link>
        <Link
          to="/wallet"
          className={`flex flex-col items-center transition-colors ${
            isActive('/wallet') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
          }`}
        >
          <WalletIcon size={24} />
          <span className="text-sm mt-1">Wallet</span>
        </Link>
      </div>
    </nav>
  );
}

function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Open Memepad</Link>
        <div className="flex items-center gap-4">
          <Link 
            to="/launch"
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors active:bg-blue-100"
          >
            Launch token
          </Link>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-blue-800 text-white py-4 text-center text-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center mb-2">
          <a 
            href="https://t.me/openmemepad"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-blue-300 transition-colors"
          >
            <MessageCircle size={16} />
            <span>Join our Telegram</span>
            <ExternalLink size={12} />
          </a>
        </div>
        <p className="text-white/70">© {new Date().getFullYear()} Open Memepad. All rights reserved.</p>
      </div>
    </footer>
  );
}

function HomePage() {
  const [recentActivity] = useState([
    { user: 'User638', action: 'bought', amount: '0.03', token: 'TON', time: 'just now' },
    { user: 'TONWhale', action: 'sold', amount: '1.5', token: 'TNGR', time: '5 min ago' },
    { user: 'MemeCollector', action: 'bought', amount: '500', token: 'TPEPE', time: '12 min ago' }
  ]);

  const [trendingTokens, setTrendingTokens] = useState<Token[]>([]);
  const [newTokens, setNewTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('new');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        
        // Use our TON contract service to fetch token data
        const allTokens = await tonContractService.getAllTokens();
        
        if (allTokens.length > 0) {
          // For simplicity, let's divide the tokens into trending and new
          // In a production app, we would use more sophisticated criteria
          const midPoint = Math.floor(allTokens.length / 2);
          
          // Get trending tokens (first half of the list, sorted by volume)
          const trending = [...allTokens.slice(0, midPoint)]
            .sort((a, b) => b.volume_24h - a.volume_24h);
          
          // Get new tokens (second half, sorted by creation date)
          const newest = [...allTokens.slice(midPoint)]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          setTrendingTokens(trending);
          setNewTokens(newest);
        } else {
          // Fallback to mock data
          setTrendingTokens(tonContractService.getMockTokens().slice(0, 4));
          setNewTokens(tonContractService.getMockTokens().slice(4));
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
        
        // Fallback to mock data
        setTrendingTokens(tonContractService.getMockTokens().slice(0, 4));
        setNewTokens(tonContractService.getMockTokens().slice(4));
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const handleTokenClick = (token: Token) => {
    setSelectedToken(token);
  };

  const filteredTokens = () => {
    let tokens = [];
    
    switch (activeFilter) {
      case 'new':
        tokens = newTokens;
        break;
      case 'live':
        tokens = [...trendingTokens, ...newTokens].sort((a, b) => b.volume_24h - a.volume_24h);
        break;
      case 'hot':
        tokens = [...trendingTokens, ...newTokens].sort((a, b) => b.change_24h - a.change_24h);
        break;
      case 'pumps':
        tokens = [...trendingTokens, ...newTokens].filter(t => t.change_24h > 10);
        break;
      default:
        tokens = newTokens;
    }
    
    // Apply search filter if we have a query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return tokens.filter(token => 
        token.name.toLowerCase().includes(query) || 
        token.symbol.toLowerCase().includes(query)
      );
    }
    
    return tokens;
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto whitespace-nowrap py-2 -mx-4 px-4">
        <div className="flex gap-1.5">
          {recentActivity.map((activity, index) => (
            <div key={index} className="text-white/80 text-sm bg-white/10 px-3 py-1.5 rounded-full">
              {activity.user} {activity.action} {activity.amount} {activity.token} • {activity.time}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">🔥 Spotlight</h2>
        {trendingTokens.length > 0 && (
          <TokenCard 
            token={trendingTokens[0]} 
            isSpotlight 
            onClick={() => handleTokenClick(trendingTokens[0])}
          />
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={18} className="text-white/70" />
        </div>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tokens..."
          className="w-full bg-white/10 text-white placeholder:text-white/60 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto py-2 -mx-4 px-4">
        <button 
          className={`${activeFilter === 'new' ? 'bg-white text-blue-600' : 'bg-white/10 text-white'} px-4 py-1 rounded-full text-sm font-medium`}
          onClick={() => setActiveFilter('new')}
        >
          New
        </button>
        <button 
          className={`${activeFilter === 'live' ? 'bg-white text-blue-600' : 'bg-white/10 text-white'} px-4 py-1 rounded-full text-sm font-medium`}
          onClick={() => setActiveFilter('live')}
        >
          Live
        </button>
        <button 
          className={`${activeFilter === 'hot' ? 'bg-white text-blue-600' : 'bg-white/10 text-white'} px-4 py-1 rounded-full text-sm font-medium`}
          onClick={() => setActiveFilter('hot')}
        >
          Hot
        </button>
        <button 
          className={`${activeFilter === 'pumps' ? 'bg-white text-blue-600' : 'bg-white/10 text-white'} px-4 py-1 rounded-full text-sm font-medium`}
          onClick={() => setActiveFilter('pumps')}
        >
          Recent Pumps
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-white/80">
            <div className="animate-spin h-8 w-8 border-4 border-blue-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
            <p>Loading tokens...</p>
          </div>
        ) : filteredTokens().length > 0 ? (
          filteredTokens().map(token => (
            <TokenCard 
              key={token.id} 
              token={token} 
              onClick={() => handleTokenClick(token)}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-white/10 rounded-lg text-white/80">
            <p>No tokens found matching your criteria</p>
          </div>
        )}
      </div>

      {selectedToken && (
        <TokenDetailModal 
          token={selectedToken} 
          onClose={() => setSelectedToken(null)} 
        />
      )}
    </div>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-blue-600 flex flex-col">
      <Toaster position="top-right" />
      <Header />
      <main className="container mx-auto px-4 py-8 mb-20 flex-grow">
        <Routes>
          <Route path="/launch" element={<LaunchToken />} />
          <Route path="/earn" element={<Earn />} />
          <Route path="/community" element={<Community />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;