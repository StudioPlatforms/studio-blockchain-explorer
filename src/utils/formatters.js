/**
 * Utility functions for formatting blockchain data
 */

/**
 * Converts BigNumber objects to regular numbers or strings
 * @param {any} value - The value to convert
 * @returns {any} - The converted value
 */
export const convertBigNumber = (value) => {
  // If the value is null or undefined, return it as is
  if (value === null || value === undefined) {
    return value;
  }
  
  // If the value is a BigNumber object (has type and hex properties)
  if (value && typeof value === 'object' && value.type === 'BigNumber' && value.hex) {
    // For values that might be too large for JavaScript's Number type
    // Use BigInt for precise conversion, then convert to Number if safe
    try {
      const bigIntValue = BigInt(value.hex);
      
      // Check if this is likely an STO value (which needs to be divided by 10^18)
      // We need to be more aggressive in identifying STO values
      // Transaction values are always in wei (need to be divided by 10^18)
      const isStoValue = 
        // Check if the property name suggests it's a value
        ['value', 'amount', 'balance', 'gasPrice', 'maxFeePerGas', 'maxPriorityFeePerGas'].some(key => 
          Object.keys(value).includes(key)) ||
        // Or if it's a direct property of a transaction object
        (Object.keys(value).length === 2 && Object.keys(value).includes('type') && Object.keys(value).includes('hex'));
      
      if (isStoValue) {
        // For STO values, we need to divide by 10^18
        const divisor = BigInt(10) ** BigInt(18);
        const wholePart = bigIntValue / divisor;
        const fractionalPart = bigIntValue % divisor;
        
        // If there's no fractional part, just return the whole part as a number
        if (fractionalPart === BigInt(0)) {
          // If the whole part is small enough, return it as a number
          if (wholePart < BigInt(Number.MAX_SAFE_INTEGER)) {
            return Number(wholePart);
          }
          // Otherwise, return it as a string
          return wholePart.toString();
        }
        
        // For values with fractional parts, we need to handle them carefully
        // Format as a decimal string with the appropriate number of decimal places
        const fractionalStr = fractionalPart.toString().padStart(18, '0');
        
        // If the whole part is 0, we need to handle small values specially
        if (wholePart === BigInt(0)) {
          // For very small values, return as a decimal number
          // This will preserve the correct number of decimal places
          return Number(`0.${fractionalStr}`);
        }
        
        // For values with both whole and fractional parts
        // If the whole part is small enough, we can use standard division
        if (wholePart < BigInt(1000000)) {
          return Number(`${wholePart}.${fractionalStr}`);
        }
        
        // For larger values, return as a string to avoid precision loss
        return `${wholePart}.${fractionalStr}`;
      }
      
      // For non-STO values that fit in a Number
      if (bigIntValue < BigInt(Number.MAX_SAFE_INTEGER)) {
        return Number(bigIntValue);
      }
      
      // For larger values, return as string to avoid precision loss
      return bigIntValue.toString();
    } catch (error) {
      console.warn('Error converting BigNumber:', error);
      // Fallback to parseInt
      return parseInt(value.hex, 16);
    }
  }
  
  // If the value is an array, convert each item
  if (Array.isArray(value)) {
    return value.map(item => convertBigNumber(item));
  }
  
  // If the value is an object, convert each property
  if (typeof value === 'object' && value !== null) {
    const result = {};
    for (const key in value) {
      result[key] = convertBigNumber(value[key]);
    }
    return result;
  }
  
  // Otherwise, return the value as is
  return value;
};

/**
 * Formats a timestamp to a human-readable date
 * @param {number|string} timestamp - The timestamp to format
 * @returns {string} - The formatted date
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    // If timestamp is already a string that looks like a formatted date, return it
    if (typeof timestamp === 'string' && isNaN(parseInt(timestamp))) {
      return timestamp;
    }
    
    // Convert to number if it's a string
    const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    
    // Convert to milliseconds if needed
    const date = new Date(timestampNum * 1000);
    
    // Get time difference in seconds
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    
    // Format as relative time
    if (diffSeconds < 60) {
      return `${diffSeconds} sec${diffSeconds !== 1 ? 's' : ''} ago`;
    }
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    // For older dates, return the full date
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return String(timestamp);
  }
};

/**
 * Formats a gas value to a human-readable string
 * @param {number} gas - The gas value to format
 * @returns {string} - The formatted gas value
 */
export const formatGas = (gas) => {
  if (gas === undefined || gas === null) return '0';
  return gas.toLocaleString();
};

/**
 * Formats a gas price to a human-readable string
 * @param {number} gasPrice - The gas price to format
 * @returns {string} - The formatted gas price
 */
export const formatGasPrice = (gasPrice) => {
  if (!gasPrice) return '0 Gwei';
  
  // Convert to number if it's a string
  const numValue = typeof gasPrice === 'string' ? parseFloat(gasPrice) : gasPrice;
  
  if (numValue === 0) return '0 Gwei';
  
  // Format to 2 decimal places if it's a whole number or close to it
  if (Math.abs(numValue - Math.round(numValue)) < 0.01) {
    return `${Math.round(numValue)} Gwei`;
  }
  
  // Format to 2 decimal places for most values
  if (numValue < 1000) {
    return `${numValue.toFixed(2)} Gwei`;
  }
  
  // For larger values, use K/M/G suffix
  if (numValue < 1000000) {
    return `${(numValue / 1000).toFixed(2)}K Gwei`;
  }
  
  return `${(numValue / 1000000).toFixed(2)}M Gwei`;
};

/**
 * Formats an STO value to a human-readable string with appropriate decimal places
 * @param {number|string|object} value - The STO value to format (can be a BigNumber object)
 * @param {object} options - Formatting options
 * @param {boolean} options.includeSymbol - Whether to include the STO symbol (default: true)
 * @param {number} options.maxDecimals - Maximum number of decimal places to show (default: 18)
 * @param {number} options.minDecimals - Minimum number of decimal places to show (default: 0)
 * @returns {string} - The formatted STO value
 */
export const formatEth = (value, options = {}) => {
  const {
    includeSymbol = true,
    maxDecimals = 18,
    minDecimals = 0
  } = options;
  
  if (value === null || value === undefined) return includeSymbol ? '0 STO' : '0';
  
  try {
    // If value is already a number, use it directly
    if (typeof value === 'number') {
      // Determine appropriate decimal places based on the value
      let decimals;
      if (value >= 1000) {
        // For large values, show fewer decimals
        decimals = Math.max(minDecimals, 2);
      } else if (value >= 1) {
        // For medium values
        decimals = Math.max(minDecimals, 4);
      } else if (value >= 0.0001) {
        // For small values
        decimals = Math.max(minDecimals, 6);
      } else if (value > 0) {
        // For very small values
        decimals = Math.max(minDecimals, 8);
      } else {
        decimals = minDecimals;
      }
      
      // Cap at maxDecimals
      decimals = Math.min(decimals, maxDecimals);
      
      // Format the number with commas and appropriate decimals
      const formattedValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: decimals
      }).format(value);
      
      return includeSymbol ? `${formattedValue} STO` : formattedValue;
    }
    
    let valueInWei;
    
    // Handle different input types
    if (value && typeof value === 'object' && value.type === 'BigNumber' && value.hex) {
      // BigNumber object
      valueInWei = BigInt(value.hex);
    } else if (typeof value === 'string' && value.startsWith('0x')) {
      // Hex string
      valueInWei = BigInt(value);
    } else if (typeof value === 'string') {
      // Regular string - try to parse as number first
      try {
        return formatEth(parseFloat(value), options);
      } catch (e) {
        // If parsing fails, try to treat as BigInt
        valueInWei = BigInt(value);
      }
    } else {
      console.warn('Unsupported value type for STO formatting:', value);
      return includeSymbol ? '0 STO' : '0';
    }
    
    // For very large values, we need to handle them differently
    // Use BigInt division to avoid precision loss
    const divisor = BigInt(10) ** BigInt(18);
    const wholePart = valueInWei / divisor;
    const fractionalPart = valueInWei % divisor;
    
    // Format the whole part with commas
    const formattedWholePart = wholePart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // If there's no fractional part, just return the whole part
    if (fractionalPart === BigInt(0)) {
      return includeSymbol ? `${formattedWholePart} STO` : formattedWholePart;
    }
    
    // Format the fractional part
    // Convert to string and pad with leading zeros
    let fractionalStr = fractionalPart.toString().padStart(18, '0');
    
    // Limit to maxDecimals
    fractionalStr = fractionalStr.substring(0, maxDecimals);
    
    // Trim trailing zeros
    fractionalStr = fractionalStr.replace(/0+$/, '');
    
    // If there's still a fractional part after trimming, include it
    if (fractionalStr.length > 0) {
      return includeSymbol ? `${formattedWholePart}.${fractionalStr} STO` : `${formattedWholePart}.${fractionalStr}`;
    } else {
      return includeSymbol ? `${formattedWholePart} STO` : formattedWholePart;
    }
  } catch (error) {
    console.warn('Error formatting STO value:', error, value);
    return includeSymbol ? '0 STO' : '0';
  }
};

/**
 * Shortens an address for display
 * @param {string} address - The address to shorten
 * @returns {string} - The shortened address
 */
export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Formats a token value based on its decimals
 * @param {string|number} value - The token value in wei
 * @param {number} decimals - The number of decimals for the token
 * @param {object} options - Formatting options
 * @param {number} options.maxDecimals - Maximum number of decimal places to show (default: 6)
 * @param {boolean} options.includeCommas - Whether to include commas for thousands separators (default: true)
 * @returns {string} - The formatted token value
 */
export const formatTokenValue = (value, decimals = 18, options = {}) => {
  const {
    maxDecimals = 6,
    includeCommas = true
  } = options;
  
  if (!value) return '0';
  
  try {
    let valueInWei;
    
    // Handle different input types
    if (typeof value === 'string' && value.startsWith('0x')) {
      // Hex string
      valueInWei = BigInt(value);
    } else if (typeof value === 'string') {
      // Regular string
      valueInWei = BigInt(value);
    } else if (typeof value === 'number') {
      // Number
      valueInWei = BigInt(Math.floor(value));
    } else if (value && typeof value === 'object' && value.type === 'BigNumber' && value.hex) {
      // BigNumber object
      valueInWei = BigInt(value.hex);
    } else {
      console.warn('Unsupported value type for token formatting:', value);
      return '0';
    }
    
    // Convert to token units (divide by 10^decimals)
    const divisor = BigInt(10) ** BigInt(decimals);
    const wholePart = valueInWei / divisor;
    const fractionalPart = valueInWei % divisor;
    
    // Convert to string with appropriate decimal places
    let result = wholePart.toString();
    
    if (fractionalPart > 0) {
      // Convert fractional part to string and pad with leading zeros
      let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
      
      // Trim trailing zeros
      fractionalStr = fractionalStr.replace(/0+$/, '');
      
      // Limit to maxDecimals
      if (fractionalStr.length > maxDecimals) {
        fractionalStr = fractionalStr.substring(0, maxDecimals);
      }
      
      result = `${result}.${fractionalStr}`;
    }
    
    // Add commas for thousands separators if requested
    if (includeCommas) {
      const parts = result.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      result = parts.join('.');
    }
    
    return result;
  } catch (error) {
    console.warn('Error formatting token value:', error, value);
    return '0';
  }
};
