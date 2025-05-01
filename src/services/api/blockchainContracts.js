import { api, processApiData } from './core.js';
import { callContractMethod } from './blockchainCore.js';

// Contract-related API functions
const blockchainContractsApi = {
  // Get contract details
  getContractDetails: async (address) => {
    try {
      console.log(`Fetching contract details for address: ${address}`);
      const response = await api.get(`/contracts/${address}`);
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in getContractDetails for address ${address}:`, error);
      return null;
    }
  },
  
  // Get contract creation info
  getContractCreationInfo: async (address) => {
    try {
      console.log(`Fetching contract creation info for address: ${address}`);
      const response = await api.get(`/contracts/${address}/creation`);
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in getContractCreationInfo for address ${address}:`, error);
      return null;
    }
  },
  
  // Check if a contract is verified
  isContractVerified: async (address) => {
    try {
      console.log(`Checking if contract ${address} is verified`);
      const response = await api.get(`/contracts/${address}/verified`);
      const data = processApiData(response.data);
      return data.verified || false;
    } catch (error) {
      console.error(`Error in isContractVerified for address ${address}:`, error);
      return false;
    }
  },
  
  // Get contract ABI
  getContractABI: async (address) => {
    try {
      console.log(`Fetching contract ABI for address: ${address}`);
      const response = await api.get(`/contracts/${address}/abi`);
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in getContractABI for address ${address}:`, error);
      return null;
    }
  },
  
  // Get contract source code
  getContractSourceCode: async (address) => {
    try {
      console.log(`Fetching contract source code for address: ${address}`);
      const response = await api.get(`/contracts/${address}/source`);
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in getContractSourceCode for address ${address}:`, error);
      return null;
    }
  },
  
  // Get contract verification details
  getContractVerificationDetails: async (address) => {
    try {
      console.log(`Fetching contract verification details for address: ${address}`);
      const response = await api.get(`/contracts/${address}/verification`);
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in getContractVerificationDetails for address ${address}:`, error);
      return null;
    }
  },
  
  // Get contracts by creator
  getContractsByCreator: async (address) => {
    try {
      console.log(`Fetching contracts created by address: ${address}`);
      const response = await api.get(`/address/${address}/contracts`);
      return processApiData(response.data);
    } catch (error) {
      console.error(`Error in getContractsByCreator for address ${address}:`, error);
      return [];
    }
  },
  
  // Get token contracts
  getTokenContracts: async () => {
    try {
      console.log('Fetching token contracts');
      const response = await api.get('/tokens');
      return processApiData(response.data);
    } catch (error) {
      console.error('Error in getTokenContracts:', error);
      return [];
    }
  },
  
  // Call a contract method
  callContract: async (contractAddress, methodSignature, params = []) => {
    return callContractMethod(contractAddress, methodSignature, params);
  }
};

export default blockchainContractsApi;
