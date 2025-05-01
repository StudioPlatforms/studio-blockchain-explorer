import { api, processApiData } from './core.js';

// Network statistics API functions
const blockchainStatsApi = {
  // Get network statistics
  getNetworkStats: async () => {
    try {
      console.log('Fetching network stats from API');
      
      // Get health data for latest block
      const healthResponse = await api.get('/health');
      const healthData = processApiData(healthResponse.data);
      console.log('Health data:', healthData);
      
      // Get validator count and latest block from validators endpoint
      const validatorsCountResponse = await api.get('/stats/validators/count');
      const validatorsCountData = processApiData(validatorsCountResponse.data);
      console.log('Validators count data:', validatorsCountData);
      
      // Use latestBlock from validators count if available, otherwise use lastBlock from health
      const latestBlock = validatorsCountData.latestBlock || healthData.lastBlock;
      console.log(`Using latestBlock: ${latestBlock}`);
      
      // Get TPS from the new endpoint
      const tpsResponse = await api.get('/stats/tps');
      const tpsData = processApiData(tpsResponse.data);
      const tps = tpsData.tps || 0;
      console.log(`TPS: ${tps}`);
      
      // Get total STO holders from the new endpoint
      const holdersResponse = await api.get('/stats/holders');
      const holdersData = processApiData(holdersResponse.data);
      const totalHolders = holdersData.holders || 0;
      console.log(`Total holders: ${totalHolders}`);
      
      // Get validators payout from the new endpoint
      const validatorsPayoutResponse = await api.get('/stats/validators/payout');
      const validatorsPayoutData = processApiData(validatorsPayoutResponse.data);
      console.log('Validators payout data:', validatorsPayoutData);
      
      // TEMPORARY SOLUTION: Since validators payout is currently 0, we're using the sum of validators' balances instead
      // TODO: Once validators start receiving payouts, switch back to using totalPayout
      let totalBalance = BigInt(0);
      let formattedBalance = '';
      
      if (validatorsPayoutData.validators && Array.isArray(validatorsPayoutData.validators)) {
        // Sum up all validators' balances
        validatorsPayoutData.validators.forEach(validator => {
          if (validator.balance) {
            totalBalance += BigInt(validator.balance);
          }
        });
        
        // Format the total balance
        const totalBalanceEther = Number(totalBalance) / 1e18;
        formattedBalance = totalBalanceEther.toString();
      }
      
      const validatorsPayout = {
        raw: totalBalance.toString(),
        formatted: formattedBalance
      };
      
      // Try to get the total transaction count from the dedicated endpoint
      let totalTransactions = 0;
      
      try {
        // Try to use the dedicated endpoint for transaction count
        const txCountResponse = await api.get('/stats/transactions/count');
        const txCountData = processApiData(txCountResponse.data);
        
        // Check if we got a valid count
        if (txCountData && txCountData.count && typeof txCountData.count === 'number') {
          totalTransactions = txCountData.count;
          console.log(`Got total transactions from dedicated endpoint: ${totalTransactions}`);
        } else {
          throw new Error('Invalid transaction count data');
        }
      } catch (txCountError) {
        console.log('No dedicated transaction count endpoint available, falling back to estimation method');
        
        // Fall back to estimating based on average transactions per block
        try {
          // Get the latest 10 blocks to calculate average transactions per block
          const recentBlocksResponse = await api.get('/blocks', {
            params: { limit: 10 }
          });
          
          const recentBlocks = processApiData(recentBlocksResponse.data);
          
          // Calculate average transactions per block
          let totalTxCount = 0;
          let blocksWithTx = 0;
          
          if (recentBlocks && Array.isArray(recentBlocks) && recentBlocks.length > 0) {
            recentBlocks.forEach(block => {
              if (block.transactions_count) {
                totalTxCount += block.transactions_count;
                blocksWithTx++;
              }
            });
          }
          
          // Calculate average transactions per block
          const avgTxPerBlock = blocksWithTx > 0 ? totalTxCount / blocksWithTx : 1;
          
          // Estimate total transactions based on latest block number and average transactions per block
          totalTransactions = Math.round(latestBlock * avgTxPerBlock);
          console.log(`Estimated total transactions: ${totalTransactions} (based on avg ${avgTxPerBlock.toFixed(2)} tx per block)`);
        } catch (estimationError) {
          console.error('Error estimating transaction count:', estimationError);
          // If all else fails, use a reasonable default value
          totalTransactions = latestBlock * 2; // Assume an average of 2 transactions per block
          console.log(`Using fallback estimation for total transactions: ${totalTransactions}`);
        }
      }
      
      // Get gas price directly from RPC
      let gasPrice = 0;
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
      
      console.log('Network stats compiled successfully');
      
      return {
        latestBlock: latestBlock,
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
  },
  
  // Get contract statistics
  getContractStats: async () => {
    try {
      // Get total contracts count
      const contractsCountResponse = await api.get('/stats/contracts/count');
      const contractsCountData = processApiData(contractsCountResponse.data);
      const totalContracts = contractsCountData.count || 0;
      
      // Get ERC20 contracts count
      const erc20CountResponse = await api.get('/stats/contracts/erc20/count');
      const erc20CountData = processApiData(erc20CountResponse.data);
      const erc20Contracts = erc20CountData.count || 0;
      
      // Get NFT contracts count
      const nftCountResponse = await api.get('/stats/contracts/nft/count');
      const nftCountData = processApiData(nftCountResponse.data);
      const nftContracts = nftCountData.count || 0;
      
      return {
        totalContracts,
        erc20Contracts,
        nftContracts
      };
    } catch (error) {
      console.error('Error fetching contract stats:', error);
      return {
        totalContracts: 0,
        erc20Contracts: 0,
        nftContracts: 0
      };
    }
  },
  
  // Get validator statistics
  getValidatorStats: async () => {
    try {
      // Get validator count
      const validatorCountResponse = await api.get('/stats/validators/count');
      const validatorCountData = processApiData(validatorCountResponse.data);
      const validatorCount = validatorCountData.count || 0;
      
      return {
        validatorCount
      };
    } catch (error) {
      console.error('Error fetching validator stats:', error);
      return {
        validatorCount: 0
      };
    }
  }
};

export default blockchainStatsApi;
