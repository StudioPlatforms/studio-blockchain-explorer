import axios from 'axios';

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

export {
  API_BASE_URL,
  api,
  fetchWithCache
};
