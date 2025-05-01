/**
 * Transaction Decoder Service
 * 
 * This service provides functionality to decode transaction data using contract ABIs
 * and generate human-readable descriptions of contract interactions.
 */

/**
 * Generate a human-readable description for a decoded function call
 * @param {Object} decodedData - The decoded function data
 * @param {Object} contractInfo - Information about the contract (optional)
 * @returns {string} - Human-readable description
 */
const generateDescription = (decodedData, contractInfo = {}) => {
  if (!decodedData || !decodedData.functionName) {
    return 'Unknown contract interaction';
  }

  const { functionName, params } = decodedData;
  const contractType = contractInfo.contractType || 'unknown';
  const contractName = contractInfo.name || contractInfo.contractName || 'Contract';
  const symbol = contractInfo.symbol || 'tokens';
  
  // Helper function to format addresses for display
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Helper function to format token amounts
  const formatTokenAmount = (amount, decimals = 18) => {
    if (!amount) return '0';
    
    try {
      // If amount is already a formatted string, return it
      if (typeof amount === 'string' && amount.includes('.')) {
        return amount;
      }
      
      // Convert to number and format
      const amountNum = typeof amount === 'string' ? 
        parseFloat(amount) : Number(amount);
      
      // Apply decimals
      const formattedAmount = (amountNum / Math.pow(10, decimals)).toLocaleString(
        undefined, { maximumFractionDigits: 6 }
      );
      
      return formattedAmount;
    } catch (error) {
      console.error('Error formatting token amount:', error);
      return amount.toString();
    }
  };
  
  // Handle ERC20 token functions
  if (contractType === 'ERC20') {
    switch (functionName) {
      case 'transfer':
        if (params && params.length >= 2) {
          const recipient = params[0].value;
          const amount = params[1].value;
          return `Transfer ${formatTokenAmount(amount, contractInfo.decimals)} ${symbol} to ${shortenAddress(recipient)}`;
        }
        break;
        
      case 'approve':
        if (params && params.length >= 2) {
          const spender = params[0].value;
          const amount = params[1].value;
          return `Approve ${shortenAddress(spender)} to spend ${formatTokenAmount(amount, contractInfo.decimals)} ${symbol}`;
        }
        break;
        
      case 'transferFrom':
        if (params && params.length >= 3) {
          const sender = params[0].value;
          const recipient = params[1].value;
          const amount = params[2].value;
          return `Transfer ${formatTokenAmount(amount, contractInfo.decimals)} ${symbol} from ${shortenAddress(sender)} to ${shortenAddress(recipient)}`;
        }
        break;
        
      case 'mint':
        if (params && params.length >= 2) {
          const recipient = params[0].value;
          const amount = params[1].value;
          return `Mint ${formatTokenAmount(amount, contractInfo.decimals)} ${symbol} to ${shortenAddress(recipient)}`;
        } else if (params && params.length >= 1) {
          const amount = params[0].value;
          return `Mint ${formatTokenAmount(amount, contractInfo.decimals)} ${symbol}`;
        }
        break;
        
      case 'burn':
        if (params && params.length >= 1) {
          const amount = params[0].value;
          return `Burn ${formatTokenAmount(amount, contractInfo.decimals)} ${symbol}`;
        }
        break;
    }
  }
  // Handle ERC721 token functions (NFTs)
  else if (contractType === 'ERC721') {
    switch (functionName) {
      case 'transferFrom':
      case 'safeTransferFrom':
        if (params && params.length >= 3) {
          const from = params[0].value;
          const to = params[1].value;
          const tokenId = params[2].value;
          return `Transfer NFT #${tokenId} from ${shortenAddress(from)} to ${shortenAddress(to)}`;
        }
        break;
        
      case 'approve':
        if (params && params.length >= 2) {
          const approved = params[0].value;
          const tokenId = params[1].value;
          return `Approve ${shortenAddress(approved)} to transfer NFT #${tokenId}`;
        }
        break;
        
      case 'setApprovalForAll':
        if (params && params.length >= 2) {
          const operator = params[0].value;
          const approved = params[1].value;
          return `${approved ? 'Approve' : 'Revoke'} ${shortenAddress(operator)} to manage all NFTs`;
        }
        break;
        
      case 'mint':
        if (params && params.length >= 2) {
          const to = params[0].value;
          const tokenId = params[1].value;
          return `Mint NFT #${tokenId} to ${shortenAddress(to)}`;
        }
        break;
    }
  }
  // Handle ERC1155 token functions (Multi-tokens)
  else if (contractType === 'ERC1155') {
    switch (functionName) {
      case 'safeTransferFrom':
        if (params && params.length >= 4) {
          const from = params[0].value;
          const to = params[1].value;
          const id = params[2].value;
          const amount = params[3].value;
          return `Transfer ${amount} of token #${id} from ${shortenAddress(from)} to ${shortenAddress(to)}`;
        }
        break;
        
      case 'safeBatchTransferFrom':
        if (params && params.length >= 4) {
          const from = params[0].value;
          const to = params[1].value;
          return `Batch transfer tokens from ${shortenAddress(from)} to ${shortenAddress(to)}`;
        }
        break;
        
      case 'setApprovalForAll':
        if (params && params.length >= 2) {
          const operator = params[0].value;
          const approved = params[1].value;
          return `${approved ? 'Approve' : 'Revoke'} ${shortenAddress(operator)} to manage all tokens`;
        }
        break;
    }
  }
  
  // Generic function description for other contract types
  let description = `Call ${functionName}`;
  
  // Add parameters if available
  if (params && params.length > 0) {
    const paramDescriptions = params.map(param => {
      const paramValue = typeof param.value === 'object' ? 
        JSON.stringify(param.value) : param.value.toString();
      
      // Shorten addresses
      if (param.type === 'address') {
        return `${param.name || param.type}: ${shortenAddress(paramValue)}`;
      }
      
      // Format large numbers
      if (param.type.includes('int') && !isNaN(paramValue)) {
        const num = BigInt(paramValue);
        if (num > 1000000) {
          return `${param.name || param.type}: ${formatTokenAmount(paramValue)}`;
        }
      }
      
      return `${param.name || param.type}: ${paramValue}`;
    });
    
    description += ` with ${paramDescriptions.join(', ')}`;
  }
  
  return description;
};

/**
 * Format decoded transaction data for display
 * @param {Object} decodedData - The decoded transaction data from the API
 * @returns {Object} - Formatted data for display
 */
const formatDecodedTransaction = (decodedData) => {
  if (!decodedData) {
    return {
      functionName: 'Unknown Function',
      functionSignature: '',
      params: [],
      description: 'Unable to decode transaction data'
    };
  }
  
  return {
    functionName: decodedData.functionName || 'Unknown Function',
    functionSignature: decodedData.functionSignature || '',
    params: decodedData.params || [],
    description: decodedData.description || 'Contract interaction'
  };
};

export {
  generateDescription,
  formatDecodedTransaction
};
