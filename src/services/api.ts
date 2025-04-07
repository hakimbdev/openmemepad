import axios from 'axios';
import toast from 'react-hot-toast';

// Create an axios instance with base URL and default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// TON API for fetching token data
export const tonApi = axios.create({
  baseURL: 'https://tonapi.io/v2',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer RU89wxRrzNX9EcRvmTrJwc0Mnn5XBuRj'
  }
});

// Add a request interceptor to add the wallet address to requests
api.interceptors.request.use(
  (config) => {
    const wallet = localStorage.getItem('wallet');
    if (wallet) {
      const walletData = JSON.parse(wallet);
      config.headers['X-Wallet-Address'] = walletData.address;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response) {
      if (response.status === 401) {
        toast.error('Wallet not connected. Please connect your wallet.');
      } else if (response.status === 403) {
        toast.error('You do not have permission to perform this action');
      } else if (response.status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (response.data && response.data.message) {
        toast.error(response.data.message);
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Token APIs
export const tokenApi = {
  createToken: (data: any) => api.post('/create-token', data),
  getTokens: () => api.get('/tokens'),
  getTrendingTokens: () => api.get('/trending-tokens'),
  getTokenDetails: (tokenAddress: string) => api.get(`/token/${tokenAddress}`),
  
  // Real TON API calls
  getRealTrendingTokens: async () => {
    try {
      const response = await tonApi.get('/blockchain/tokens/popular');
      // Map response to our token format
      if (response.data && Array.isArray(response.data.tokens)) {
        const mappedTokens = response.data.tokens.map((token: any, index: number) => ({
          id: index + 1,
          name: token.name || 'Unknown Token',
          symbol: token.symbol || 'UNKNOWN',
          address: token.address || '',
          price: token.price_usd || 0,
          change_24h: token.price_change_24h || 0,
          volume_24h: token.volume_24h || 0,
          marketCap: token.market_cap || 0,
          holders: token.holders_count || 0,
          created_at: token.created_at || new Date().toISOString()
        }));
        return { data: mappedTokens };
      }
      return tokenApi.getMockTrendingTokens();
    } catch (error) {
      console.error('Error fetching real TON tokens:', error);
      return tokenApi.getMockTrendingTokens();
    }
  },

  getNewTokens: async () => {
    try {
      const response = await tonApi.get('/blockchain/tokens/newest');
      // Map response to our token format
      if (response.data && Array.isArray(response.data.tokens)) {
        const mappedTokens = response.data.tokens.map((token: any, index: number) => ({
          id: index + 100, // Use a different range for IDs to avoid conflicts
          name: token.name || 'New Token',
          symbol: token.symbol || 'NEW',
          address: token.address || '',
          price: token.price_usd || 0,
          change_24h: token.price_change_24h || 0,
          volume_24h: token.volume_24h || 0,
          marketCap: token.market_cap || 0,
          holders: token.holders_count || 0,
          created_at: token.created_at || new Date().toISOString()
        }));
        return { data: mappedTokens };
      }
      return tokenApi.getMockNewTokens();
    } catch (error) {
      console.error('Error fetching new TON tokens:', error);
      return tokenApi.getMockNewTokens();
    }
  },
  
  // Mock functions for when backend is unavailable
  getMockTrendingTokens: () => {
    return Promise.resolve({
      data: [
        {
          id: 1,
          name: "Tonigger",
          symbol: "TNGR",
          address: "0x86be87bc54fdb6078833cc0aaedbb5abbfbc6d10",
          price: 0.00000132,
          change_24h: 15.3,
          volume_24h: 14200,
          marketCap: 142000,
          holders: 879,
          created_at: "2023-10-15T12:30:45Z"
        },
        {
          id: 2,
          name: "TON AI",
          symbol: "TAI",
          address: "0x92fe86c0e168c793ae5503a2f1d6dd2989ea70d1",
          price: 0.00000078,
          change_24h: 8.2,
          volume_24h: 8900,
          marketCap: 98000,
          holders: 421,
          created_at: "2023-11-02T09:15:22Z"
        },
        {
          id: 3,
          name: "TON Doge",
          symbol: "TDOG",
          address: "0x47d3e25765a93c91bf5f287269c6acc7935a2254",
          price: 0.00000045,
          change_24h: -2.7,
          volume_24h: 5600,
          marketCap: 67500,
          holders: 312,
          created_at: "2023-11-12T15:45:10Z"
        },
        {
          id: 4,
          name: "TONKAWA",
          symbol: "TONK",
          address: "0x31a9342554c28edf83e2c87825c0fc9946b7d9e2",
          price: 0.00000012,
          change_24h: 34.1,
          volume_24h: 23000,
          marketCap: 120000,
          holders: 675,
          created_at: "2023-12-01T10:20:33Z"
        }
      ]
    });
  },
  
  getMockNewTokens: () => {
    return Promise.resolve({
      data: [
        {
          id: 5,
          name: "TON APE",
          symbol: "TAPE",
          address: "0xc71ed592fd9b5e2e13ad29e715fbc68588f94c91",
          price: 0.00000009,
          change_24h: 5.8,
          volume_24h: 4200,
          marketCap: 35000,
          holders: 145,
          created_at: "2024-03-28T14:22:10Z"
        },
        {
          id: 6,
          name: "TON PEPE",
          symbol: "TPEPE",
          address: "0x8d45a21fd8a7ed2932b852ec7c22ad97b5f17cca",
          price: 0.00000007,
          change_24h: 12.4,
          volume_24h: 6300,
          marketCap: 42000,
          holders: 230,
          created_at: "2024-03-25T08:15:45Z"
        },
        {
          id: 7,
          name: "TON Robot",
          symbol: "TROB",
          address: "0x4e6a197eb4e33d9c1446cdb6efc12757e8242584",
          price: 0.00000015,
          change_24h: 7.8,
          volume_24h: 3100,
          marketCap: 28500,
          holders: 98,
          created_at: "2024-04-01T11:40:22Z"
        }
      ]
    });
  }
};

// Wallet APIs
export const walletApi = {
  getBalance: (address: string) => api.get(`/wallet-balance/${address}`),
};

// Community APIs
export const communityApi = {
  joinCommunity: (data: any) => api.post('/join-community', data),
  getCommunityMembers: () => api.get('/community-members'),
};

// Mining APIs
export const miningApi = {
  startMining: (data: any) => api.post('/start-mining', data),
  stopMining: (data: any) => api.post('/stop-mining', data),
  fetchData: () => api.get('/fetch-data'),
};

// Staking APIs
export const stakingApi = {
  stake: (data: any) => api.post('/stake', data),
  unstake: (id: string) => api.post(`/unstake/${id}`),
  getUserStakes: () => api.get('/stakes'),
  getPools: () => api.get('/pools'),
};

export default api; 