/**
 * Token price utilities
 * This file contains utilities for working with token prices
 * In the future, this will be replaced with real-time data from CoinMarketCap or similar APIs
 */

// Hardcoded token prices (to be replaced with API data later)
const TOKEN_PRICES = {
  'USDT': 1.00,    // 1 USDT = $1.00
  'USDC': 1.00,    // 1 USDC = $1.00
  'STO': 0.10,     // 1 STO = $0.10
  '3DC': 0.00129,  // 1 3DC = $0.00129
  // Add more tokens as needed
};

// Default price for tokens not in the list
const DEFAULT_TOKEN_PRICE = 0.00;

/**
 * Get the price of a token in USD
 * @param {string} symbol - The token symbol (e.g., 'USDT', 'STO')
 * @returns {number} - The price in USD
 */
export const getTokenPrice = (symbol) => {
  if (!symbol) return DEFAULT_TOKEN_PRICE;
  
  const upperSymbol = symbol.toUpperCase();
  return TOKEN_PRICES[upperSymbol] || DEFAULT_TOKEN_PRICE;
};

/**
 * Calculate the USD value of a token amount
 * @param {number|string} amount - The token amount
 * @param {number} decimals - The number of decimals for the token
 * @param {string} symbol - The token symbol
 * @returns {number} - The value in USD
 */
export const calculateTokenValue = (amount, decimals = 18, symbol) => {
  if (!amount || !symbol) return 0;
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Convert to token units (divide by 10^decimals)
  const tokenAmount = numAmount / Math.pow(10, decimals);
  
  // Get the token price
  const tokenPrice = getTokenPrice(symbol);
  
  // Calculate the value
  return tokenAmount * tokenPrice;
};

/**
 * Calculate the total value of multiple tokens
 * @param {Array} tokens - Array of token objects with amount, decimals, and symbol
 * @returns {number} - The total value in USD
 */
export const calculateTotalTokenValue = (tokens) => {
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) return 0;
  
  return tokens.reduce((total, token) => {
    const amount = token.rawBalance || token.balance;
    const decimals = token.decimals || 18;
    const symbol = token.symbol;
    
    const value = calculateTokenValue(amount, decimals, symbol);
    return total + value;
  }, 0);
};

/**
 * Format a USD value as a string
 * @param {number} value - The value in USD
 * @param {boolean} includeSymbol - Whether to include the $ symbol
 * @returns {string} - The formatted value
 */
export const formatUsdValue = (value, includeSymbol = true) => {
  if (value === undefined || value === null) return includeSymbol ? '$0.00' : '0.00';
  
  // Format with 2 decimal places
  const formatted = value.toFixed(2);
  
  // Add commas for thousands
  const withCommas = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return includeSymbol ? `$${withCommas}` : withCommas;
};
