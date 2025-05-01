import { api, processApiData, decodeString } from './core.js';

// Helper function to calculate TPS from blocks
const calculateTPS = (blocks) => {
  if (!blocks || blocks.length < 2) {
    return 0;
  }
  
  const totalTxs = blocks.reduce((sum, block) => sum + block.transactions_count, 0);
  const firstBlock = blocks[blocks.length - 1];
  const lastBlock = blocks[0];
  const timeSpan = lastBlock.timestamp - firstBlock.timestamp;
  
  if (timeSpan <= 0) {
    return 0;
  }
  
  return totalTxs / timeSpan;
};

// Call contract method
const callContractMethod = async (contractAddress, methodSignature, params = []) => {
  try {
    // Create the data parameter for eth_call
    let data = methodSignature; // Method signature (e.g., '0x06fdde03' for name())
    
    // Add parameters if any
    if (params.length > 0) {
      // Encode parameters (simplified version)
      // In a real implementation, you would use a proper ABI encoder
      params.forEach(param => {
        if (typeof param === 'string' && param.startsWith('0x')) {
          // Address or bytes - pad to 32 bytes
          data += param.substring(2).padStart(64, '0');
        } else if (typeof param === 'number') {
          // Number - convert to hex and pad
          data += param.toString(16).padStart(64, '0');
        } else {
          // String or other - convert to hex and pad
          data += Buffer.from(String(param)).toString('hex').padStart(64, '0');
        }
      });
    }
    
    // Call the contract
    const response = await api.post('/proxy/rpc', {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: contractAddress,
          data: data
        },
        'latest'
      ],
      id: 1
    });
    
    // Process the response
    if (response.data.error) {
      throw new Error(`RPC error: ${response.data.error.message}`);
    }
    
    const result = response.data.result;
    
    // Decode the result based on the method signature
    // This is a simplified decoder - in a real implementation, you would use a proper ABI decoder
    if (methodSignature === '0x06fdde03') { // name()
      return decodeString(result);
    } else if (methodSignature === '0x95d89b41') { // symbol()
      return decodeString(result);
    } else if (methodSignature === '0x313ce567') { // decimals()
      return parseInt(result, 16);
    } else {
      // Return raw result for other methods
      return result;
    }
  } catch (error) {
    console.error('Error calling contract method:', error);
    return null;
  }
};

export { calculateTPS, callContractMethod };
