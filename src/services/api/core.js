import axios from 'axios';
import { convertBigNumber } from '../../utils/formatters.js';

// API Configuration
const API_BASE_URL = 'https://mainnetindexer.studio-blockchain.com';

/**
 * API Configuration Notes:
 * 
 * For local development with the indexer running locally:
 * const API_BASE_URL = 'http://localhost:3000';
 * 
 * For production:
 * const API_BASE_URL = 'https://mainnetindexer.studio-blockchain.com';
 */

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Extract the error details
    const errorResponse = {
      message: 'An unknown error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || {},
      originalError: error
    };
    
    // Customize error message based on status code
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorResponse.message = 'Bad request: The server could not understand the request';
          break;
        case 401:
          errorResponse.message = 'Unauthorized: Authentication is required';
          break;
        case 403:
          errorResponse.message = 'Forbidden: You do not have permission to access this resource';
          break;
        case 404:
          errorResponse.message = 'Not found: The requested resource does not exist';
          break;
        case 429:
          errorResponse.message = 'Too many requests: Rate limit exceeded';
          break;
        case 500:
          errorResponse.message = 'Server error: The server encountered an internal error';
          break;
        case 502:
          errorResponse.message = 'Bad gateway: The server received an invalid response';
          break;
        case 503:
          errorResponse.message = 'Service unavailable: The server is temporarily unavailable';
          break;
        case 504:
          errorResponse.message = 'Gateway timeout: The server timed out waiting for a response';
          break;
        default:
          errorResponse.message = `Error ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorResponse.message = 'Network error: No response received from server';
    } else {
      // Something happened in setting up the request
      errorResponse.message = `Request error: ${error.message}`;
    }
    
    console.error('API Error:', errorResponse);
    return Promise.reject(errorResponse);
  }
);

// Cache implementation
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

const fetchWithCache = async (key, fetchFunction) => {
  const now = Date.now();
  
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (now - timestamp < CACHE_TTL) {
      return data;
    }
  }
  
  const data = await fetchFunction();
  cache.set(key, { data, timestamp: now });
  return data;
};

// Helper function to process API response data
const processApiData = (data) => {
  return convertBigNumber(data);
};

// Helper function to decode string from contract call result
const decodeString = (hexData) => {
  try {
    if (!hexData || hexData === '0x') return '';
    
    // Skip the first 32 bytes (offset) and read the next 32 bytes (length)
    const offset = parseInt(hexData.slice(2, 66), 16);
    const length = parseInt(hexData.slice(66, 130), 16);
    
    // Extract the string data
    const hexString = hexData.slice(130, 130 + length * 2);
    
    // Convert hex to string
    let result = '';
    for (let i = 0; i < hexString.length; i += 2) {
      const hexChar = hexString.substr(i, 2);
      const charCode = parseInt(hexChar, 16);
      if (charCode !== 0) { // Skip null bytes
        result += String.fromCharCode(charCode);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error decoding string:', error);
    return '';
  }
};

// Core API functions
const coreApi = {
  // Get the base URL for API requests
  getBaseUrl: () => API_BASE_URL,
  
  // Health check
  getHealth: async () => {
    try {
      console.log('Fetching health data');
      const response = await api.get('/health');
      return processApiData(response.data);
    } catch (error) {
      console.error('Error in getHealth:', error);
      return { status: 'error', lastBlock: 0, isIndexing: false };
    }
  },
  
  // Search
  search: async (query) => {
    try {
      console.log(`Searching for: ${query}`);
      const response = await api.get('/search', {
        params: { q: query }
      });
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in search for query "${query}":`, error);
      return null;
    }
  },
  
  // RPC Proxy
  sendRpcRequest: async (method, params = []) => {
    try {
      console.log(`Sending RPC request: ${method}`);
      const response = await api.post('/proxy/rpc', {
        jsonrpc: '2.0',
        method,
        params,
        id: 1
      });
      
      // Check for RPC errors
      if (response.data.error) {
        console.error(`RPC error: ${response.data.error.message}`);
        return { error: response.data.error };
      }
      
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in sendRpcRequest for method ${method}:`, error);
      return { error: { code: -32603, message: 'Internal error', data: error.message } };
    }
  }
};

export {
  api,
  processApiData,
  decodeString,
  fetchWithCache,
  coreApi
};
