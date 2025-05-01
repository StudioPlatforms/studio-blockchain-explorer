import { api } from './config.js';
import { processApiData } from './utils.js';

/**
 * Get the type of an address (contract, EOA, etc.)
 * @param {string} address - The address to check
 * @returns {Promise<Object>} - Address type information
 */
const getAddressType = async (address) => {
  try {
    console.log(`Fetching address type for: ${address}`);
    const response = await api.get(`/address/${address}/type`);
    return processApiData(response.data);
  } catch (error) {
    console.error(`Error in getAddressType for address ${address}:`, error);
    return { type: 'unknown' };
  }
};

/**
 * Get transactions for an address
 * @param {string} address - The address to get transactions for
 * @param {number} limit - Maximum number of transactions to return
 * @param {number} offset - Number of transactions to skip
 * @returns {Promise<Array>} - Array of transactions
 */
const getAddressTransactions = async (address, limit = 10, offset = 0) => {
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
};

/**
 * Get account balances for an address
 * @param {string} address - The address to get balances for
 * @returns {Promise<Object>} - Account balances
 */
const getAccountBalances = async (address) => {
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
};

/**
 * Get tokens owned by an address
 * @param {string} address - The address to get tokens for
 * @param {number} limit - Maximum number of tokens to return
 * @param {number} offset - Number of tokens to skip
 * @returns {Promise<Array>} - Array of tokens
 */
const getAddressTokens = async (address, limit = 10, offset = 0) => {
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
};

/**
 * Get token transfers for an address
 * @param {string} address - The address to get token transfers for
 * @param {number} limit - Maximum number of transfers to return
 * @param {number} offset - Number of transfers to skip
 * @returns {Promise<Array>} - Array of token transfers
 */
const getAddressTokenTransfers = async (address, limit = 10, offset = 0) => {
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
};

/**
 * Get NFTs owned by an address
 * @param {string} address - The address to get NFTs for
 * @param {number} limit - Maximum number of NFTs to return
 * @param {number} offset - Number of NFTs to skip
 * @param {string} tokenAddress - Filter by token address
 * @returns {Promise<Array>} - Array of NFTs
 */
const getAddressNfts = async (address, limit = 10, offset = 0, tokenAddress = null) => {
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
};

/**
 * Get NFT transfers for an address
 * @param {string} address - The address to get NFT transfers for
 * @param {number} limit - Maximum number of transfers to return
 * @param {number} offset - Number of transfers to skip
 * @param {string} tokenAddress - Filter by token address
 * @param {string} tokenType - Filter by token type (ERC721, ERC1155)
 * @returns {Promise<Array>} - Array of NFT transfers
 */
const getAddressNftTransfers = async (address, limit = 10, offset = 0, tokenAddress = null, tokenType = null) => {
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
};

export {
  getAddressType,
  getAddressTransactions,
  getAccountBalances,
  getAddressTokens,
  getAddressTokenTransfers,
  getAddressNfts,
  getAddressNftTransfers
};
