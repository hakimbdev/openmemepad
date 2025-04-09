import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Rocket, Users, Wallet as WalletIcon, BarChart3, Search, MessageCircle, ExternalLink } from 'lucide-react';
import TonWalletPlaceholder, { TonConnectUIProviderPlaceholder } from './components/TonWalletPlaceholder';
import TokenCard from './components/TokenCard';
import TokenDetailModal from './components/TokenDetailModal';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { tokenService, Token } from './services/tokenService';

// Import pages
import LaunchToken from './pages/LaunchToken';
import Earn from './pages/Earn';
import Community from './pages/Community';
import WalletPage from './pages/WalletPage';

function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white p-2 md:p-4 shadow-lg z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/earn"
          className={`flex flex-col items-center transition-colors ${
            isActive('/earn') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
          }`}
        >
          <BarChart3 size={20} className="md:w-6 md:h-6" />
          <span className="text-xs mt-1">Earn</span>
        </Link>
        <Link
          to="/"
          className={`flex flex-col items-center transition-colors ${
            isActive('/') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
          }`}
        >
          <Rocket size={20} className="md:w-6 md:h-6" />
          <span className="text-xs mt-1">Memepad</span>
        </Link>
        <Link
          to="/community"
          className={`flex flex-col items-center transition-colors ${
            isActive('/community') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
          }`}
        >
          <Users size={20} className="md:w-6 md:h-6" />
          <span className="text-xs mt-1">Community</span>
        </Link>
        <Link
          to="/wallet"
          className={`flex flex-col items-center transition-colors ${
            isActive('/wallet') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
          }`}
        >
          <WalletIcon size={20} className="md:w-6 md:h-6" />
          <span className="text-xs mt-1">Wallet</span>
        </Link>
      </div>
    </nav>
  );
}

function Header() {
  return (
    <header className="bg-blue-600 text-white p-3 sm:p-4">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <Link to="/" className="text-lg md:text-xl lg:text-2xl font-bold">Open Memepad</Link>
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 mt-2 sm:mt-0">
          <Link 
            to="/launch"
            className="bg-white text-blue-600 px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-lg font-semibold hover:bg-blue-50 transition-colors active:bg-blue-100 whitespace-nowrap"
          >
            Launch token
          </Link>
          <TonWalletPlaceholder />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-blue-800 text-white py-3 md:py-4 text-center text-xs md:text-sm">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex justify-center items-center mb-1 md:mb-2">
          <a 
            href="https://t.me/openmemepad"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-blue-300 transition-colors"
          >
            <MessageCircle size={14} className="md:w-4 md:h-4" />
            <span>Join our Telegram</span>
            <ExternalLink size={10} className="md:w-3 md:h-3" />
          </a>
        </div>
        <p className="text-white/70 text-xs">© {new Date().getFullYear()} Open Memepad. All rights reserved.</p>
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
    async function fetchTokens() {
      setLoading(true);
      try {
        const [trendingTokens, newTokens] = await Promise.all([
          tokenService.getTrendingTokens(),
          tokenService.getNewestTokens()
        ]);
        
        setTrendingTokens(trendingTokens);
        setNewTokens(newTokens);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setLoading(false);
      }
    }
    
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
    <div className="space-y-4 md:space-y-6">
      <div className="overflow-x-auto whitespace-nowrap py-2 -mx-4 px-4">
        <div className="flex gap-1.5">
        {recentActivity.map((activity, index) => (
            <div key={index} className="text-white/80 text-xs md:text-sm bg-white/10 px-2 md:px-3 py-1.5 rounded-full shrink-0">
              {activity.user} {activity.action} {activity.amount} {activity.token} • {activity.time}
          </div>
        ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">🔥 Spotlight</h2>
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
          <Search size={16} className="text-white/70 md:w-[18px] md:h-[18px]" />
        </div>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tokens..."
          className="w-full bg-white/10 text-white text-sm placeholder:text-white/60 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
        />
      </div>

      <div className="flex gap-1.5 md:gap-2 overflow-x-auto py-2 -mx-4 px-4">
        <button 
          className={`${activeFilter === 'new' ? 'bg-white text-blue-600' : 'bg-white/10 text-white'} px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium shrink-0`}
          onClick={() => setActiveFilter('new')}
        >
          New
        </button>
        <button 
          className={`${activeFilter === 'live' ? 'bg-white text-blue-600' : 'bg-white/10 text-white'} px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium shrink-0`}
          onClick={() => setActiveFilter('live')}
        >
          Live
        </button>
        <button 
          className={`${activeFilter === 'hot' ? 'bg-white text-blue-600' : 'bg-white/10 text-white'} px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium shrink-0`}
          onClick={() => setActiveFilter('hot')}
        >
          Hot
        </button>
        <button 
          className={`${activeFilter === 'pumps' ? 'bg-white text-blue-600' : 'bg-white/10 text-white'} px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium shrink-0`}
          onClick={() => setActiveFilter('pumps')}
        >
          Recent Pumps
        </button>
      </div>

      <div className="space-y-3 md:space-y-4">
        {loading ? (
          <div className="text-center py-6 md:py-8 text-white/80">
            <div className="animate-spin h-6 w-6 md:h-8 md:w-8 border-3 md:border-4 border-blue-300 border-t-blue-600 rounded-full mx-auto mb-3 md:mb-4"></div>
            <p className="text-sm md:text-base">Loading tokens...</p>
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
          <div className="text-center py-6 md:py-8 bg-white/10 rounded-lg text-white/80">
            <p className="text-sm md:text-base">No tokens found matching your criteria</p>
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
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 mb-16 md:mb-20 flex-grow">
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
    <Router>
      <TonConnectUIProviderPlaceholder
        manifestUrl="https://ton-connect.github.io/demo-dapp-with-wallet/tonconnect-manifest.json"
        uiPreferences={{ theme: "DARK" }}
        walletsListConfiguration={{
          includeWallets: [
            {
              appName: "telegram-wallet",
              name: "Wallet",
              imageUrl: "https://wallet.tg/images/logo-288.png",
              aboutUrl: "https://wallet.tg/",
              universalLink: "https://t.me/wallet/start",
              bridgeUrl: "https://bridge.tonapi.io/bridge",
              platforms: ["ios", "android", "macos", "windows", "linux"]
            }
          ]
        }}
        actionsConfiguration={{
          twaReturnUrl: 'https://t.me/WebAppWalletBot/myapp'
        }}
      >
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TonConnectUIProviderPlaceholder>
    </Router>
  );
}

export default App;