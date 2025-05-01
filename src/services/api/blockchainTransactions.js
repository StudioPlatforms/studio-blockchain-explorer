import { api, processApiData } from './core.js';
import { callContractMethod } from './blockchainCore.js';

// Transaction-related API functions
const blockchainTransactionsApi = {
  // Get transactions with optional pagination
  getTransactions: async (limit = 10, offset = 0) => {
    try {
      console.log(`Fetching transactions with limit: ${limit}, offset: ${offset}`);
      
      // Get transactions
      const response = await api.get('/transactions', {
        params: { limit, offset }
      });
      const transactions = processApiData(response.data);
      
      // Enhance transactions with additional information
      const enhancedTransactions = await Promise.all(transactions.map(async (tx) => {
        try {
          // Get transaction receipt to get status and gas used
          const receiptResponse = await api.get(`/transactions/${tx.hash}/receipt`);
          const receipt = processApiData(receiptResponse.data);
          
          // Add status and gas used from receipt
          // Convert receipt status to proper format (true for '0x1', false for '0x0')
          if (receipt?.status === '0x1' || receipt?.status === 1 || receipt?.status === true) {
            tx.status = true;
          } else if (receipt?.status === '0x0' || receipt?.status === 0 || receipt?.status === false) {
            tx.status = false;
          } else {
            tx.status = null;
          }
          
          tx.gasUsed = receipt?.gasUsed || null;
          
          // Check if this is a token transfer - more robust detection
          const isZeroValue = tx.value?.hex === '0x00' || tx.value === 0 || tx.value === '0';
          const isTransferMethod = tx.input?.startsWith('0xa9059cbb');
          const hasLogs = receipt?.logs?.length > 0;
          
          console.log(`Transaction ${tx.hash} - isZeroValue: ${isZeroValue}, isTransferMethod: ${isTransferMethod}, hasLogs: ${hasLogs}`);
          
          if (hasLogs) {
            // Find token transfer logs (ERC20 Transfer event signature)
            const transferLogs = receipt.logs.filter(log => 
              log.topics?.[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
            );
            
            console.log(`Transaction ${tx.hash} - transferLogs: ${transferLogs.length}`);
            
            if (transferLogs.length > 0) {
              // Process token transfers
              tx.tokenTransfers = await Promise.all(transferLogs.map(async (log) => {
                try {
                  // Get token contract address
                  const tokenAddress = log.address;
                  
                  // Get token info
                  let symbol = 'TOKEN';
                  let decimals = 18;
                  
                  try {
                    // Try to get token symbol and decimals
                    const symbolResponse = await callContractMethod(tokenAddress, '0x95d89b41'); // symbol()
                    const decimalsResponse = await callContractMethod(tokenAddress, '0x313ce567'); // decimals()
                    
                    if (symbolResponse) {
                      symbol = symbolResponse;
                    }
                    
                    if (decimalsResponse) {
                      decimals = parseInt(decimalsResponse);
                    }
                  } catch (error) {
                    console.error('Error fetching token details:', error);
                  }
                  
                  // Extract transfer details from the log
                  let from = '0x0000000000000000000000000000000000000000';
                  let to = '0x0000000000000000000000000000000000000000';
                  let amount = '0';
                  
                  if (log.topics?.length >= 3) {
                    from = '0x' + log.topics[1].substring(26);
                    to = '0x' + log.topics[2].substring(26);
                  }
                  
                  if (log.data && log.data !== '0x') {
                    try {
                      const amountHex = log.data;
                      const amountBigInt = BigInt(amountHex);
                      amount = amountBigInt.toString();
                      
                      // Format amount based on token decimals
                      const formattedAmount = (Number(amount) / Math.pow(10, decimals)).toString();
                      
                      return {
                        from,
                        to,
                        amount: formattedAmount,
                        rawAmount: amount,
                        tokenAddress,
                        symbol,
                        decimals
                      };
                    } catch (error) {
                      console.error('Error parsing token amount:', error);
                    }
                  }
                  
                  return {
                    from,
                    to,
                    amount: '0',
                    tokenAddress,
                    symbol,
                    decimals
                  };
                } catch (error) {
                  console.error('Error processing token transfer log:', error);
                  return null;
                }
              }));
              
              // Filter out null transfers
              tx.tokenTransfers = tx.tokenTransfers.filter(transfer => transfer !== null);
            }
          }
          
          return tx;
        } catch (error) {
          console.error(`Error enhancing transaction ${tx.hash}:`, error);
          return tx;
        }
      }));
      
      return enhancedTransactions;
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return [];
    }
  },
  
  // Get a specific transaction by hash
  getTransactionByHash: async (hash) => {
    try {
      console.log(`Fetching transaction details for hash: ${hash}`);
      
      // Get transaction data
      const response = await api.get(`/transactions/${hash}`);
      const transaction = processApiData(response.data);
      
      // Get transaction receipt to get status and gas used
      const receiptResponse = await api.get(`/transactions/${hash}/receipt`);
      const receipt = processApiData(receiptResponse.data);
      
      // Add receipt data to transaction
      // Convert receipt status to proper format (true for '0x1', false for '0x0')
      if (receipt?.status === '0x1' || receipt?.status === 1 || receipt?.status === true) {
        transaction.status = true;
      } else if (receipt?.status === '0x0' || receipt?.status === 0 || receipt?.status === false) {
        transaction.status = false;
      } else {
        transaction.status = null;
      }
      
      transaction.gasUsed = receipt?.gasUsed || null;
      
      // Check if this is a token transfer - more robust detection
      const isZeroValue = transaction.value?.hex === '0x00' || transaction.value === 0 || transaction.value === '0';
      const isTransferMethod = transaction.input?.startsWith('0xa9059cbb');
      const hasLogs = receipt?.logs?.length > 0;
      
      console.log(`Transaction ${transaction.hash} - isZeroValue: ${isZeroValue}, isTransferMethod: ${isTransferMethod}, hasLogs: ${hasLogs}`);
      
      if (hasLogs) {
        // Find token transfer logs (ERC20 Transfer event signature)
        const transferLogs = receipt.logs.filter(log => 
          log.topics?.[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
        );
        
        console.log(`Transaction ${transaction.hash} - transferLogs: ${transferLogs.length}`);
        
        if (transferLogs.length > 0) {
          // Process token transfers
          transaction.tokenTransfers = await Promise.all(transferLogs.map(async (log) => {
            try {
              // Get token contract address
              const tokenAddress = log.address;
              
              // Get token info
              let name = 'Unknown Token';
              let symbol = 'TOKEN';
              let decimals = 18;
              
              try {
                // Try to get token details
                const nameResponse = await callContractMethod(tokenAddress, '0x06fdde03'); // name()
                const symbolResponse = await callContractMethod(tokenAddress, '0x95d89b41'); // symbol()
                const decimalsResponse = await callContractMethod(tokenAddress, '0x313ce567'); // decimals()
                
                if (nameResponse) {
                  name = nameResponse;
                }
                
                if (symbolResponse) {
                  symbol = symbolResponse;
                }
                
                if (decimalsResponse) {
                  decimals = parseInt(decimalsResponse);
                }
              } catch (error) {
                console.error('Error fetching token details:', error);
              }
              
              // Extract transfer details from the log
              let from = '0x0000000000000000000000000000000000000000';
              let to = '0x0000000000000000000000000000000000000000';
              let amount = '0';
              
              if (log.topics?.length >= 3) {
                from = '0x' + log.topics[1].substring(26);
                to = '0x' + log.topics[2].substring(26);
              }
              
              if (log.data && log.data !== '0x') {
                try {
                  const amountHex = log.data;
                  const amountBigInt = BigInt(amountHex);
                  amount = amountBigInt.toString();
                  
                  // Format amount based on token decimals
                  const formattedAmount = (Number(amount) / Math.pow(10, decimals)).toString();
                  
                  return {
                    from,
                    to,
                    amount: formattedAmount,
                    rawAmount: amount,
                    tokenAddress,
                    name,
                    symbol,
                    decimals
                  };
                } catch (error) {
                  console.error('Error parsing token amount:', error);
                }
              }
              
              return {
                from,
                to,
                amount: '0',
                tokenAddress,
                name,
                symbol,
                decimals
              };
            } catch (error) {
              console.error('Error processing token transfer log:', error);
              return null;
            }
          }));
          
          // Filter out null transfers
          transaction.tokenTransfers = transaction.tokenTransfers.filter(transfer => transfer !== null);
        }
      }
      
      return transaction;
    } catch (error) {
      console.error(`Error fetching transaction details for hash ${hash}:`, error);
      throw error;
    }
  },
  
  // Get transaction receipt
  getTransactionReceipt: async (hash) => {
    try {
      console.log(`Fetching transaction receipt for hash: ${hash}`);
      const response = await api.get(`/transactions/${hash}/receipt`);
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in getTransactionReceipt for hash ${hash}:`, error);
      return null;
    }
  },
  
  // Get pending transactions
  getPendingTransactions: async () => {
    try {
      console.log('Fetching pending transactions');
      const response = await api.get('/transactions/pending');
      const data = processApiData(response.data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getPendingTransactions:', error);
      return [];
    }
  }
};

export default blockchainTransactionsApi;
