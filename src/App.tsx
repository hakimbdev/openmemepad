import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Rocket, Users, Wallet as WalletIcon, BarChart3 } from 'lucide-react';
import WalletConnect from './components/WalletConnect';
import TokenCard from './components/TokenCard';
import { Toaster } from 'react-hot-toast';

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

function HomePage() {
  const [recentActivity] = React.useState([
    { user: 'User638', action: 'bought', amount: '0.03', token: 'TON', time: 'just now' }
  ]);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto whitespace-nowrap py-2 -mx-4 px-4">
        {recentActivity.map((activity, index) => (
          <div key={index} className="text-white/80 text-sm">
            {activity.user} {activity.action} {activity.amount}{activity.token} ~{activity.time}
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">🔥 Spotlight</h2>
        <TokenCard
          name="Based Web3 Solutions"
          symbol="BWS"
          holders={879}
          volume="16K"
          marketCap="$217K"
          change="+15"
          isSpotlight
        />
      </div>

      <div className="flex gap-4 overflow-x-auto py-2 -mx-4 px-4">
        <button className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-medium">
          New
        </button>
        <button className="bg-white/10 text-white px-4 py-1 rounded-full text-sm font-medium">
          Live
        </button>
        <button className="bg-white/10 text-white px-4 py-1 rounded-full text-sm font-medium">
          Hot
        </button>
        <button className="bg-white/10 text-white px-4 py-1 rounded-full text-sm font-medium">
          Recent Pumps
        </button>
      </div>

      <div className="space-y-4">
        <TokenCard
          name="MIRATON"
          symbol="MIRATON"
          holders={2000}
          volume="2K"
          marketCap="$2000"
          change="+15"
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-blue-600">
        <Toaster position="top-right" />
        <Header />
        <main className="container mx-auto px-4 py-8 mb-20">
          <Routes>
            <Route path="/launch" element={<LaunchToken />} />
            <Route path="/earn" element={<Earn />} />
            <Route path="/community" element={<Community />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;