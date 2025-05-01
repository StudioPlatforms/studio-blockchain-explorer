import { api } from './config.js';
import { processApiData, decodeString } from './utils.js';

/**
 * Check if a contract is verified
 * @param {string} contractAddress - Contract address
 * @returns {Promise<boolean>} - Whether the contract is verified
 */
const isContractVerified = async (contractAddress) => {
  try {
    console.log(`Checking if contract ${contractAddress} is verified`);
    const response = await api.get(`/contracts/${contractAddress}/verified`);
    
    // The API returns a simple object with a 'verified' property
    if (response.data && typeof response.data === 'object' && 'verified' in response.data) {
      const isVerified = response.data.verified === true;
      console.log(`Contract ${contractAddress} verification status: ${isVerified}`);
      return isVerified;
    } else if (response.data === true) {
      // Handle case where the API returns a boolean directly
      console.log(`Contract ${contractAddress} is verified (direct boolean response)`);
      return true;
    }
    
    // If we can't determine verification status from the response, assume not verified
    console.log(`Contract ${contractAddress} is not verified (default assumption)`);
    return false;
  } catch (error) {
    console.error(`Error checking if contract ${contractAddress} is verified:`, error);
    return false;
  }
};

/**
 * Get contract details
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object|null>} - Contract details or null if not found
 */
const getContractDetails = async (contractAddress) => {
  try {
    console.log(`Fetching contract details for ${contractAddress}`);
    const response = await api.get(`/contracts/${contractAddress}`);
    
    // Check if the response contains valid contract details
    if (response.data && typeof response.data === 'object') {
      console.log(`Successfully fetched contract details for ${contractAddress}`);
      return processApiData(response.data);
    } else {
      console.warn(`Received invalid contract details format for ${contractAddress}:`, response.data);
      
      // Return a minimal contract details object
      return {
        address: contractAddress,
        type: 'contract',
        verified: false
      };
    }
  } catch (error) {
    console.error(`Error fetching contract details for ${contractAddress}:`, error);
    
    // Return a minimal contract details object
    return {
      address: contractAddress,
      type: 'contract',
      verified: false
    };
  }
};

/**
 * Get contract ABI
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Array|null>} - Contract ABI or null if not found
 */
const getContractAbi = async (contractAddress) => {
  try {
    console.log(`Fetching contract ABI for ${contractAddress}`);
    const response = await api.get(`/contracts/${contractAddress}/abi`);
    
    // The API returns the ABI in the 'abi' property of the response
    if (response.data && response.data.abi && Array.isArray(response.data.abi)) {
      console.log(`Successfully fetched ABI for ${contractAddress}`);
      return processApiData(response.data.abi);
    } else {
      console.warn(`Received invalid ABI format for ${contractAddress}:`, response.data);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching contract ABI for ${contractAddress}:`, error);
    return null;
  }
};

/**
 * Get contract source code
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object|null>} - Contract source code or null if not found
 */
const getContractSource = async (contractAddress) => {
  try {
    console.log(`Fetching contract source for ${contractAddress}`);
    
    // Fetch both source code and verification details in parallel
    const [sourceResponse, verificationResponse] = await Promise.all([
      api.get(`/contracts/${contractAddress}/source`).catch(error => {
        console.error(`Error fetching source code: ${error.message}`);
        return { data: null };
      }),
      api.get(`/contracts/${contractAddress}/verification`).catch(error => {
        console.error(`Error fetching verification details: ${error.message}`);
        return { data: null };
      })
    ]);
    
    // Check if we have source code
    if (!sourceResponse.data || !sourceResponse.data.sourceCode) {
      console.warn(`Received invalid source code format for ${contractAddress}:`, sourceResponse.data);
      return null;
    }
    
    console.log(`Successfully fetched source code for ${contractAddress}`);
    
    // Process the source code data
    const processedData = processApiData(sourceResponse.data);
    processedData.verified = true;
    
    // If we have verification details, merge them with the source code data
    if (verificationResponse.data) {
      console.log(`Successfully fetched verification details for ${contractAddress}:`, verificationResponse.data);
      
      // Merge verification details with source code data
      const verificationData = processApiData(verificationResponse.data);
      
      // Add verification details to the processed data
      processedData.contractName = verificationData.contractName;
      processedData.compilerVersion = verificationData.compilerVersion;
      processedData.license = verificationData.license || 'MIT'; // Default to MIT if license is null
      processedData.optimizationUsed = verificationData.optimizationUsed;
      processedData.runs = verificationData.runs;
      processedData.evmVersion = verificationData.evmVersion;
      processedData.verifiedAt = verificationData.verifiedAt;
      processedData.metadataHash = verificationData.metadataHash;
      processedData.libraries = verificationData.libraries;
      
      // Get contract details to get creator address
      try {
        const detailsResponse = await api.get(`/contracts/${contractAddress}`);
        if (detailsResponse.data) {
          processedData.creatorAddress = detailsResponse.data.creatorAddress;
          processedData.ownerAddress = detailsResponse.data.ownerAddress;
        }
      } catch (detailsError) {
        console.warn(`Could not fetch contract details for creator/owner address: ${detailsError.message}`);
      }
      
      console.log('Enhanced contract source data with verification details:', {
        contractName: processedData.contractName,
        compilerVersion: processedData.compilerVersion,
        license: processedData.license,
        optimizationUsed: processedData.optimizationUsed,
        runs: processedData.runs,
        evmVersion: processedData.evmVersion
      });
    } else {
      console.warn('No verification details available, using defaults');
      
      // Set default values if verification details are not available
      if (!processedData.contractName) {
        // Try to extract contract name from source code
        const sourceCode = processedData.sourceCode || '';
        const contractMatch = sourceCode.match(/contract\s+(\w+)(?:\s+is|\s*\{)/);
        if (contractMatch && contractMatch[1]) {
          processedData.contractName = contractMatch[1];
        } else {
          processedData.contractName = 'Unknown Contract';
        }
      }
      
      if (!processedData.compilerVersion) {
        // Try to extract compiler version from source code
        const sourceCode = processedData.sourceCode || '';
        const pragmaMatch = sourceCode.match(/pragma\s+solidity\s+(\^?[\d.]+)/);
        if (pragmaMatch && pragmaMatch[1]) {
          processedData.compilerVersion = pragmaMatch[1];
        } else {
          processedData.compilerVersion = '0.8.0'; // Default if not found
        }
      }
      
      if (!processedData.license) {
        // Try to extract license from source code
        const sourceCode = processedData.sourceCode || '';
        const licenseMatch = sourceCode.match(/SPDX-License-Identifier:\s*([A-Za-z0-9.-]+)/);
        if (licenseMatch && licenseMatch[1]) {
          processedData.license = licenseMatch[1];
        } else {
          processedData.license = 'MIT'; // Default license
        }
      }
      
      // Set default values for other fields
      processedData.optimizationUsed = processedData.optimizationUsed !== undefined ? processedData.optimizationUsed : true;
      processedData.runs = processedData.runs || 200;
      processedData.evmVersion = processedData.evmVersion || 'cancun';
    }
    
    return processedData;
  } catch (error) {
    console.error(`Error fetching contract source for ${contractAddress}:`, error);
    return null;
  }
};

/**
 * Get contract events
 * @param {string} contractAddress - Contract address
 * @param {Object} options - Options for filtering events
 * @param {number} options.fromBlock - Starting block number
 * @param {number} options.toBlock - Ending block number
 * @param {string} options.eventName - Filter by event name
 * @returns {Promise<Array>} - Array of contract events
 */
const getContractEvents = async (contractAddress, options = {}) => {
  try {
    console.log(`Fetching contract events for ${contractAddress}`);
    const params = {};
    if (options.fromBlock) params.fromBlock = options.fromBlock;
    if (options.toBlock) params.toBlock = options.toBlock;
    if (options.eventName) params.eventName = options.eventName;
    
    const response = await api.get(`/contracts/${contractAddress}/events`, { params });
    return processApiData(response.data);
  } catch (error) {
    console.error(`Error fetching contract events for ${contractAddress}:`, error);
    return [];
  }
};

/**
 * Verify a contract
 * @param {Object} contractData - Contract data for verification
 * @returns {Promise<Object>} - Verification result
 */
const verifyContract = async (contractData) => {
  try {
    // Ensure required fields are present
    if (!contractData.address) {
      throw new Error('Contract address is required');
    }
    if (!contractData.contractName) {
      throw new Error('Contract name is required');
    }
    if (!contractData.sourceCode) {
      throw new Error('Source code is required');
    }
    if (!contractData.compilerVersion) {
      throw new Error('Compiler version is required');
    }
    
    // Ensure evmVersion is included in the contract data
    if (!contractData.evmVersion) {
      contractData.evmVersion = 'cancun'; // Default to latest if not provided
    }
    
    // Prepare the data for the API
    const apiData = {
      address: contractData.address,
      sourceCode: contractData.sourceCode,
      compilerVersion: contractData.compilerVersion,
      contractName: contractData.contractName,
      optimizationUsed: contractData.optimizationUsed,
      runs: parseInt(contractData.runs || 200),
      constructorArguments: contractData.constructorArguments || '',
      libraries: contractData.libraries || {},
      evmVersion: contractData.evmVersion,
      license: contractData.license || 'MIT'
    };
    
    // Log the contract data being sent
    console.log('Verifying contract with data:', JSON.stringify(apiData, null, 2));
    
    // Make the API request
    const response = await api.post('/contracts/verify', apiData);
    console.log('Contract verification response:', response.data);
    
    return processApiData(response.data);
  } catch (error) {
    console.error('Error verifying contract:', error);
    throw error;
  }
};

/**
 * Interact with a contract
 * @param {string} contractAddress - Contract address
 * @param {string} method - Method name or signature
 * @param {Array} params - Method parameters
 * @param {string} value - Value to send with the transaction (in wei)
 * @returns {Promise<any>} - Method result
 */
const interactWithContract = async (contractAddress, method, params, value = "0") => {
  try {
    const response = await api.post(`/contracts/${contractAddress}/interact`, {
      method,
      params,
      value
    });
    return processApiData(response.data);
  } catch (error) {
    console.error(`Error interacting with contract ${contractAddress}:`, error);
    throw error;
  }
};

/**
 * Process ABI to get read and write functions
 * @param {Array} abi - Contract ABI
 * @returns {Object} - Object containing read functions, write functions, and events
 */
const processABI = (abi) => {
  console.log('processABI called with:', abi);
  
  if (!abi || !Array.isArray(abi)) {
    console.warn('processABI received invalid ABI (not an array):', abi);
    return { readFunctions: [], writeFunctions: [], events: [] };
  }
  
  console.log('ABI is an array with length:', abi.length);
  
  // Filter read functions (view/pure/constant)
  const readFunctions = abi.filter(item => {
    if (!item || typeof item !== 'object') return false;
    
    const isFunction = item.type === 'function';
    const isReadFunction = item.stateMutability === 'view' || 
                          item.stateMutability === 'pure' || 
                          item.constant === true;
    
    return isFunction && isReadFunction;
  });

  // Filter write functions (non-view/pure/constant)
  const writeFunctions = abi.filter(item => {
    if (!item || typeof item !== 'object') return false;
    
    const isFunction = item.type === 'function';
    const isWriteFunction = item.stateMutability !== 'view' && 
                           item.stateMutability !== 'pure' && 
                           item.constant !== true;
    
    return isFunction && isWriteFunction;
  });

  // Filter events
  const events = abi.filter(item => {
    if (!item || typeof item !== 'object') return false;
    return item.type === 'event';
  });

  console.log('Processed ABI results:', {
    readFunctionsCount: readFunctions.length,
    writeFunctionsCount: writeFunctions.length,
    eventsCount: events.length
  });

  return { readFunctions, writeFunctions, events };
};

/**
 * Call a contract method
 * @param {string} contractAddress - Contract address
 * @param {string} methodSignature - Method signature (e.g., '0x06fdde03' for name())
 * @param {Array} params - Method parameters
 * @returns {Promise<any>} - Method result
 */
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

export {
  isContractVerified,
  getContractDetails,
  getContractAbi,
  getContractSource,
  getContractEvents,
  verifyContract,
  interactWithContract,
  callContractMethod,
  processABI
};
