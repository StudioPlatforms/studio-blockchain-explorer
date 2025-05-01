import { useState, useEffect } from 'react';
import blockchainAIApi from '../services/api/blockchainAI.js';

/**
 * Custom hook to fetch the gas optimization percentage from the AI Dashboard
 * @returns {Object} { gasOptimization, isLoading, error }
 */
const useGasOptimization = () => {
  const [gasOptimization, setGasOptimization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGasOptimization = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch AI dashboard data
        const aiData = await blockchainAIApi.getAiDashboardData();
        
        // Extract gas optimization percentage
        setGasOptimization(aiData.gasOptimization);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching gas optimization:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchGasOptimization();
  }, []);

  return { gasOptimization, isLoading, error };
};

export default useGasOptimization;
