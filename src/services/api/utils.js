import { convertBigNumber } from '../../utils/formatters.js';

/**
 * Process API response data by converting BigNumber values
 * @param {any} data - The data to process
 * @returns {any} - The processed data
 */
const processApiData = (data) => {
  return convertBigNumber(data);
};

/**
 * Calculate transactions per second from blocks
 * @param {Array} blocks - Array of blocks
 * @returns {number} - Transactions per second
 */
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

/**
 * Decode string from contract call result
 * @param {string} hexData - Hex-encoded string data
 * @returns {string} - Decoded string
 */
const decodeString = (hexData) => {
  try {
    if (!hexData || hexData === '0x') return '';
    
    // Skip the first 32 bytes (offset) and read the next 32 bytes (length)
    const offset = parseInt(hexData.slice(2, 66), 16);
    const length = parseInt(hexData.slice(66, 130), 16);
    
    // Extract the string data
    const hexString = hexData.slice(130, 130 + length * 2);
    
    // Convert hex to string
    let result = '';
    for (let i = 0; i < hexString.length; i += 2) {
      const hexChar = hexString.substr(i, 2);
      const charCode = parseInt(hexChar, 16);
      if (charCode !== 0) { // Skip null bytes
        result += String.fromCharCode(charCode);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error decoding string:', error);
    return '';
  }
};

export {
  processApiData,
  calculateTPS,
  decodeString
};
