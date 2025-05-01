import { api } from './config.js';
import { processApiData } from './utils.js';

/**
 * Get health status of the API
 * @returns {Promise<Object>} - Health status
 */
const getHealth = async () => {
  try {
    console.log('Fetching health data');
    const response = await api.get('/health');
    return processApiData(response.data);
  } catch (error) {
    console.error('Error in getHealth:', error);
    return { status: 'error', lastBlock: 0, isIndexing: false };
  }
};

/**
 * Search for blocks, transactions, addresses, or tokens
 * @param {string} query - Search query
 * @returns {Promise<Object|null>} - Search results or null if error
 */
const search = async (query) => {
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
};

/**
 * Get network statistics
 * @returns {Promise<Object>} - Network statistics
 */
const getNetworkStats = async () => {
  try {
    // Get health data for latest block
    const healthResponse = await api.get('/health');
    const healthData = processApiData(healthResponse.data);
    
    // Get TPS from the new endpoint
    const tpsResponse = await api.get('/stats/tps');
    const tpsData = processApiData(tpsResponse.data);
    const tps = tpsData.tps || 0;
    
    // Get total STO holders from the new endpoint
    const holdersResponse = await api.get('/stats/holders');
    const holdersData = processApiData(holdersResponse.data);
    const totalHolders = holdersData.holders || 0;
    
    // Get validators payout from the new endpoint
    const validatorsPayoutResponse = await api.get('/stats/validators/payout');
    const validatorsPayoutData = processApiData(validatorsPayoutResponse.data);
    
    // Use the formatted payout if available, otherwise use the raw value
    const validatorsPayout = {
      raw: validatorsPayoutData.totalPayout || 0,
      formatted: validatorsPayoutData.formattedPayout || null
    };
    
    // Get all transactions with a large limit to count them
    const transactionsResponse = await api.get('/transactions', {
      params: { limit: 1000 } // Use a large limit to get all transactions
    });
    
    // Count the transactions
    const transactions = processApiData(transactionsResponse.data);
    const totalTransactions = transactions.length;
    
    // Get gas price from the latest transaction
    let gasPrice = 0;
    if (transactions.length > 0) {
      const latestTransaction = transactions[0];
      if (latestTransaction.gasPrice && latestTransaction.gasPrice.hex) {
        // Convert hex to decimal and then to Gwei
        const gasPriceWei = parseInt(latestTransaction.gasPrice.hex, 16);
        gasPrice = gasPriceWei / 1e9; // Convert Wei to Gwei
      }
    }
    
    // If we couldn't get gas price from transactions, try RPC
    if (gasPrice === 0) {
      try {
        const rpcResponse = await api.post('/proxy/rpc', {
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 1
        });
        
        if (rpcResponse.data && rpcResponse.data.result) {
          const gasPriceWei = parseInt(rpcResponse.data.result, 16);
          gasPrice = gasPriceWei / 1e9; // Convert Wei to Gwei
        }
      } catch (rpcError) {
        console.error('Error fetching gas price from RPC:', rpcError);
      }
    }
    
    return {
      latestBlock: healthData.lastBlock,
      totalTransactions: totalTransactions,
      tps,
      gasPrice: gasPrice,
      totalHolders,
      validatorsPayout
    };
  } catch (error) {
    console.error('Error fetching network stats:', error);
    // Return default values in case of error
    return {
      latestBlock: 0,
      totalTransactions: 0,
      tps: 0,
      gasPrice: 0,
      totalHolders: 0,
      validatorsPayout: 0
    };
  }
};

/**
 * Get AI dashboard data (simulated)
 * @returns {Promise<Object>} - AI dashboard data
 */
const getAiDashboardData = async () => {
  console.log('Using simulated AI Dashboard data');
  
  // Generate some dynamic data based on current network stats
  let blocksProcessed = 12345678;
  let learningCycles = 4502;
  
  try {
    // Try to get the latest block number to make the data more realistic
    const health = await api.get('/health');
    if (health.data && health.data.lastBlock) {
      blocksProcessed = health.data.lastBlock;
      // Simulate learning cycles as a function of blocks
      learningCycles = Math.floor(blocksProcessed / 2500);
    }
  } catch (error) {
    // Ignore errors, just use the default values
  }
  
  // Return simulated data
  return {
    isSimulated: true,
    learningCycles,
    blocksProcessed,
    predictionAccuracy: 98.7,
    gasOptimization: 99.2,
    blockPredictionData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      predicted: [95.2, 95.8, 96.3, 96.7, 97.1, 97.4, 97.6, 97.8, 98.0, 98.2, 98.5, 98.7],
      actual: [94.8, 95.3, 95.9, 96.2, 96.8, 97.0, 97.3, 97.5, 97.8, 98.0, 98.3, 98.5]
    },
    transactionPriorityData: {
      labels: ['Standard', 'Fast', 'Instant', 'Smart Contract', 'NFT', 'DeFi'],
      values: [45, 25, 15, 10, 3, 2]
    },
    gasOptimizationData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      traditional: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      optimized: [5.1, 4.4, 3.2, 2.5, 1.3, 1.1, 0.8, 0.7, 0.5, 0.4, 0.3, 0.2]
    },
    learningProgressData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      accuracy: [85, 87, 89, 91, 93, 94, 95, 96, 97, 98, 98.5, 98.7]
    },
    activityFeed: [
      {
        id: 1,
        type: 'block_optimization',
        message: `Neural network optimized gas usage for block #${blocksProcessed}`,
        timestamp: '2 minutes ago'
      },
      {
        id: 2,
        type: 'learning_cycle',
        message: `Completed learning cycle #${learningCycles}`,
        timestamp: '15 minutes ago'
      },
      {
        id: 3,
        type: 'transaction_processing',
        message: 'Processed 1,245 transactions with zero gas fees',
        timestamp: '32 minutes ago'
      },
      {
        id: 4,
        type: 'gas_optimization',
        message: 'Achieved 99.2% gas optimization for standard transactions',
        timestamp: '1 hour ago'
      }
    ],
    neuralNetwork: {
      nodes: 42,
      connections: 156,
      layers: 4
    }
  };
};

/**
 * Send an RPC request
 * @param {string} method - RPC method
 * @param {Array} params - RPC parameters
 * @returns {Promise<Object>} - RPC response
 */
const sendRpcRequest = async (method, params = []) => {
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
};

export {
  getHealth,
  search,
  getNetworkStats,
  getAiDashboardData,
  sendRpcRequest
};
