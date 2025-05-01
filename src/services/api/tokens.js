import { api } from './config.js';
import { processApiData } from './utils.js';

/**
 * Get information about a token
 * @param {string} tokenAddress - Token contract address
 * @returns {Promise<Object|null>} - Token information or null if not found
 */
const getTokenInfo = async (tokenAddress) => {
  try {
    console.log(`Fetching token info for: ${tokenAddress}`);
    const response = await api.get(`/tokens/${tokenAddress}`);
    return processApiData(response.data);
  } catch (error) {
    console.error('Error in getTokenInfo:', error);
    return null;
  }
};

/**
 * Get token transfers
 * @param {string} tokenAddress - Token contract address
 * @param {number} limit - Maximum number of transfers to return
 * @param {number} offset - Number of transfers to skip
 * @returns {Promise<Array>} - Array of token transfers
 */
const getTokenTransfers = async (tokenAddress, limit = 10, offset = 0) => {
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
};

/**
 * Get token holders
 * @param {string} tokenAddress - Token contract address
 * @param {number} limit - Maximum number of holders to return
 * @param {number} offset - Number of holders to skip
 * @returns {Promise<Array>} - Array of token holders
 */
const getTokenHolders = async (tokenAddress, limit = 100, offset = 0) => {
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
};

/**
 * Get NFT collections
 * @param {number} limit - Maximum number of collections to return
 * @param {number} offset - Number of collections to skip
 * @returns {Promise<Array>} - Array of NFT collections
 */
const getNftCollections = async (limit = 10, offset = 0) => {
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
};

/**
 * Get NFT collection details
 * @param {string} tokenAddress - NFT contract address
 * @returns {Promise<Object|null>} - NFT collection details or null if not found
 */
const getNftCollection = async (tokenAddress) => {
  try {
    console.log(`Fetching NFT collection for address: ${tokenAddress}`);
    const response = await api.get(`/nfts/${tokenAddress}`);
    return processApiData(response.data);
  } catch (error) {
    console.error(`Error in getNftCollection for ${tokenAddress}:`, error);
    return null;
  }
};

/**
 * Get NFT token details
 * @param {string} tokenAddress - NFT contract address
 * @param {string} tokenId - NFT token ID
 * @returns {Promise<Object|null>} - NFT token details or null if not found
 */
const getNftToken = async (tokenAddress, tokenId) => {
  try {
    console.log(`Fetching NFT token: ${tokenAddress}/${tokenId}`);
    const response = await api.get(`/nfts/${tokenAddress}/${tokenId}`);
    return processApiData(response.data);
  } catch (error) {
    console.error(`Error in getNftToken for ${tokenAddress}/${tokenId}:`, error);
    return null;
  }
};

export {
  getTokenInfo,
  getTokenTransfers,
  getTokenHolders,
  getNftCollections,
  getNftCollection,
  getNftToken
};
