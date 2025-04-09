import axios from 'axios';
import { toast } from 'react-hot-toast';

// Define token interface
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

// Token creation parameters interface
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

export interface TokenCreationResult {
  success: boolean;
  tokenAddress?: string;
  txHash?: string;
  error?: string;
}

// Define price point interface for charts
export interface PricePoint {
  timestamp: number;
  price: number;
}

class TokenService {
  private tonApi = axios.create({
    baseURL: 'https://tonapi.io/v2',
    headers: {
      'Authorization': 'Bearer YOUR_TONAPI_KEY', // Replace with an actual key in production
      'Content-Type': 'application/json'
    }
  });

  private coinGeckoApi = axios.create({
    baseURL: 'https://api.coingecko.com/api/v3',
  });

  // Get trending tokens from TON network
  async getTrendingTokens(): Promise<Token[]> {
    try {
      // In production, this would fetch from a real API
      const response = await this.tonApi.get('/blockchain/tokens/popular');
      
      if (response.data && Array.isArray(response.data.tokens)) {
        return this.mapApiTokensToModel(response.data.tokens);
      }
      
      throw new Error('Invalid response format from API');
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      // Fall back to mock data in case of error
      return this.getMockTrendingTokens();
    }
  }

  // Get newest tokens from TON network
  async getNewestTokens(): Promise<Token[]> {
    try {
      // In production, this would fetch from a real API
      const response = await this.tonApi.get('/blockchain/tokens/newest');
      
      if (response.data && Array.isArray(response.data.tokens)) {
        return this.mapApiTokensToModel(response.data.tokens);
      }
      
      throw new Error('Invalid response format from API');
    } catch (error) {
      console.error('Error fetching newest tokens:', error);
      // Fall back to mock data in case of error
      return this.getMockNewestTokens();
    }
  }

  // Get token details by address
  async getTokenDetails(address: string): Promise<Token | null> {
    try {
      const response = await this.tonApi.get(`/blockchain/tokens/${address}`);
      
      if (response.data) {
        const token = response.data;
        return {
          id: token.id || 0,
          name: token.name || 'Unknown Token',
          symbol: token.symbol || 'UNKNOWN',
          address: token.address || address,
          price: token.price_usd || 0,
          change_24h: token.price_change_24h || 0,
          volume_24h: token.volume_24h || 0,
          marketCap: token.market_cap || 0,
          holders: token.holders_count || 0,
          created_at: token.created_at || new Date().toISOString(),
          description: token.description || 'No description available',
          isVerified: token.verified || false,
          socialLinks: {
            website: token.website || '',
            telegram: token.telegram || '',
            twitter: token.twitter || ''
          },
          stats: {
            allTimeHigh: token.all_time_high || token.price_usd * 1.5,
            allTimeLow: token.all_time_low || token.price_usd * 0.5,
            launchPrice: token.launch_price || token.price_usd * 0.7
          }
        };
      }
      
      throw new Error('Token not found');
    } catch (error) {
      console.error(`Error fetching token details for ${address}:`, error);
      // Return mock token if real data isn't available
      return this.getMockTokenByAddress(address);
    }
  }

  // Get token price history for charts
  async getTokenPriceHistory(address: string, days: number = 30): Promise<PricePoint[]> {
    try {
      // For actual implementation, replace with TON API call
      // This is simulating a CoinGecko-like API
      const response = await this.tonApi.get(`/blockchain/tokens/${address}/price`, {
        params: { days }
      });
      
      if (response.data && Array.isArray(response.data.prices)) {
        return response.data.prices.map((item: [number, number]) => ({
          timestamp: item[0],
          price: item[1]
        }));
      }
      
      throw new Error('Invalid price history data');
    } catch (error) {
      console.error(`Error fetching price history for ${address}:`, error);
      // Generate mock price history if real data isn't available
      return this.generateMockPriceHistory(address, days);
    }
  }

  // Get current TON price in USD
  async getTonRate(): Promise<number> {
    try {
      const response = await this.coinGeckoApi.get('/simple/price', {
        params: {
          ids: 'the-open-network',
          vs_currencies: 'usd'
        }
      });
      
      if (response.data && response.data['the-open-network'] && response.data['the-open-network'].usd) {
        return response.data['the-open-network'].usd;
      }
      
      return 3.50; // Fallback to mock TON price
    } catch (error) {
      console.error('Error fetching TON price:', error);
      return 3.50; // Fallback to mock TON price
    }
  }

  // Helper function to map API response to our Token model
  private mapApiTokensToModel(apiTokens: any[]): Token[] {
    return apiTokens.map((token, index) => ({
      id: token.id || index + 1,
      name: token.name || 'Unknown Token',
      symbol: token.symbol || 'UNKNOWN',
      address: token.address || `EQ${Math.random().toString(36).substr(2, 40)}`,
      price: token.price_usd || (0.001 + Math.random() * 0.05),
      change_24h: token.price_change_24h || (Math.random() * 40 - 20),
      volume_24h: token.volume_24h || (10000 + Math.random() * 100000),
      marketCap: token.market_cap || (50000 + Math.random() * 500000),
      holders: token.holders_count || Math.floor(1000 + Math.random() * 5000),
      created_at: token.created_at || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      isVerified: !!token.verified,
      socialLinks: {
        website: token.website || '',
        telegram: token.telegram || '',
        twitter: token.twitter || ''
      },
      stats: {
        allTimeHigh: token.all_time_high || (token.price_usd ? token.price_usd * 1.5 : 0),
        allTimeLow: token.all_time_low || (token.price_usd ? token.price_usd * 0.5 : 0),
        launchPrice: token.launch_price || (token.price_usd ? token.price_usd * 0.7 : 0)
      }
    }));
  }

  // Mock data for trending tokens
  private getMockTrendingTokens(): Token[] {
    return [
      {
        id: 1,
        name: 'Tonigger',
        symbol: 'TNGR',
        address: 'EQAvDfYnmvuJJ-UWV5qS6_F9g2jIoJbRyjETRvL90VY2JS4w',
        price: 0.0025,
        change_24h: 15.2,
        volume_24h: 45000,
        marketCap: 250000,
        holders: 1200,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        isVerified: true,
        socialLinks: {
          website: 'https://tonigger.io',
          telegram: 'https://t.me/tonigger',
          twitter: 'https://twitter.com/tonigger'
        }
      },
      {
        id: 2,
        name: 'TON AI',
        symbol: 'TAI',
        address: 'EQD_s-QtvpfEMGn0t1i8_4g_i-kOs0GQ88SfaSgez3LyTVGj',
        price: 0.015,
        change_24h: 8.3,
        volume_24h: 125000,
        marketCap: 1750000,
        holders: 4500,
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        isVerified: true
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
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        name: 'Meme Kombat',
        symbol: 'MK',
        address: 'EQCayjzBc05oUrwwJeI217qZsQSCnXXQpBw1fZZnWGwcXRXB',
        price: 0.0075,
        change_24h: 10.1,
        volume_24h: 95000,
        marketCap: 750000,
        holders: 2900,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
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
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Mock data for newest tokens
  private getMockNewestTokens(): Token[] {
    return [
      {
        id: 6,
        name: 'Telegram Pepe',
        symbol: 'TGPEPE',
        address: 'EQDjUk8Smad1L-ivkJbxPmShjBMHUy-cTVMvl4wGRKc3qP4Z',
        price: 0.0008,
        change_24h: 5.6,
        volume_24h: 25000,
        marketCap: 120000,
        holders: 850,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 7,
        name: 'TONkey',
        symbol: 'MONKEY',
        address: 'EQBJhPE9VaQpKu5EN7jDQtG6flMeQ_28XhM52gvQHxZ5QPgr',
        price: 0.0012,
        change_24h: 15.8,
        volume_24h: 35000,
        marketCap: 180000,
        holders: 1100,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 8,
        name: 'TON Elon',
        symbol: 'TELON',
        address: 'EQC4QD309YHk5Vn7VWWFdznD5VjYfL96YEIuF6308M7-gXk7',
        price: 0.0001,
        change_24h: 30.2,
        volume_24h: 42000,
        marketCap: 85000,
        holders: 1500,
        created_at: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 9,
        name: 'TONstar',
        symbol: 'TSTAR',
        address: 'EQAQKjJfRjrUcql3WMJw2FzXBKgANPL3xSeMDX93dF_Hd7wa',
        price: 0.0035,
        change_24h: -8.3,
        volume_24h: 28000,
        marketCap: 220000,
        holders: 980,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 10,
        name: 'BitTON',
        symbol: 'BTON',
        address: 'EQDrLq-X6jKZNHAScgghh0h1iog3StK71zfYJcBsJ-xZgq2I',
        price: 0.0005,
        change_24h: 12.1,
        volume_24h: 18000,
        marketCap: 95000,
        holders: 720,
        created_at: new Date(Date.now() - 2.2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Mock token for a specific address
  private getMockTokenByAddress(address: string): Token | null {
    const allMockTokens = [...this.getMockTrendingTokens(), ...this.getMockNewestTokens()];
    const token = allMockTokens.find(t => t.address === address);

    if (token) {
      return {
        ...token,
        description: `${token.name} is a meme token on the TON blockchain. It was created as a community-driven project with strong meme culture roots.`,
        socialLinks: token.socialLinks || {
          website: `https://${token.symbol.toLowerCase()}.io`,
          telegram: `https://t.me/${token.symbol.toLowerCase()}`,
          twitter: `https://twitter.com/${token.symbol.toLowerCase()}`
        },
        stats: token.stats || {
          allTimeHigh: token.price * 1.8,
          allTimeLow: token.price * 0.6,
          launchPrice: token.price * 0.8
        }
      };
    }

    // If token not found, generate a random one
    return {
      id: Math.floor(Math.random() * 1000),
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      address: address,
      price: 0.001 + Math.random() * 0.01,
      change_24h: Math.random() * 20 - 10,
      volume_24h: 10000 + Math.random() * 50000,
      marketCap: 50000 + Math.random() * 200000,
      holders: Math.floor(500 + Math.random() * 2000),
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'An unknown token on the TON blockchain with limited information available.',
      isVerified: false
    };
  }

  // Generate mock price history for a token
  private generateMockPriceHistory(address: string, days: number = 30): PricePoint[] {
    // Get the token to base the price history on
    const token = this.getMockTokenByAddress(address);
    if (!token) return [];

    const priceHistory: PricePoint[] = [];
    let currentPrice = token.price * 0.7; // Start at 70% of current price
    
    for (let i = days; i >= 0; i--) {
      const timestamp = Date.now() - i * 24 * 60 * 60 * 1000;
      
      // Add random fluctuation (-5% to +5%)
      const fluctuation = 1 + (Math.random() * 0.1 - 0.05);
      currentPrice *= fluctuation;
      
      // Add occasional spikes or dips
      if (Math.random() > 0.9) {
        const spike = 1 + (Math.random() * 0.2 - 0.1);
        currentPrice *= spike;
      }
      
      priceHistory.push({
        timestamp,
        price: currentPrice
      });
    }
    
    // Ensure the last price matches the current price
    priceHistory[priceHistory.length - 1].price = token.price;
    
    return priceHistory;
  }

  // Launch a new token
  async launchToken(params: TokenCreationParams, creatorAddress: string): Promise<TokenCreationResult> {
    try {
      // In a real implementation, this would call the blockchain
      console.log('Creating token with params:', params);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a dummy token address
      const tokenAddress = this.generateTokenAddress();
      const txHash = this.generateTransactionHash();
      
      // Create a new token in our mock data
      const newToken: Token = {
        id: Math.floor(Math.random() * 10000),
        name: params.name,
        symbol: params.symbol,
        address: tokenAddress,
        price: params.initialPrice,
        change_24h: 0, // New token, no change yet
        volume_24h: 0, // New token, no volume yet
        marketCap: params.initialPrice * params.initialSupply,
        holders: 1, // Just the creator initially
        created_at: new Date().toISOString(),
        description: params.description,
        isVerified: false, // New tokens aren't verified
        socialLinks: params.socialLinks
      };
      
      // In a real implementation, we would add this to a database
      // For the mock, we could add it to our in-memory lists, but that's not persisted
      // between page refreshes since this is just a client-side mock
      
      return {
        success: true,
        tokenAddress,
        txHash
      };
    } catch (error) {
      console.error('Error launching token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Generate a random TON address for new tokens
  private generateTokenAddress(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let address = 'EQ';
    
    for (let i = 0; i < 44; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return address;
  }
  
  // Generate a random transaction hash
  private generateTransactionHash(): string {
    return `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }
}

// Export singleton instance
export const tokenService = new TokenService(); 