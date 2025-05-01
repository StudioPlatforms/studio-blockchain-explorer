import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchAllTokenPrices } from '../services/tokenPriceService';
import { getTokenPrice } from '../utils/tokenPrices';

// Create context
const TokenPriceContext = createContext();

// Custom hook to use the token price context
export const useTokenPrices = () => {
  const context = useContext(TokenPriceContext);
  if (!context) {
    throw new Error('useTokenPrices must be used within a TokenPriceProvider');
  }
  return context;
};

// Provider component
export const TokenPriceProvider = ({ children }) => {
  const [tokenPrices, setTokenPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch token prices on component mount
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const prices = await fetchAllTokenPrices();
        setTokenPrices(prices);
        setError(null);
      } catch (err) {
        console.error('Error fetching token prices:', err);
        setError('Failed to fetch token prices');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrices();
    
    // Set up interval to refresh prices every 5 minutes
    const intervalId = setInterval(fetchPrices, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Get price for a specific token
  const getPrice = (symbol) => {
    if (!symbol) return 0;
    
    const upperSymbol = symbol.toUpperCase();
    
    // If we have the price in our state, use that
    if (tokenPrices[upperSymbol] !== undefined) {
      return tokenPrices[upperSymbol];
    }
    
    // Otherwise, fall back to hardcoded value
    return getTokenPrice(upperSymbol);
  };
  
  // Calculate value of a token amount
  const calculateValue = (amount, decimals = 18, symbol) => {
    if (!amount || !symbol) return 0;
    
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Convert to token units (divide by 10^decimals)
    const tokenAmount = numAmount / Math.pow(10, decimals);
    
    // Get the token price
    const tokenPrice = getPrice(symbol);
    
    // Calculate the value
    return tokenAmount * tokenPrice;
  };
  
  // Calculate total value of multiple tokens
  const calculateTotalValue = (tokens) => {
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) return 0;
    
    return tokens.reduce((total, token) => {
      const amount = token.rawBalance || token.balance;
      const decimals = token.decimals || 18;
      const symbol = token.symbol;
      
      const value = calculateValue(amount, decimals, symbol);
      return total + value;
    }, 0);
  };
  
  // Refresh prices manually
  const refreshPrices = async () => {
    try {
      setLoading(true);
      const prices = await fetchAllTokenPrices();
      setTokenPrices(prices);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error refreshing token prices:', err);
      setError('Failed to refresh token prices');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Context value
  const value = {
    tokenPrices,
    loading,
    error,
    getPrice,
    calculateValue,
    calculateTotalValue,
    refreshPrices
  };
  
  return (
    <TokenPriceContext.Provider value={value}>
      {children}
    </TokenPriceContext.Provider>
  );
};

export default TokenPriceContext;
