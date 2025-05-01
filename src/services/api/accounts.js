import { api, processApiData } from './core.js';
import { blockchainApi } from './blockchain.js';

// Accounts API functions
const accountsApi = {
  // Address
  getAddressType: async (address) => {
    try {
      console.log(`Fetching address type for: ${address}`);
      const response = await api.get(`/address/${address}/type`);
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in getAddressType for address ${address}:`, error);
      return { type: 'unknown' };
    }
  },
  
  getAddressTransactions: async (address, limit = 10, offset = 0) => {
    try {
      console.log(`Fetching transactions for address: ${address}`);
      const response = await api.get(`/address/${address}/transactions`, {
        params: { limit, offset }
      });
      const data = processApiData(response.data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error in getAddressTransactions for address ${address}:`, error);
      return [];
    }
  },
  
  getAccountBalances: async (address) => {
    try {
      console.log(`Fetching account balances for address: ${address}`);
      const response = await api.get(`/account/${address}/balances`);
      const data = processApiData(response.data);
      
      // If the API doesn't return the expected format, create a default structure
      if (!data) {
        console.warn('API returned null or undefined for account balances');
        return { native: 0, tokens: [] };
      }
      
      // Ensure the data has the expected structure
      const result = {
        native: data.native || 0,
        tokens: Array.isArray(data.tokens) ? data.tokens : []
      };
      
      console.log('Account balances result:', result);
      return result;
    } catch (error) {
      console.error('Error in getAccountBalances:', error);
      // Return a default structure in case of error
      return { native: 0, tokens: [] };
    }
  },
  
  // Tokens
  getTokenInfo: async (tokenAddress) => {
    try {
      console.log(`Fetching token info for: ${tokenAddress}`);
      const response = await api.get(`/tokens/${tokenAddress}`);
      return processApiData(response.data);
    } catch (error) {
      console.error('Error in getTokenInfo:', error);
      return null;
    }
  },
  
  getTokenTransfers: async (tokenAddress, limit = 10, offset = 0) => {
    try {
      console.log(`Fetching token transfers for token: ${tokenAddress}`);
      const response = await api.get(`/tokens/${tokenAddress}/transfers`, {
        params: { limit, offset }
      });
      const data = processApiData(response.data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getTokenTransfers:', error);
      return [];
    }
  },
  
  getTokenHolders: async (tokenAddress, limit = 100, offset = 0) => {
    try {
      console.log(`Fetching token holders for token: ${tokenAddress}`);
      const response = await api.get(`/tokens/${tokenAddress}/holders`, {
        params: { limit, offset }
      });
      const data = processApiData(response.data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getTokenHolders:', error);
      return [];
    }
  },
  
  getAddressTokens: async (address, limit = 10, offset = 0) => {
    try {
      console.log(`Fetching tokens for address: ${address}`);
      const response = await api.get(`/address/${address}/tokens`, {
        params: { limit, offset }
      });
      const data = processApiData(response.data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getAddressTokens:', error);
      return [];
    }
  },
  
  // Token Transfers
  getAddressTokenTransfers: async (address, limit = 10, offset = 0) => {
    try {
      console.log(`Fetching token transfers for address: ${address}`);
      const response = await api.get(`/address/${address}/token-transfers`, {
        params: { limit, offset }
      });
      const data = processApiData(response.data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getAddressTokenTransfers:', error);
      return [];
    }
  },
  
  // NFTs
  getAddressNfts: async (address, limit = 10, offset = 0, tokenAddress = null) => {
    try {
      console.log(`Fetching NFTs for address: ${address}`);
      const response = await api.get(`/address/${address}/nfts`, {
        params: { limit, offset, tokenAddress }
      });
      const data = processApiData(response.data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getAddressNfts:', error);
      return [];
    }
  },
  
  getNftCollections: async (limit = 10, offset = 0) => {
    try {
      console.log('Fetching NFT collections');
      const response = await api.get('/nfts', {
        params: { limit, offset }
      });
      const data = processApiData(response.data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getNftCollections:', error);
      return [];
    }
  },
  
  getNftCollection: async (tokenAddress) => {
    try {
      console.log(`Fetching NFT collection for address: ${tokenAddress}`);
      const response = await api.get(`/nfts/${tokenAddress}`);
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in getNftCollection for ${tokenAddress}:`, error);
      return null;
    }
  },
  
  getNftToken: async (tokenAddress, tokenId) => {
    try {
      console.log(`Fetching NFT token: ${tokenAddress}/${tokenId}`);
      const response = await api.get(`/nfts/${tokenAddress}/${tokenId}`);
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in getNftToken for ${tokenAddress}/${tokenId}:`, error);
      return null;
    }
  },
  
  getAddressNftTransfers: async (address, limit = 10, offset = 0, tokenAddress = null, tokenType = null) => {
    try {
      console.log(`Fetching NFT transfers for address: ${address}`);
      const params = { limit, offset };
      if (tokenAddress) params.tokenAddress = tokenAddress;
      if (tokenType) params.tokenType = tokenType;
      
      const response = await api.get(`/address/${address}/nft-transfers`, { params });
      const data = processApiData(response.data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getAddressNftTransfers:', error);
      return [];
    }
  }
};

export { accountsApi };
