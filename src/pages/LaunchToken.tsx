import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import WalletConnect from '../components/WalletConnect';
import { tokenService, TokenCreationParams } from '../services/tokenService';
import { AlertTriangle, Info, Check, Lock, TrendingUp, Rocket, ExternalLink } from 'lucide-react';

interface TokenCreationResult {
  txHash: string;
  tokenAddress: string;
}

// Extended token template options
interface TokenTemplate {
  name: string;
  description: string;
  features: string[];
  recommended: boolean;
}

const LaunchToken = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState({
    token_name: '',
    token_symbol: '',
    total_supply: '',
    description: '',
    website: '',
    telegram: '',
    twitter: '',
    initial_price: '0.00000001'
  });
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<TokenCreationResult | null>(null);

  // Blum Memepad token templates
  const tokenTemplates: TokenTemplate[] = [
    {
      name: "Meme Token",
      description: "Standard meme token with basic tokenomics",
      features: ["No transaction tax", "Simple liquidity pool", "Standard TON functionality"],
      recommended: true
    },
    {
      name: "Reflection Token",
      description: "Token with holder rewards on each transaction",
      features: ["2% reflection to holders", "3% to liquidity", "Anti-whale mechanism"],
      recommended: false
    },
    {
      name: "Deflationary Token",
      description: "Automatically burns a percentage of each transaction",
      features: ["1% automatic burn", "2% to marketing wallet", "Decreasing supply over time"],
      recommended: false
    }
  ];

  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplate(templateName);
    
    // Pre-fill some fields based on template
    if (templateName === "Meme Token") {
      setTokenData(prev => ({
        ...prev,
        description: "A community-driven meme token on TON blockchain.",
        initial_price: '0.00000001'
      }));
    } else if (templateName === "Reflection Token") {
      setTokenData(prev => ({
        ...prev,
        description: "Reflection token that rewards holders with passive income on every transaction.",
        initial_price: '0.00000005'
      }));
    } else if (templateName === "Deflationary Token") {
      setTokenData(prev => ({
        ...prev,
        description: "Deflationary token with automatic burn mechanism, decreasing supply over time.",
        initial_price: '0.0000001'
      }));
    }
    
    // Move to next step
    setActiveStep(2);
  };

  const validateStep1 = () => {
    if (!selectedTemplate) {
      toast.error('Please select a token template');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!tokenData.token_name) {
      toast.error('Token name is required');
      return false;
    }
    if (!tokenData.token_symbol) {
      toast.error('Token symbol is required');
      return false;
    }
    if (tokenData.token_symbol.length < 2 || tokenData.token_symbol.length > 10) {
      toast.error('Token symbol must be between 2-10 characters');
      return false;
    }
    if (!tokenData.total_supply || Number(tokenData.total_supply) <= 0) {
      toast.error('Total supply must be a positive number');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (activeStep === 1 && !validateStep1()) return;
    if (activeStep === 2 && !validateStep2()) return;
    
    setActiveStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setActiveStep(prevStep => Math.max(1, prevStep - 1));
  };

  const handleLaunchToken = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!tokenData.token_name || !tokenData.token_symbol || !tokenData.total_supply || !tokenData.initial_price) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare token parameters
      const tokenParams: TokenCreationParams = {
        name: tokenData.token_name,
        symbol: tokenData.token_symbol,
        initialSupply: parseFloat(tokenData.total_supply),
        initialPrice: parseFloat(tokenData.initial_price) || 0.001,
        description: tokenData.description || `${tokenData.token_name} - a TON meme token`,
        socialLinks: {
          website: tokenData.website || '',
          telegram: tokenData.telegram || '',
          twitter: tokenData.twitter || ''
        }
      };
      
      const result = await tokenService.launchToken(tokenParams, user?.address || '');
      
      if (result.success) {
        toast.success(`Successfully launched ${tokenData.token_name} (${tokenData.token_symbol})!`);
        setCreatedToken({
          txHash: result.txHash || '',
          tokenAddress: result.tokenAddress || ''
        });
        
        // Reset form
        setTokenData({
          token_name: '',
          token_symbol: '',
          total_supply: '',
          description: '',
          website: '',
          telegram: '',
          twitter: '',
          initial_price: '0.00000001'
        });
        setSelectedTemplate('custom');
      } else {
        throw new Error(result.error || 'Failed to launch token');
      }
    } catch (error) {
      console.error('Error launching token:', error);
      toast.error('Failed to launch token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTokenData({
      token_name: '',
      token_symbol: '',
      total_supply: '',
      description: '',
      website: '',
      telegram: '',
      twitter: '',
      initial_price: '0.00000001'
    });
    setSelectedTemplate(null);
    setActiveStep(1);
    setCreatedToken(null);
  };

  if (!isAuthenticated) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Launch Your Token</h1>
        <div className="bg-white/10 text-white p-6 rounded-lg shadow-lg">
          <p className="text-xl mb-6 text-center">Connect your wallet to launch tokens</p>
          <div className="flex justify-center">
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  // Steps progress bar
  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex flex-col items-center ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${activeStep >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
              <Check size={20} className={activeStep > 1 ? 'block' : 'hidden'} />
              <span className={activeStep <= 1 ? 'block' : 'hidden'}>1</span>
            </div>
            <span className="text-xs">Template</span>
          </div>
          
          <div className={`flex-1 h-1 mx-4 ${activeStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          <div className={`flex flex-col items-center ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${activeStep >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
              <Check size={20} className={activeStep > 2 ? 'block' : 'hidden'} />
              <span className={activeStep !== 2 ? 'hidden' : 'block'}>2</span>
            </div>
            <span className="text-xs">Details</span>
          </div>
          
          <div className={`flex-1 h-1 mx-4 ${activeStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          <div className={`flex flex-col items-center ${activeStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${activeStep >= 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
              <span>3</span>
            </div>
            <span className="text-xs">Launch</span>
          </div>
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Choose Token Template</h2>
        <p className="text-gray-600 mb-6">
          Select a template for your token to get started. Each template has different features and tokenomics.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {tokenTemplates.map((template, index) => (
            <div 
              key={index}
              onClick={() => handleTemplateSelect(template.name)}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedTemplate === template.name 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{template.name}</h3>
                {template.recommended && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              <ul className="text-sm space-y-1">
                {template.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check size={16} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-6">
          <div></div> {/* Empty div for spacing */}
          <button
            onClick={nextStep}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Token Details</h2>
        <p className="text-gray-600 mb-6">
          Customize your token by providing the necessary information.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Name *
            </label>
            <input
              type="text"
              value={tokenData.token_name}
              onChange={(e) => setTokenData({ ...tokenData, token_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Awesome Meme Token"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Symbol *
            </label>
            <input
              type="text"
              value={tokenData.token_symbol}
              onChange={(e) => setTokenData({ ...tokenData, token_symbol: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., AMT"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The token symbol should be 2-10 characters (e.g., BTC, ETH, USDT)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Supply *
            </label>
            <input
              type="number"
              value={tokenData.total_supply}
              onChange={(e) => setTokenData({ ...tokenData, total_supply: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 1000000000"
              min="1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={tokenData.description}
              onChange={(e) => setTokenData({ ...tokenData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Describe your token..."
              required
            />
          </div>
          
          <div className="border-t pt-4 mt-4">
            <button
              type="button"
              onClick={() => setAdvancedOptions(!advancedOptions)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              {advancedOptions ? 'Hide' : 'Show'} Advanced Options
            </button>
            
            {advancedOptions && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Price (TON)
                  </label>
                  <input
                    type="text"
                    value={tokenData.initial_price}
                    onChange={(e) => setTokenData({ ...tokenData, initial_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 0.00000001"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Initial price in TON. This affects the initial market cap.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={tokenData.website}
                    onChange={(e) => setTokenData({ ...tokenData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://yourtokenwebsite.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telegram Group
                  </label>
                  <input
                    type="url"
                    value={tokenData.telegram}
                    onChange={(e) => setTokenData({ ...tokenData, telegram: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://t.me/yourgroup"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter Profile
                  </label>
                  <input
                    type="url"
                    value={tokenData.twitter}
                    onChange={(e) => setTokenData({ ...tokenData, twitter: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://twitter.com/yourtoken"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Launch Your Token</h2>
        <p className="text-gray-600 mb-6">
          Review your token details and click the button below to launch your token on TON blockchain.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3">Token Details Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Name:</p>
              <p className="font-medium">{tokenData.token_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Symbol:</p>
              <p className="font-medium">{tokenData.token_symbol}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Supply:</p>
              <p className="font-medium">{tokenData.total_supply}</p>
            </div>
            <div>
              <p className="text-gray-600">Initial Price:</p>
              <p className="font-medium">{tokenData.initial_price} TON</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600">Description:</p>
              <p className="font-medium">{tokenData.description}</p>
            </div>
            
            {tokenData.website && (
              <div>
                <p className="text-gray-600">Website:</p>
                <p className="font-medium">{tokenData.website}</p>
              </div>
            )}
            
            {tokenData.telegram && (
              <div>
                <p className="text-gray-600">Telegram:</p>
                <p className="font-medium">{tokenData.telegram}</p>
              </div>
            )}
            
            {tokenData.twitter && (
              <div>
                <p className="text-gray-600">Twitter:</p>
                <p className="font-medium">{tokenData.twitter}</p>
              </div>
            )}
            
            <div className="col-span-2">
              <p className="text-gray-600">Template:</p>
              <p className="font-medium">{selectedTemplate}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle size={20} className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">Important Information:</p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Launching a token requires at least 0.5 TON to cover deployment costs.</li>
                <li>• Your current balance: {user?.balance?.toFixed(4) || '0'} TON</li>
                <li>• Once launched, token properties cannot be changed.</li>
                <li>• You will own 100% of the initial supply of tokens.</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleLaunchToken}
            disabled={loading}
            className={`flex items-center ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-6 rounded-lg font-semibold transition-colors`}
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Launch Token
              </>
            ) : (
              <>
                <Rocket size={18} className="mr-2" />
                Launch Token
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Launch Your Token</h1>
      
      {createdToken ? (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4 inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-xl font-bold">Token Created Successfully!</h3>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Token Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2"><span className="font-semibold">Name:</span> {tokenData.token_name}</p>
              <p className="mb-2"><span className="font-semibold">Symbol:</span> {tokenData.token_symbol}</p>
              <p className="mb-2"><span className="font-semibold">Total Supply:</span> {tokenData.total_supply}</p>
              <p className="mb-2"><span className="font-semibold">Initial Price:</span> {tokenData.initial_price} TON</p>
              <p className="mb-2"><span className="font-semibold">Token Address:</span> <code className="bg-gray-100 px-1 rounded">{createdToken.tokenAddress}</code></p>
              <p className="mb-2"><span className="font-semibold">Transaction Hash:</span> <code className="bg-gray-100 px-1 rounded">{createdToken.txHash}</code></p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800">Next Steps:</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>1. Add liquidity to your token to enable trading</li>
                  <li>2. Share your token with the community</li>
                  <li>3. Monitor your token's performance in the wallet section</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={resetForm}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Another Token
            </button>
            
            <a
              href={`https://tonscan.org/address/${createdToken.tokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              View on TONScan
              <ExternalLink size={16} className="ml-2" />
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          {renderStepIndicator()}
          {activeStep === 1 && renderStep1()}
          {activeStep === 2 && renderStep2()}
          {activeStep === 3 && renderStep3()}
        </div>
      )}
    </div>
  );
};

export default LaunchToken;