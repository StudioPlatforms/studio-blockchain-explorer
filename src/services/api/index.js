import { coreApi } from './core.js';
import { blockchainApi, calculateTPS } from './blockchain.js';
import { accountsApi } from './accounts.js';
import { 
  isContractVerified,
  getContractDetails,
  getContractAbi,
  getContractSource,
  getContractEvents,
  verifyContract,
  interactWithContract,
  callContractMethod,
  processABI
} from './contracts.js';
import blockchainAIApi from './blockchainAI.js';

// Combine all API modules into a single API service
const apiService = {
  // Core API functions
  ...coreApi,
  
  // Blockchain API functions
  ...blockchainApi,
  
  // Accounts API functions
  ...accountsApi,
  
  // Contract API functions
  isContractVerified,
  getContractDetails,
  getContractAbi,
  getContractSource,
  getContractEvents,
  verifyContract,
  interactWithContract,
  callContractMethod,
  processABI,
  
  // AI Dashboard data - explicitly use the one from blockchainAI.js
  getAiDashboardData: blockchainAIApi.getAiDashboardData,
  
  // Debug function to get the base URL
  getBaseUrl: () => coreApi.getBaseUrl()
};

// Export the combined API service as the default export
export default apiService;

// Also export individual modules for direct access if needed
export {
  coreApi,
  blockchainApi,
  accountsApi,
  calculateTPS,
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
