/**
 * Token Price Service
 * This service is responsible for fetching token prices from external APIs
 * Currently using hardcoded values, but will be replaced with real API calls in the future
 */

import { getTokenPrice } from '../utils/tokenPrices';

// CoinMarketCap API configuration
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1';
// Get API key from environment variables or use empty string
// Use import.meta.env for Vite projects instead of process.env
const CMC_API_KEY = import.meta.env?.VITE_CMC_API_KEY || '';

/**
 * Fetch token prices from CoinMarketCap
 * @param {Array} symbols - Array of token symbols to fetch prices for
 * @returns {Promise<Object>} - Object with token symbols as keys and prices as values
 */
export const fetchTokenPrices = async (symbols) => {
  // If no API key is provided, use hardcoded values
  if (!CMC_API_KEY) {
    console.warn('No CoinMarketCap API key provided. Using hardcoded values.');
    return symbols.reduce((prices, symbol) => {
      prices[symbol] = getTokenPrice(symbol);
      return prices;
    }, {});
  }
  
  try {
    // Convert symbols array to comma-separated string
    const symbolsString = symbols.join(',');
    
    // Make API request
    const response = await fetch(`${CMC_API_URL}/cryptocurrency/quotes/latest?symbol=${symbolsString}`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });
    
    // Parse response
    const data = await response.json();
    
    // Extract prices
    const prices = {};
    symbols.forEach(symbol => {
      if (data.data && data.data[symbol]) {
        prices[symbol] = data.data[symbol].quote.USD.price;
      } else {
        // Fallback to hardcoded value if API doesn't return data for this symbol
        prices[symbol] = getTokenPrice(symbol);
      }
    });
    
    return prices;
  } catch (error) {
    console.error('Error fetching token prices from CoinMarketCap:', error);
    
    // Fallback to hardcoded values
    return symbols.reduce((prices, symbol) => {
      prices[symbol] = getTokenPrice(symbol);
      return prices;
    }, {});
  }
};

/**
 * Fetch token price for a single token
 * @param {string} symbol - Token symbol
 * @returns {Promise<number>} - Token price
 */
export const fetchTokenPrice = async (symbol) => {
  const prices = await fetchTokenPrices([symbol]);
  return prices[symbol] || 0;
};

/**
 * Fetch token prices for all tokens in the application
 * @returns {Promise<Object>} - Object with token symbols as keys and prices as values
 */
export const fetchAllTokenPrices = async () => {
  // List of all tokens we want to track
  // This should be updated as new tokens are added to the application
  const allTokens = ['STO', 'USDT', 'USDC', '3DC'];
  
  return fetchTokenPrices(allTokens);
};
