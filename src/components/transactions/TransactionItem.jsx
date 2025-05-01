import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatEth } from '../../utils/formatters';
import TokenLogo from '../common/TokenLogo';

const TransactionItem = ({ transaction, isNew = false }) => {
  // Helper function to format STO values
  const formatStoValue = (value) => {
    try {
      if (!value) return '0 STO';
      
      // If value is already a number (likely already processed by convertBigNumber)
      if (typeof value === 'number') {
        return formatEth(value, { maxDecimals: 8 });
      }
      
      // For raw values, we need to handle them differently
      let valueInWei;
      
      // Handle different input types
      if (value && typeof value === 'object' && value.type === 'BigNumber' && value.hex) {
        // BigNumber object
        valueInWei = BigInt(value.hex);
      } else if (typeof value === 'string' && value.startsWith('0x')) {
        // Hex string
        valueInWei = BigInt(value);
      } else if (typeof value === 'string') {
        // Regular string - try to parse as BigInt
        try {
          valueInWei = BigInt(value);
        } catch (e) {
          // If parsing fails, try to parse as number
          return formatEth(parseFloat(value), { maxDecimals: 8 });
        }
      } else {
        console.warn('Unsupported value type for STO formatting:', value);
        return '0 STO';
      }
      
      // Convert to STO (divide by 10^18)
      const divisor = BigInt(10) ** BigInt(18);
      const wholePart = valueInWei / divisor;
      const fractionalPart = valueInWei % divisor;
      
      // If there's no fractional part, just return the whole part
      if (fractionalPart === BigInt(0)) {
        // Format the whole part with commas
        const formattedWholePart = wholePart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${formattedWholePart} STO`;
      }
      
      // For values with fractional parts, we need to handle them carefully
      // Format as a decimal string with the appropriate number of decimal places
      const fractionalStr = fractionalPart.toString().padStart(18, '0');
      
      // If the whole part is 0, we need to handle small values specially
      if (wholePart === BigInt(0)) {
        // For very small values, we need to find the first non-zero digit
        let significantDigits = 0;
        for (let i = 0; i < fractionalStr.length; i++) {
          if (fractionalStr[i] !== '0') {
            significantDigits = i + 8; // Show 8 significant digits
            break;
          }
        }
        
        // Limit to a reasonable number of decimal places
        const maxDigits = Math.min(significantDigits, 10);
        const limitedFractionalStr = fractionalStr.substring(0, maxDigits);
        
        return `0.${limitedFractionalStr} STO`;
      }
      
      // For values with both whole and fractional parts
      // Format the whole part with commas
      const formattedWholePart = wholePart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      
      // Limit fractional part to 6 decimal places
      const limitedFractionalStr = fractionalStr.substring(0, 6);
      
      // Trim trailing zeros
      const trimmedFractionalStr = limitedFractionalStr.replace(/0+$/, '');
      
      // If there's still a fractional part after trimming, include it
      if (trimmedFractionalStr.length > 0) {
        return `${formattedWholePart}.${trimmedFractionalStr} STO`;
      } else {
        return `${formattedWholePart} STO`;
      }
    } catch (error) {
      console.error('Error formatting STO value:', error);
      return '0 STO';
    }
  };
  
  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      // If timestamp is already a string, return it
      if (typeof timestamp === 'string') {
        return timestamp;
      }
      
      // Convert timestamp to date
      const date = new Date(timestamp * 1000);
      
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
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown time';
    }
  };

  // Determine transaction type
  const getTransactionType = () => {
    // For debugging
    console.log('Transaction data:', {
      hash: transaction.hash,
      value: transaction.value,
      input: transaction.input?.substring(0, 10),
      data: transaction.data?.substring(0, 10),
      hasTokenTransfers: !!transaction.tokenTransfers,
      tokenTransfersLength: transaction.tokenTransfers?.length,
      to: transaction.to ? 'exists' : 'null'
    });
    
    // Check for contract creation
    if (!transaction.to) {
      return {
        type: 'Contract Creation',
        icon: (
          <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        color: 'text-accent-purple'
      };
    }
    
    // Check for token transfer (ERC-20) - First check if tokenTransfers exists
    if (transaction.tokenTransfers && transaction.tokenTransfers.length > 0) {
      const tokenTransfer = transaction.tokenTransfers[0];
      const tokenSymbol = tokenTransfer.symbol || 'Token';
      
      return {
        type: `${tokenSymbol} Transfer`,
        icon: (
          <div className="w-5 h-5 flex items-center justify-center">
            <TokenLogo 
              token={{
                address: tokenTransfer.tokenAddress,
                symbol: tokenTransfer.symbol,
                name: tokenTransfer.name
              }} 
              size="sm" 
            />
          </div>
        ),
        color: 'text-accent-teal'
      };
    }
    
    // Fallback check for token transfer based on input data
    if (
      (transaction.value?.hex === '0x00' || 
      transaction.value === 0 || 
      transaction.value === '0') &&
      transaction.input?.startsWith('0xa9059cbb')
    ) {
      return {
        type: 'Token Transfer',
        icon: (
          <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'text-accent-teal'
      };
    }
    
    // Check for contract interaction - moved up in priority
    // This needs to be checked before the STO Transfer fallback
    // Check both input and data fields since different parts of the app might use either one
    if (transaction.to && ((transaction.input && transaction.input !== '0x' && transaction.input.length > 2) || 
                          (transaction.data && transaction.data !== '0x' && transaction.data.length > 2))) {
      return {
        type: 'Contract Interaction',
        icon: (
          <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        color: 'text-accent-teal'
      };
    }
    
    // Regular STO transfer
    return {
      type: 'STO Transfer',
      icon: (
        <img src="/studio-logo.png" alt="STO" className="w-5 h-5 object-contain" />
      ),
      color: 'text-primary'
    };
  };
  
  // Get transaction status
  const getTransactionStatus = () => {
    if (transaction.status === true || transaction.status === '0x1') {
      return {
        status: 'Success',
        color: 'bg-green-900 bg-opacity-20 text-green-400'
      };
    } else if (transaction.status === false || transaction.status === '0x0') {
      return {
        status: 'Failed',
        color: 'bg-red-900 bg-opacity-20 text-red-400'
      };
    } else {
      return {
        status: 'Pending',
        color: 'bg-yellow-900 bg-opacity-20 text-yellow-400'
      };
    }
  };
  
  // Calculate transaction fee
  const calculateTransactionFee = () => {
    if (!transaction.gasUsed || !transaction.gasPrice) return null;
    
    try {
      const gasUsed = typeof transaction.gasUsed === 'string' ? 
        parseInt(transaction.gasUsed.replace(/,/g, '')) : 
        transaction.gasUsed;
      
      const gasPrice = typeof transaction.gasPrice === 'string' ? 
        parseInt(transaction.gasPrice) : 
        transaction.gasPrice;
      
      // Calculate fee in STO
      // Gas price is in Gwei (10^9 Wei)
      // 1 STO = 10^18 Wei
      // So we need to multiply by 10^9 to get Wei, then divide by 10^18 to get STO
      const feeInWei = gasUsed * (gasPrice * 1e9);
      const feeInSto = feeInWei / 1e18;
      
      return feeInSto.toFixed(9);
    } catch (error) {
      console.error('Error calculating transaction fee:', error);
      return null;
    }
  };
  
  const txType = getTransactionType();
  const txStatus = getTransactionStatus();
  const txFee = calculateTransactionFee();

  return (
    <motion.div 
      initial={isNew ? { opacity: 0, y: -20, backgroundColor: 'rgba(123, 31, 162, 0.3)' } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(18, 18, 18, 1)' }}
      transition={{ duration: isNew ? 0.5 : 0, backgroundColor: { duration: 1.5 } }}
      className="transaction-item p-3 sm:p-4 bg-dark-200 rounded-lg hover:bg-opacity-80 transition-colors"
    >
      <div className="flex flex-col space-y-2">
        {/* Transaction icon and hash */}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-dark-100 flex items-center justify-center mr-2 flex-shrink-0">
            {txType.icon}
          </div>
          <div className="min-w-0 flex-1">
            <Link to={`/transactions/${transaction.hash}`} className="text-white hover:text-primary transition-colors block truncate w-full">
              <span className="font-mono text-xs">{transaction.hash}</span>
            </Link>
          </div>
        </div>
        
        {/* Transaction type, status, and value */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className={`text-xs ${txType.color} mr-2 font-medium`}>{txType.type}</span>
            {txStatus && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${txStatus.color}`}>
                {txStatus.status}
              </span>
            )}
          </div>
          <div className="text-xs font-semibold">
            {(() => {
              // For token transfers, show token amount and symbol
              if (txType.type !== 'STO Transfer' && 
                  transaction.tokenTransfers && 
                  transaction.tokenTransfers.length > 0) {
                const transfer = transaction.tokenTransfers[0];
                return `${transfer.amount} ${transfer.symbol}`;
              }
              // For regular STO transfers, show STO value
              return formatStoValue(transaction.value);
            })()}
          </div>
        </div>
        
        {/* From and To addresses */}
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div className="flex items-center">
            <span className="text-gray-400 mr-1.5 w-10 flex-shrink-0">From:</span>
            <Link to={`/address/${transaction.from}`} className="truncate hover:text-primary transition-colors">
              {transaction.from.substring(0, 6)}...{transaction.from.substring(transaction.from.length - 4)}
            </Link>
          </div>
          <div className="flex items-center">
            <span className="text-gray-400 mr-1.5 w-10 flex-shrink-0">To:</span>
            <Link to={`/address/${transaction.to || ''}`} className="truncate hover:text-primary transition-colors">
              {transaction.to ? `${transaction.to.substring(0, 6)}...${transaction.to.substring(transaction.to.length - 4)}` : '(Contract Creation)'}
            </Link>
          </div>
        </div>
        
        {/* Timestamp */}
        <div className="text-xs text-gray-400">{formatTimestamp(transaction.timestamp)}</div>
          
        {/* Token transfer information (if applicable) */}
        {txType.type === 'Token Transfer' && transaction.tokenTransfers && transaction.tokenTransfers.length > 0 && (
          <div className="mt-1.5 border-t border-gray-700 pt-1.5">
            <div className="text-xs text-gray-400 mb-1 font-medium">Token Transfers:</div>
            {transaction.tokenTransfers.map((transfer, index) => (
              <div key={index} className="flex flex-wrap items-center text-xs mb-1">
                <span className="text-accent-teal mr-1 font-medium">{transfer.amount} {transfer.symbol}</span>
                <span className="text-gray-400 mr-1">from</span>
                <Link to={`/address/${transfer.from}`} className="text-primary hover:underline mr-1">
                  {transfer.from.substring(0, 4)}...{transfer.from.substring(transfer.from.length - 4)}
                </Link>
                <span className="text-gray-400 mr-1">to</span>
                <Link to={`/address/${transfer.to}`} className="text-primary hover:underline">
                  {transfer.to.substring(0, 4)}...{transfer.to.substring(transfer.to.length - 4)}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TransactionItem;
