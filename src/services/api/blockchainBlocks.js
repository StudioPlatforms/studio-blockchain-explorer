import { api, processApiData } from './core.js';

// Block-related API functions
const blockchainBlocksApi = {
  // Get blocks with optional filtering
  getBlocks: async (limit = 10, offset = 0, onlyWithTransactions = false) => {
    console.log('Fetching blocks with limit:', limit, 'offset:', offset, 'onlyWithTransactions:', onlyWithTransactions);
    try {
      // First, get the latest block number from the health endpoint
      const healthResponse = await api.get('/health');
      const healthData = processApiData(healthResponse.data);
      const latestBlockNumber = healthData.lastBlock;
      
      console.log('Latest block number from health endpoint:', latestBlockNumber);
      
      // If we're filtering for blocks with transactions, use the transactions endpoint
      // to get blocks with transactions
      if (onlyWithTransactions) {
        console.log('Fetching blocks with transactions using transactions endpoint');
        
        // Get transactions to find blocks with transactions
        const transactionsResponse = await api.get('/transactions', {
          params: { limit: limit * 5 } // Get more transactions to ensure we have enough unique blocks
        });
        const transactions = processApiData(transactionsResponse.data);
        
        // Extract unique block numbers from transactions
        const blockNumbers = [...new Set(transactions.map(tx => tx.blockNumber))];
        console.log('Found block numbers with transactions:', blockNumbers);
        
        // Fetch each block by number
        const blocks = [];
        for (let i = 0; i < Math.min(blockNumbers.length, limit); i++) {
          try {
            const blockNumber = blockNumbers[i];
            console.log(`Fetching block ${blockNumber} with transactions`);
            const blockResponse = await api.get(`/blocks/${blockNumber}`);
            const blockData = processApiData(blockResponse.data);
            
            // Add transactions_count property for consistency
            if (blockData.transactions) {
              blockData.transactions_count = blockData.transactions.length;
              console.log(`Block ${blockNumber} has ${blockData.transactions_count} transactions`);
            } else {
              blockData.transactions_count = 0;
            }
            
            // Add aiOptimized property - only for blocks with transactions
            blockData.aiOptimized = blockData.transactions_count > 0;
            
            blocks.push(blockData);
          } catch (blockError) {
            console.error(`Error fetching block ${blockNumbers[i]}:`, blockError);
          }
        }
        
        console.log(`Successfully fetched ${blocks.length} blocks with transactions`);
        return blocks;
      } else {
        // Regular block fetching without filtering
        const blocks = [];
        for (let i = 0; i < limit; i++) {
          const blockNumber = latestBlockNumber - offset - i;
          if (blockNumber < 0) break;
          
          try {
            console.log(`Fetching block ${blockNumber}`);
            const blockResponse = await api.get(`/blocks/${blockNumber}`);
            const blockData = processApiData(blockResponse.data);
            
            // Add transactions_count property for consistency
            if (blockData.transactions) {
              blockData.transactions_count = blockData.transactions.length;
              console.log(`Block ${blockNumber} has ${blockData.transactions_count} transactions`);
            } else {
              blockData.transactions_count = 0;
            }
            
            // Add aiOptimized property - only for blocks with transactions
            blockData.aiOptimized = blockData.transactions_count > 0;
            
            blocks.push(blockData);
          } catch (blockError) {
            console.error(`Error fetching block ${blockNumber}:`, blockError);
          }
        }
        
        console.log(`Successfully fetched ${blocks.length} blocks`);
        return blocks;
      }
    } catch (error) {
      console.error('Error in getBlocks:', error);
      return [];
    }
  },
  
  // Get a specific block by number
  getBlockByNumber: async (blockNumber) => {
    try {
      console.log(`Fetching block by number: ${blockNumber}`);
      const response = await api.get(`/blocks/${blockNumber}`);
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in getBlockByNumber for block ${blockNumber}:`, error);
      return null;
    }
  },
  
  // Get a specific block by hash
  getBlockByHash: async (blockHash) => {
    try {
      console.log(`Fetching block by hash: ${blockHash}`);
      const response = await api.get(`/blocks/hash/${blockHash}`);
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in getBlockByHash for hash ${blockHash}:`, error);
      return null;
    }
  }
};

export default blockchainBlocksApi;
