import { toast } from 'react-hot-toast';
import axios from 'axios';
import { tonApi } from './api';

// Types
export interface Token {
  id: number;
  name: string;
  symbol: string;
  address: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  marketCap: number;
  holders: number;
  created_at: string;
  description?: string;
  isVerified?: boolean;
  socialLinks?: {
    website?: string;
    telegram?: string;
    twitter?: string;
  };
  stats?: {
    allTimeHigh?: number;
    allTimeLow?: number;
    launchPrice?: number;
  };
}

export interface TokenCreationParams {
  name: string;
  symbol: string;
  initialSupply: number;
  initialPrice: number;
  description: string;
  socialLinks?: {
    website?: string;
    telegram?: string;
    twitter?: string;
  };
}

export interface TradeParams {
  tokenAddress: string;
  amount: number;
}

export interface LiquidityParams {
  tokenAddress: string;
  tokenAmount: number;
  tonAmount: number;
}

export interface PricePoint {
  timestamp: number;
  price: number;
}

// Mock token data for development
const MOCK_TOKENS = [
  {
    id: 1,
    name: 'Tonigger',
    symbol: 'TNGR',
    address: 'EQAvDfYnmvuJJ-UWV5qS6_F9g2jIoJbRyjETRvL90VY2JS4w',
    price: 0.0025,
    change_24h: 5.2,
    volume_24h: 45000,
    marketCap: 250000,
    holders: 1200,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'TON AI',
    symbol: 'TAI',
    address: 'EQD_s-QtvpfEMGn0t1i8_4g_i-kOs0GQ88SfaSgez3LyTVGj',
    price: 0.015,
    change_24h: -2.5,
    volume_24h: 125000,
    marketCap: 1750000,
    holders: 4500,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: 'Toncats',
    symbol: 'TCAT',
    address: 'EQBIhR8LLu9zVYAYYYda9OU3dJKECCHgjdEPYMcvZRRn1uHp',
    price: 0.0045,
    change_24h: 12.7,
    volume_24h: 78000,
    marketCap: 450000,
    holders: 2300,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: 'Meme Kombat',
    symbol: 'MK',
    address: 'EQCayjzBc05oUrwwJeI217qZsQSCnXXQpBw1fZZnWGwcXRXB',
    price: 0.0075,
    change_24h: 3.1,
    volume_24h: 95000,
    marketCap: 750000,
    holders: 2900,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    name: 'TONdoge',
    symbol: 'TDOGE',
    address: 'EQBiPKaQGIOuBx5fDFVJhEcXXXbGG5ISCOgTlEf0V9LRYFoq',
    price: 0.0003,
    change_24h: 25.3,
    volume_24h: 135000,
    marketCap: 300000,
    holders: 5200,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock price history for development
const generatePriceHistory = (basePrice: number, days: number = 30) => {
  const priceHistory = [];
  let currentPrice = basePrice * 0.7; // Start at 70% of current price
  
  for (let i = days; i >= 0; i--) {
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - i);
    
    // Add random fluctuation (-5% to +5%)
    const fluctuation = 1 + (Math.random() * 0.1 - 0.05);
    currentPrice *= fluctuation;
    
    // Add occasional spikes or dips
    if (Math.random() > 0.9) {
      const spike = 1 + (Math.random() * 0.2 - 0.1);
      currentPrice *= spike;
    }
    
    priceHistory.push({
      timestamp: timestamp.toISOString(),
      price: currentPrice
    });
  }
  
  // Ensure the last price matches the current price
  priceHistory[priceHistory.length - 1].price = basePrice;
  
  return priceHistory;
};

// Generate a unique token address
const generateTokenAddress = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let address = 'EQ';
  
  for (let i = 0; i < 44; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return address;
};

// Service class for TON blockchain interactions
class TonService {
  private toncenterApiKey = 'your_api_key_here'; // Replace with actual key
  private tonapiKey = 'your_tonapi_key_here'; // Replace with actual key
  
  private toncenterApi = axios.create({
    baseURL: 'https://toncenter.com/api/v2/',
    headers: {
      'X-API-Key': this.toncenterApiKey,
      'Content-Type': 'application/json'
    }
  });

  // Get wallet information
  async getWalletInfo(address: string) {
    try {
      const response = await this.toncenterApi.get(`getAddressInformation?address=${address}`);
      if (response.data?.ok) {
        const balanceNano = BigInt(response.data.result.balance || '0');
        return {
          address,
          balance: Number(balanceNano) / 1_000_000_000, // Convert from nanoTON to TON
          state: response.data.result.state
        };
      }
      throw new Error('Failed to get wallet information');
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      return null;
    }
  }

  // Get transaction history for an address
  async getTransactionHistory(address: string, limit = 20) {
    try {
      const response = await this.toncenterApi.get(`getTransactions?address=${address}&limit=${limit}`);
      if (response.data?.ok) {
        return response.data.result;
      }
      return [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Convert raw address to user-friendly format
  async convertToUserFriendlyAddress(address: string) {
    try {
      const response = await this.toncenterApi.get(`packAddress?address=${encodeURIComponent(address)}`);
      if (response.data?.ok) {
        return response.data.result;
      }
      return address;
    } catch (error) {
      console.error('Error converting address:', error);
      return address;
    }
  }

  // Get all tokens
  async getAllTokens(): Promise<Token[]> {
    try {
      // Use tonApi from api.ts (which is already set up)
      const response = await tonApi.get('/jettons');
      
      if (response.data && Array.isArray(response.data.jettons)) {
        return response.data.jettons.map((token: any, index: number) => ({
          id: index + 1,
          name: token.name || 'Unknown Token',
          symbol: token.symbol || 'UNKNOWN',
          address: token.address || '',
          price: token.price?.usd || 0,
          change_24h: token.price_change_24h || 0,
          volume_24h: token.volume_24h || 0,
          marketCap: token.market_cap || 0,
          holders: token.holders_count || 0,
          created_at: token.created_at || new Date().toISOString(),
          isVerified: index % 3 === 0, // Simulate verification status
          socialLinks: {
            website: token.metadata?.website || '',
            telegram: token.metadata?.telegram_group || '',
            twitter: token.metadata?.twitter || ''
          },
          stats: {
            allTimeHigh: token.price?.usd ? token.price.usd * 1.5 : 0,
            allTimeLow: token.price?.usd ? token.price.usd * 0.5 : 0,
            launchPrice: token.price?.usd ? token.price.usd * 0.7 : 0
          }
        }));
      }
      
      // Fallback to mock data
      return this.getMockTokens();
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return this.getMockTokens();
    }
  }

  // Get trending tokens
  async getTrendingTokens(): Promise<Token[]> {
    try {
      // In production, this would call an actual API
      // return await axios.get('/api/tokens/trending');
      
      // For development, return mock data
      return MOCK_TOKENS.sort((a, b) => b.volume_24h - a.volume_24h);
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      return [];
    }
  }

  // Get recently launched tokens
  async getNewTokens(): Promise<Token[]> {
    try {
      // In production, this would call an actual API
      // return await axios.get('/api/tokens/new');
      
      // For development, return mock data sorted by creation date
      return MOCK_TOKENS.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching new tokens:', error);
      return [];
    }
  }

  // Get token details by address
  async getTokenDetails(address: string): Promise<Token | null> {
    try {
      // In production, this would call an actual API
      // return await axios.get(`/api/tokens/${address}`);
      
      // For development, find token in mock data
      const token = MOCK_TOKENS.find(t => t.address === address);
      
      if (!token) {
        throw new Error('Token not found');
      }
      
      return token;
    } catch (error) {
      console.error(`Error fetching token details for ${address}:`, error);
      throw error;
    }
  }

  // Get token price history
  async getTokenPriceHistory(address: string): Promise<PricePoint[]> {
    try {
      // In production, this would call an actual API
      // return await axios.get(`/api/tokens/${address}/price-history`);
      
      // For development, generate mock price history
      const token = MOCK_TOKENS.find(t => t.address === address);
      
      if (!token) {
        throw new Error('Token not found');
      }
      
      return generatePriceHistory(token.price);
    } catch (error) {
      console.error(`Error fetching price history for ${address}:`, error);
      throw error;
    }
  }

  // Get token rate in USD
  async getTONRate(): Promise<number> {
    try {
      // Try tonconsole API first
      const response = await axios.get('https://tonapi.io/v2/rates?tokens=ton');
      if (response.data && response.data.rates && response.data.rates.TON) {
        return response.data.rates.TON.USD;
      }
      
      // Fallback to coingecko
      const geckoResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
      if (geckoResponse.data && geckoResponse.data['the-open-network']) {
        return geckoResponse.data['the-open-network'].usd;
      }
      
      return 3.5; // Default fallback value
    } catch (error) {
      console.error('Error fetching TON rate:', error);
      return 3.5; // Default fallback value
    }
  }

  // Launch a new token
  async launchToken(tokenParams: {
    name: string;
    symbol: string;
    initialSupply: number;
    decimals: number;
    logoUrl?: string;
    description?: string;
    websiteUrl?: string;
    telegramUrl?: string;
    twitterUrl?: string;
    initialPrice?: number;
    ownerAddress: string;
  }) {
    try {
      // In production, this would call the TON blockchain to deploy a token contract
      // const response = await axios.post('/api/tokens/launch', tokenParams);
      
      // For development, simulate token creation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate blockchain delay
      
      const tokenAddress = generateTokenAddress();
      
      // Add to mock tokens
      const newToken = {
        id: MOCK_TOKENS.length + 1,
        name: tokenParams.name,
        symbol: tokenParams.symbol,
        address: tokenAddress,
        price: tokenParams.initialPrice || 0.001,
        change_24h: 0,
        volume_24h: 0,
        marketCap: tokenParams.initialPrice 
          ? tokenParams.initialSupply * tokenParams.initialPrice 
          : tokenParams.initialSupply * 0.001,
        holders: 1, // Just the creator initially
        created_at: new Date().toISOString(),
      };
      
      MOCK_TOKENS.push(newToken);
      
      return {
        success: true,
        tokenAddress,
        tokenDetails: newToken
      };
    } catch (error) {
      console.error('Error launching token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  // Buy tokens
  async buyToken(tokenAddress: string, amount: number, userAddress: string) {
    try {
      // In production, this would call a smart contract function
      // return await axios.post(`/api/tokens/${tokenAddress}/buy`, { amount, userAddress });
      
      // For development, simulate purchase
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate blockchain delay
      
      const token = MOCK_TOKENS.find(t => t.address === tokenAddress);
      
      if (!token) {
        throw new Error('Token not found');
      }
      
      // Update token stats
      token.volume_24h += amount * token.price;
      token.holders = Math.min(token.holders + (Math.random() > 0.7 ? 1 : 0), 10000);
      
      return {
        success: true,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        amountPaid: amount * token.price,
        tokensReceived: amount
      };
    } catch (error) {
      console.error(`Error buying ${tokenAddress}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  // Sell tokens
  async sellToken(tokenAddress: string, amount: number, userAddress: string) {
    try {
      // In production, this would call a smart contract function
      // return await axios.post(`/api/tokens/${tokenAddress}/sell`, { amount, userAddress });
      
      // For development, simulate sale
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate blockchain delay
      
      const token = MOCK_TOKENS.find(t => t.address === tokenAddress);
      
      if (!token) {
        throw new Error('Token not found');
      }
      
      // Update token stats
      token.volume_24h += amount * token.price;
      
      return {
        success: true,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        amountReceived: amount * token.price * 0.99, // Apply 1% fee
        tokensSold: amount
      };
    } catch (error) {
      console.error(`Error selling ${tokenAddress}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  // Get user wallet balance
  async getWalletBalance(address: string) {
    try {
      // In production, this would query the TON blockchain
      // return await axios.get(`/api/wallet/${address}/balance`);
      
      // For development, return a random balance
      return {
        ton: parseFloat((Math.random() * 10).toFixed(4)),
        usd: parseFloat((Math.random() * 10 * 2.5).toFixed(2)) // Assuming 1 TON = $2.50
      };
    } catch (error) {
      console.error(`Error fetching balance for ${address}:`, error);
      return { ton: 0, usd: 0 };
    }
  }
  
  // Get user transactions
  async getWalletTransactions(address: string) {
    try {
      // In production, this would query the TON blockchain
      // return await axios.get(`/api/wallet/${address}/transactions`);
      
      // For development, generate mock transactions
      const numTransactions = Math.floor(Math.random() * 5) + 3;
      const transactions = [];
      
      for (let i = 0; i < numTransactions; i++) {
        const isIncoming = Math.random() > 0.5;
        const amount = parseFloat((Math.random() * 2).toFixed(4));
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 24));
        
        transactions.push({
          id: `tx_${Math.random().toString(16).substr(2, 10)}`,
          type: isIncoming ? 'incoming' : 'outgoing',
          amount,
          timestamp: timestamp.toISOString(),
          address: isIncoming 
            ? `EQ${Math.random().toString(16).substr(2, 40)}` 
            : `EQ${Math.random().toString(16).substr(2, 40)}`,
          comment: Math.random() > 0.7 ? 'Token purchase' : ''
        });
      }
      
      return transactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error(`Error fetching transactions for ${address}:`, error);
      return [];
    }
  }

  // Helper methods
  getMockTokens(): Token[] {
    return [
      {
        id: 1,
        name: "TON Doge",
        symbol: "TDOG",
        address: "EQD0sLxPk-1B6jQgAMKh8dIzqc9lSYIHJcb02yGcXa4_ybNz",
        price: 0.00041,
        change_24h: 107.8,
        volume_24h: 345000,
        marketCap: 410000,
        holders: 890,
        created_at: "2024-03-01T12:00:00Z",
        description: "Much TON. Such WOW. Very blockchain.",
        isVerified: false,
        socialLinks: {
          telegram: "https://t.me/tondoge",
          twitter: "https://twitter.com/tondoge"
        },
        stats: {
          allTimeHigh: 0.00051,
          allTimeLow: 0.00019,
          launchPrice: 0.00020
        }
      },
      {
        id: 2,
        name: "TON AI",
        symbol: "TAI",
        address: "EQBdYjGkn8XdtH9FZjLxYWXGm6zEWVWMy1KTs_Jlg2S95ALW",
        price: 0.00782,
        change_24h: -5.2,
        volume_24h: 98000,
        marketCap: 7820000,
        holders: 3450,
        created_at: "2023-12-20T09:15:00Z",
        description: "AI-powered tools and services on TON blockchain.",
        isVerified: true,
        socialLinks: {
          website: "https://tonai.network",
          telegram: "https://t.me/tonai_network",
          twitter: "https://twitter.com/tonai_network"
        },
        stats: {
          allTimeHigh: 0.0125,
          allTimeLow: 0.00451,
          launchPrice: 0.00500
        }
      },
      {
        id: 3,
        name: "TON Moon",
        symbol: "TMOON",
        address: "EQCj2sJA8mCG-rbqkh-IUzndxXqcIEHYO8tVJaef4z9eFLNJ",
        price: 0.00084,
        change_24h: 15.7,
        volume_24h: 223000,
        marketCap: 840000,
        holders: 1780,
        created_at: "2024-02-14T14:14:14Z",
        description: "To the moon! First lunar-based token on TON.",
        isVerified: false,
        socialLinks: {
          telegram: "https://t.me/tonmoon",
          twitter: "https://twitter.com/ton_moon"
        },
        stats: {
          allTimeHigh: 0.00097,
          allTimeLow: 0.00042,
          launchPrice: 0.00050
        }
      }
    ];
  }

  generateMockPriceHistory(): PricePoint[] {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const history: PricePoint[] = [];
    
    // Generate 30 days of price history
    let price = 0.0005 + Math.random() * 0.001;
    for (let i = 30; i >= 0; i--) {
      const timestamp = now - (i * oneDayMs);
      // Random walk with trend
      const randomChange = (Math.random() - 0.5) * 0.1;
      price = price * (1 + randomChange);
      
      history.push({
        timestamp,
        price: Number(price.toFixed(6))
      });
    }
    
    return history;
  }
}

export const tonService = new TonService();
export default tonService; 