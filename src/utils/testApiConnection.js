/**
 * Test script for API connection
 * 
 * This script tests the connection to the Studio Blockchain Indexer API
 * and verifies that the application can fetch data from the API.
 * 
 * Run this script with:
 * node src/utils/testApiConnection.js
 */

import apiService from '../services/api';
import { blockchainApi } from '../services/api';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  }
};

// Helper function to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Test API connection
async function testApiConnection() {
  log('\n🔍 Testing API Connection to Studio Blockchain Indexer', colors.fg.cyan + colors.bright);
  log('=======================================================', colors.fg.cyan);
  
  try {
    // Test health endpoint
    log('\n1. Testing health endpoint...', colors.fg.yellow);
    const health = await apiService.getHealth();
    log('✅ Health endpoint working!', colors.fg.green);
    log(`   Status: ${health.status}`, colors.fg.white);
    log(`   Last Block: ${health.lastBlock}`, colors.fg.white);
    log(`   Is Indexing: ${health.isIndexing}`, colors.fg.white);
    
    // Test blocks endpoint
    log('\n2. Testing blocks endpoint...', colors.fg.yellow);
    const blocks = await apiService.getBlocks(5, 0);
    log('✅ Blocks endpoint working!', colors.fg.green);
    log(`   Retrieved ${blocks.length} blocks`, colors.fg.white);
    if (blocks.length > 0) {
      log(`   Latest block: ${blocks[0].number}`, colors.fg.white);
    }
    
    // Test block by number endpoint
    if (blocks.length > 0) {
      const blockNumber = blocks[0].number;
      log(`\n3. Testing block by number endpoint (block ${blockNumber})...`, colors.fg.yellow);
      const block = await apiService.getBlockByNumber(blockNumber);
      log('✅ Block by number endpoint working!', colors.fg.green);
      log(`   Block hash: ${block.hash}`, colors.fg.white);
      log(`   Transactions: ${block.transactions ? block.transactions.length : 0}`, colors.fg.white);
    } else {
      log('\n3. Skipping block by number test (no blocks available)', colors.fg.yellow);
    }
    
    // Test transactions endpoint (with fallback)
    log('\n4. Testing transactions endpoint...', colors.fg.yellow);
    try {
      const transactions = await apiService.getTransactions(5, 0);
      log('✅ Transactions endpoint working!', colors.fg.green);
      log(`   Retrieved ${transactions.length} transactions`, colors.fg.white);
      
      // Test transaction by hash endpoint if we have transactions
      if (transactions.length > 0) {
        const txHash = transactions[0].hash;
        log(`\n5. Testing transaction by hash endpoint (tx ${txHash.substring(0, 10)}...)...`, colors.fg.yellow);
        const transaction = await apiService.getTransactionByHash(txHash);
        log('✅ Transaction by hash endpoint working!', colors.fg.green);
        log(`   From: ${transaction.from}`, colors.fg.white);
        log(`   To: ${transaction.to}`, colors.fg.white);
      } else {
        log('\n5. Skipping transaction by hash test (no transactions available)', colors.fg.yellow);
      }
    } catch (error) {
      log(`❌ Transactions endpoint error: ${error.message}`, colors.fg.red);
      log('   This may be expected if the endpoint is not implemented', colors.fg.yellow);
    }
    
    // Test search endpoint
    log('\n6. Testing search endpoint...', colors.fg.yellow);
    try {
      // Search for the latest block number
      const searchQuery = blocks.length > 0 ? blocks[0].number.toString() : '1';
      const searchResult = await apiService.search(searchQuery);
      log('✅ Search endpoint working!', colors.fg.green);
      log(`   Search type: ${searchResult.type}`, colors.fg.white);
      log(`   Found data: ${searchResult.data ? 'Yes' : 'No'}`, colors.fg.white);
    } catch (error) {
      log(`❌ Search endpoint error: ${error.message}`, colors.fg.red);
    }
    
    // Test network stats
    log('\n7. Testing network stats...', colors.fg.yellow);
    const stats = await apiService.getNetworkStats();
    log('✅ Network stats working!', colors.fg.green);
    log(`   Latest block: ${stats.latestBlock}`, colors.fg.white);
    log(`   TPS: ${stats.tps}`, colors.fg.white);
    
    // Test AI Dashboard data (should use mock data with real API)
    log('\n8. Testing AI Dashboard data...', colors.fg.yellow);
    const aiData = await blockchainApi.getAiDashboardData();
    log('✅ AI Dashboard data available!', colors.fg.green);
    log(`   Using simulated data: ${aiData.isSimulated ? 'Yes' : 'No'}`, colors.fg.white);
    log(`   Neural network nodes: ${aiData.neuralNetwork?.nodes?.length || 'N/A'}`, colors.fg.white);
    
    // Summary
    log('\n✅ API Connection Test Summary', colors.fg.green + colors.bright);
    log('=========================', colors.fg.green);
    log('The application is successfully connected to the Studio Blockchain Indexer API.', colors.fg.white);
    log('You can now run the application with real blockchain data.', colors.fg.white);
    
  } catch (error) {
    log('\n❌ API Connection Test Failed', colors.fg.red + colors.bright);
    log('=========================', colors.fg.red);
    log(`Error: ${error.message}`, colors.fg.white);
    log('\nPossible reasons:', colors.fg.yellow);
    log('1. The API server is not running', colors.fg.white);
    log('2. The API_BASE_URL is incorrect', colors.fg.white);
    log('3. There are network connectivity issues', colors.fg.white);
    log('\nCheck the API configuration in src/services/api.js', colors.fg.white);
  }
}

// Run the test
testApiConnection().catch(error => {
  console.error('Unhandled error:', error);
});
