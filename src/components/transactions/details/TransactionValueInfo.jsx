import React from 'react';
import { formatEth, formatGasPrice } from '../../../utils/formatters';

/**
 * Component for displaying transaction value and fee information
 */
const TransactionValueInfo = ({ transaction, receipt }) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
        <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Value:</div>
        <div className="w-full md:w-2/3">
          <div className="font-mono">
            {(() => {
              // Check if this is a token transfer
              const hasTokenTransfers = transaction.tokenTransfers && transaction.tokenTransfers.length > 0;
              
              // For token transfers, show token amount and symbol
              if (hasTokenTransfers) {
                const transfer = transaction.tokenTransfers[0];
                return `${transfer.amount} ${transfer.symbol}`;
              }
              
              // For regular STO transfers
              try {
                if (!transaction.value) return '0 STO';
                
                // If value is already a number (likely already processed by convertBigNumber)
                if (typeof transaction.value === 'number') {
                  return formatEth(transaction.value, { maxDecimals: 10 });
                }
                
                // For raw values, we need to handle them differently
                let valueInWei;
                
                // Handle different input types
                if (transaction.value && typeof transaction.value === 'object' && transaction.value.type === 'BigNumber' && transaction.value.hex) {
                  // BigNumber object
                  valueInWei = BigInt(transaction.value.hex);
                } else if (typeof transaction.value === 'string' && transaction.value.startsWith('0x')) {
                  // Hex string
                  valueInWei = BigInt(transaction.value);
                } else if (typeof transaction.value === 'string') {
                  // Regular string - try to parse as BigInt
                  try {
                    valueInWei = BigInt(transaction.value);
                  } catch (e) {
                    // If parsing fails, try to parse as number
                    return formatEth(parseFloat(transaction.value), { maxDecimals: 10 });
                  }
                } else {
                  console.warn('Unsupported value type for STO formatting:', transaction.value);
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
                      significantDigits = i + 10; // Show 10 significant digits
                      break;
                    }
                  }
                  
                  // Limit to a reasonable number of decimal places
                  const maxDigits = Math.min(significantDigits, 12);
                  const limitedFractionalStr = fractionalStr.substring(0, maxDigits);
                  
                  return `0.${limitedFractionalStr} STO`;
                }
                
                // For values with both whole and fractional parts
                // Format the whole part with commas
                const formattedWholePart = wholePart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                
                // Limit fractional part to 8 decimal places
                const limitedFractionalStr = fractionalStr.substring(0, 8);
                
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
            })()}
          </div>
          {transaction.value && transaction.value !== '0x0' && transaction.value !== '0' && !transaction.tokenTransfers && (
            <div className="text-sm text-gray-400">
              {(() => {
                try {
                  // If value is already a number (likely already processed by convertBigNumber)
                  if (typeof transaction.value === 'number') {
                    return `≈ $${(transaction.value * 0.10).toFixed(6)} (@ $0.10 per STO)`;
                  }
                  
                  // For raw values, we need to handle them differently
                  let valueInWei;
                  
                  // Handle different input types
                  if (transaction.value && typeof transaction.value === 'object' && transaction.value.type === 'BigNumber' && transaction.value.hex) {
                    // BigNumber object
                    valueInWei = BigInt(transaction.value.hex);
                  } else if (typeof transaction.value === 'string' && transaction.value.startsWith('0x')) {
                    // Hex string
                    valueInWei = BigInt(transaction.value);
                  } else if (typeof transaction.value === 'string') {
                    // Regular string - try to parse as BigInt
                    valueInWei = BigInt(transaction.value);
                  } else {
                    return '≈ $0.00 (@ $0.10 per STO)';
                  }
                  
                  // Convert to STO (divide by 10^18)
                  const divisor = BigInt(10) ** BigInt(18);
                  const wholePart = valueInWei / divisor;
                  const fractionalPart = valueInWei % divisor;
                  
                  // If there's no fractional part, just calculate USD value from the whole part
                  if (fractionalPart === BigInt(0)) {
                    return `≈ $${(Number(wholePart) * 0.10).toFixed(2)} (@ $0.10 per STO)`;
                  }
                  
                  // For values with fractional parts, we need to handle them carefully
                  // Format as a decimal string with the appropriate number of decimal places
                  const fractionalStr = fractionalPart.toString().padStart(18, '0');
                  
                  // If the whole part is 0, we need to handle small values specially
                  if (wholePart === BigInt(0)) {
                    // For very small values, calculate USD value from the decimal representation
                    const decimalValue = Number(`0.${fractionalStr}`);
                    return `≈ $${(decimalValue * 0.10).toFixed(10)} (@ $0.10 per STO)`;
                  }
                  
                  // For values with both whole and fractional parts
                  // Calculate USD value from the whole part and the first few decimal places
                  const decimalValue = Number(`${wholePart}.${fractionalStr.substring(0, 6)}`);
                  return `≈ $${(decimalValue * 0.10).toFixed(6)} (@ $0.10 per STO)`;
                } catch (error) {
                  console.error('Error calculating USD value:', error);
                  return '≈ $0.00 (@ $0.10 per STO)';
                }
              })()}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
        <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Transaction Fee:</div>
        <div className="w-full md:w-2/3">
          {(() => {
            try {
              if (transaction.gasPrice === '0' || transaction.gasPrice === 0) {
                return (
                  <div>
                    <span className="inline-flex items-center text-accent-teal font-mono">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Zero Fee (AI Optimized)
                    </span>
                    <div className="text-sm text-gray-400 mt-1">
                      ≈ $0.00
                    </div>
                  </div>
                );
              } else {
                const gasUsed = typeof receipt?.gasUsed === 'string' ? 
                  parseInt(receipt.gasUsed.replace(/,/g, '')) : 
                  receipt?.gasUsed || transaction.gasUsed || 0;
                const gasPrice = typeof transaction.gasPrice === 'string' ? 
                  parseInt(transaction.gasPrice) : 
                  transaction.gasPrice;
                
                // Calculate fee in STO
                // Gas price is in Gwei (10^9 Wei)
                // 1 STO = 10^18 Wei
                // So we need to multiply by 10^9 to get Wei, then divide by 10^18 to get STO
                const feeInWei = gasUsed * (gasPrice * 1e9);
                const feeInSto = feeInWei / 1e18;
                const feeInUsd = feeInSto * 0.10;
                
                return (
                  <div>
                    <div className="font-mono">
                      {gasUsed.toLocaleString()} * {formatGasPrice(gasPrice)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      ≈ {feeInSto.toLocaleString(undefined, {maximumFractionDigits: 9})} STO (${feeInUsd.toLocaleString(undefined, {maximumFractionDigits: 6})})
                    </div>
                  </div>
                );
              }
            } catch (error) {
              console.error('Error calculating transaction fee:', error);
              return 'Error calculating fee';
            }
          })()}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
        <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Gas Limit:</div>
        <div className="w-full md:w-2/3 font-mono">{parseInt(transaction.gasLimit).toLocaleString() || 'N/A'}</div>
      </div>
      
      <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
        <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Gas Used:</div>
        <div className="w-full md:w-2/3 font-mono">
          {(() => {
            try {
              if (receipt?.gasUsed) {
                return typeof receipt.gasUsed === 'string' 
                  ? parseInt(receipt.gasUsed.replace(/,/g, '')).toLocaleString() 
                  : receipt.gasUsed.toLocaleString();
              } else if (transaction.gasUsed) {
                return typeof transaction.gasUsed === 'string'
                  ? parseInt(transaction.gasUsed.replace(/,/g, '')).toLocaleString()
                  : transaction.gasUsed.toLocaleString();
              } else {
                return '0';
              }
            } catch (error) {
              console.error('Error formatting gas used:', error);
              return '0';
            }
          })()}
        </div>
      </div>
      
      {/* Gas Price removed as requested */}
      
      <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
        <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Nonce:</div>
        <div className="w-full md:w-2/3 font-mono">{transaction.nonce || 'N/A'}</div>
      </div>
      
      {/* Zero Gas Fee Explanation (only if gas price is 0) */}
      {(transaction.gasPrice === '0' || transaction.gasPrice === 0) && (
        <div className="mt-6 bg-dark-200 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-accent-teal bg-opacity-20 flex items-center justify-center mr-3 mt-1">
              <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">AI-Optimized Transaction</h3>
              <p className="text-gray-300 text-sm">
                This transaction was processed with zero gas fees thanks to Studio Blockchain's on-chain neural networks.
                The AI analyzed the transaction and determined it could be included in an optimized block without requiring
                gas fees from the sender, making blockchain interactions more accessible and cost-effective.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionValueInfo;
