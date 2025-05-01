import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { formatEth } from '../../../utils/formatters';
import apiService from '../../../services/api';
import TokenLogo from '../../common/TokenLogo';

/**
 * Component for the Overview tab in transaction details
 */
const TransactionOverviewTab = ({ 
  transaction, 
  receipt, 
  txStatus, 
  hasTokenTransfers, 
  tokenInfo, 
  decodedData,
  copiedText, 
  copyToClipboard 
}) => {
  const [contractName, setContractName] = useState('');

  // Fetch contract name when component mounts
  useEffect(() => {
    const fetchContractName = async () => {
      if (transaction.to && (transaction.data !== '0x' && transaction.data !== undefined)) {
        try {
          // Try to get contract name using the name() method
          const nameResponse = await apiService.callContractMethod(transaction.to, '0x06fdde03');
          if (nameResponse) {
            setContractName(nameResponse);
          } else {
            // If name() method fails, try to get contract details
            const contractDetails = await apiService.getContractDetails(transaction.to);
            if (contractDetails && contractDetails.contractName) {
              setContractName(contractDetails.contractName);
            } else {
              setContractName('Contract');
            }
          }
        } catch (error) {
          console.error('Error fetching contract name:', error);
          setContractName('Contract');
        }
      }
    };

    fetchContractName();
  }, [transaction.to, transaction.data]);
  // Determine transaction type and details
  let transactionTypeInfo = {
    title: 'Unknown Transaction',
    icon: null,
    description: null,
    tokenSymbol: null,
    tokenAmount: null,
    tokenContract: null,
    tokenName: null,
    logoPath: null
  };
  
  // Check for token transfers
  if (hasTokenTransfers) {
    const transfer = transaction.tokenTransfers?.[0] || tokenInfo?.transfers?.[0];
    if (transfer) {
      transactionTypeInfo = {
        title: `${transfer.symbol} Transfer`,
        description: `Transferred ${transfer.amount} ${transfer.symbol}`,
        tokenSymbol: transfer.symbol,
        tokenAmount: transfer.amount,
        tokenContract: transfer.tokenAddress,
        tokenName: transfer.name || tokenInfo?.name,
        useTokenLogo: true
      };
    }
  }
  // Check for contract creation
  else if (!transaction.to && receipt?.contractAddress) {
    transactionTypeInfo = {
      title: 'Contract Creation',
      icon: '📄', // Using emoji instead of missing image
      description: 'Created a new contract',
      contractAddress: receipt.contractAddress
    };
  }
  // Check for STO transfer
  else if (transaction.value && transaction.value !== '0x0' && transaction.value !== 0) {
    // Format STO value
    let stoValue = '0';
    try {
      if (typeof transaction.value === 'number') {
        stoValue = formatEth(transaction.value, { includeSymbol: false });
      } else if (transaction.value?.hex) {
        const valueInWei = BigInt(transaction.value.hex);
        const valueInEth = Number(valueInWei) / 1e18;
        stoValue = valueInEth.toLocaleString(undefined, { maximumFractionDigits: 6 });
      } else if (typeof transaction.value === 'string' && transaction.value.startsWith('0x')) {
        const valueInWei = BigInt(transaction.value);
        const valueInEth = Number(valueInWei) / 1e18;
        stoValue = valueInEth.toLocaleString(undefined, { maximumFractionDigits: 6 });
      } else {
        stoValue = formatEth(transaction.value, { includeSymbol: false });
      }
    } catch (error) {
      console.error('Error formatting STO value:', error);
    }
    
    transactionTypeInfo = {
      title: 'STO Transfer',
      logoPath: '/studio-logo.png',
      description: `Transferred ${stoValue} STO`,
      tokenSymbol: 'STO',
      tokenAmount: stoValue
    };
  }
  // Check for contract interaction with decoded data
  else if (transaction.to && (transaction.data !== '0x' && transaction.data !== undefined)) {
    if (decodedData && decodedData.functionName) {
      transactionTypeInfo = {
        title: 'Contract Interaction',
        icon: '🔄', // Using emoji instead of missing image
        description: decodedData.description || `Called function ${decodedData.functionName}`,
        methodSignature: decodedData.functionSignature || transaction.data?.substring(0, 10),
        decodedFunction: decodedData.functionName,
        contractAddress: transaction.to
      };
    } else {
      transactionTypeInfo = {
        title: 'Contract Interaction',
        icon: '🔄', // Using emoji instead of missing image
        description: 'Interacted with a contract',
        methodSignature: transaction.data?.substring(0, 10),
        contractAddress: transaction.to
      };
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card mb-8"
    >
      <h2 className="text-xl font-semibold mb-4">Transaction Overview</h2>
      
      {/* Transaction Type Card */}
      <div className="bg-dark-200 p-4 rounded-lg mb-6">
        <div className="flex items-start">
          <div className="w-10 h-10 rounded-lg bg-dark-100 flex items-center justify-center mr-3 mt-1">
            {transactionTypeInfo.logoPath ? (
              <img 
                src={transactionTypeInfo.logoPath} 
                alt={transactionTypeInfo.title} 
                className="w-6 h-6 object-contain"
              />
            ) : transactionTypeInfo.useTokenLogo ? (
              <TokenLogo 
                token={{
                  address: transactionTypeInfo.tokenContract,
                  symbol: transactionTypeInfo.tokenSymbol,
                  name: transactionTypeInfo.tokenName
                }} 
                size="sm" 
              />
            ) : transactionTypeInfo.icon ? (
              <span className="text-xl">{transactionTypeInfo.icon}</span>
            ) : (
              <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-primary">{transactionTypeInfo.title}</h3>
            
            {/* Show basic info in the top card */}
            <div className="text-sm text-gray-400 mt-1">
              {transactionTypeInfo.description}
              {hasTokenTransfers && transactionTypeInfo.tokenContract && (
                <div className="mt-1">
                  <span className="text-gray-500">Token Contract:</span>{' '}
                  <Link to={`/address/${transactionTypeInfo.tokenContract}`} className="text-primary hover:underline">
                    {transactionTypeInfo.tokenContract.substring(0, 8)}...
                  </Link>
                  {transactionTypeInfo.tokenName && <span className="ml-1">({transactionTypeInfo.tokenName})</span>}
                </div>
              )}
              {transactionTypeInfo.contractAddress && !transaction.data && (
                <div className="mt-1">
                  <span className="text-gray-500">Contract Address:</span>{' '}
                  <Link to={`/address/${transactionTypeInfo.contractAddress}`} className="text-primary hover:underline">
                    {transactionTypeInfo.contractAddress}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Transaction Details Grid */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
          <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Transaction Hash:</div>
          <div className="w-full md:w-2/3 font-mono break-all">
            {transaction.hash}
            <button 
              className="ml-2 text-gray-400 hover:text-white focus:outline-none"
              onClick={() => copyToClipboard(transaction.hash)}
            >
              {copiedText === transaction.hash ? <FaCheck size={12} /> : <FaCopy size={12} />}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
          <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Status:</div>
          <div className="w-full md:w-2/3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              txStatus === 'Success' 
                ? 'bg-green-900 bg-opacity-20 text-green-400' 
                : 'bg-red-900 bg-opacity-20 text-red-400'
            }`}>
              {txStatus}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
          <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Block:</div>
          <div className="w-full md:w-2/3">
            <Link to={`/blocks/${transaction.blockNumber}`} className="text-primary hover:underline">
              {transaction.blockNumber}
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
          <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Timestamp:</div>
          <div className="w-full md:w-2/3">
            {(() => {
              try {
                // Convert timestamp to human-readable format
                const date = new Date(transaction.timestamp * 1000);
                const now = new Date();
                const diffSeconds = Math.floor((now - date) / 1000);
                
                let timeAgo;
                if (diffSeconds < 60) {
                  timeAgo = `${diffSeconds} secs ago`;
                } else if (diffSeconds < 3600) {
                  timeAgo = `${Math.floor(diffSeconds / 60)} mins ago`;
                } else if (diffSeconds < 86400) {
                  timeAgo = `${Math.floor(diffSeconds / 3600)} hours ago`;
                } else {
                  timeAgo = `${Math.floor(diffSeconds / 86400)} days ago`;
                }
                
                // Format date as "MMM-DD-YYYY hh:mm:ss AM/PM UTC"
                const formattedDate = date.toLocaleString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                  timeZone: 'UTC'
                }) + ' UTC';
                
                return `${timeAgo} (${formattedDate})`;
              } catch (error) {
                console.error('Error formatting timestamp:', error);
                return transaction.timestamp;
              }
            })()}
          </div>
        </div>
        
        {/* Transaction Addresses Section - Only show for non-token transfers */}
        {!hasTokenTransfers && (
          <>
            <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
              <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">From:</div>
              <div className="w-full md:w-2/3">
                <Link to={`/address/${transaction.from}`} className="text-primary hover:underline font-mono break-all">
                  {transaction.from}
                </Link>
                <button 
                  className="ml-2 text-gray-400 hover:text-white focus:outline-none"
                  onClick={() => copyToClipboard(transaction.from)}
                >
                  {copiedText === transaction.from ? <FaCheck size={12} /> : <FaCopy size={12} />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
              <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">
                {transaction.to && (transaction.data !== '0x' && transaction.data !== undefined) ? 'Interacted with:' : 'To:'}
              </div>
              <div className="w-full md:w-2/3">
                {transaction.to ? (
                  <>
                    <Link to={`/address/${transaction.to}`} className="text-primary hover:underline font-mono break-all">
                      {transaction.to}
                    </Link>
                    <button 
                      className="ml-2 text-gray-400 hover:text-white focus:outline-none"
                      onClick={() => copyToClipboard(transaction.to)}
                    >
                      {copiedText === transaction.to ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    </button>
                  </>
                ) : receipt?.contractAddress ? (
                  <div>
                    <span className="text-accent-purple">[Contract Creation]</span>
                    <div className="mt-1">
                      <span className="text-gray-400 text-sm">Created Contract: </span>
                      <Link to={`/address/${receipt.contractAddress}`} className="text-primary hover:underline font-mono text-sm">
                        {receipt.contractAddress}
                      </Link>
                      <button 
                        className="ml-2 text-gray-400 hover:text-white focus:outline-none"
                        onClick={() => copyToClipboard(receipt.contractAddress)}
                      >
                        {copiedText === receipt.contractAddress ? <FaCheck size={12} /> : <FaCopy size={12} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="text-accent-purple">[Contract Creation]</span>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Value field - Only show for native token transfers with non-zero value, or for non-contract interactions */}
        {!hasTokenTransfers && 
          ((transaction.value && transaction.value !== '0x0' && transaction.value !== 0) || 
          !(transaction.to && (transaction.data !== '0x' && transaction.data !== undefined))) && (
          <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
            <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Value:</div>
            <div className="w-full md:w-2/3 font-mono">
              {(() => {
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
          </div>
        )}
        
        {/* Contract Interaction Details - Only show for contract interactions */}
        {transaction.to && (transaction.data !== '0x' && transaction.data !== undefined) && !hasTokenTransfers && (
          <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
            <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Contract Interaction:</div>
            <div className="w-full md:w-2/3">
              <div className="bg-dark-100 p-3 rounded-lg">
                {decodedData && decodedData.functionName ? (
                  <>
                    <div className="mb-2">
                      <span className="text-gray-400">Function: </span>
                      <span className="text-accent-teal font-mono">{decodedData.functionName}</span>
                      {decodedData.functionSignature && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({decodedData.functionSignature})
                        </span>
                      )}
                    </div>
                    {decodedData.description && (
                      <div className="text-gray-300 mb-2 pb-2 border-b border-gray-700">
                        <span className="text-accent-purple font-medium">Description: </span>
                        {decodedData.description}
                      </div>
                    )}
                    {decodedData.params && decodedData.params.length > 0 && (
                      <div className="mt-2">
                        <div className="text-gray-400 mb-1">Parameters:</div>
                        <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 ml-2">
                          {decodedData.params.map((param, index) => (
                            <li key={index}>
                              <span className="text-gray-500">{param.name || `param${index}`} ({param.type}): </span>
                              <span className="text-accent-teal font-mono break-all">
                                {param.type === 'address' 
                                  ? <Link to={`/address/${param.value}`} className="text-primary hover:underline">
                                      {param.value.substring(0, 6)}...{param.value.substring(param.value.length - 4)}
                                    </Link>
                                  : String(param.value)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    {(() => {
                      // Try to decode common method signatures
                      const methodSignature = transaction.data?.substring(0, 10);
                      
                      // Common ERC20 method signatures
                      const knownMethods = {
                        '0x095ea7b3': {
                          name: 'approve',
                          signature: 'approve(address,uint256)',
                          description: 'Approve an address to spend tokens on your behalf'
                        },
                        '0xa9059cbb': {
                          name: 'transfer',
                          signature: 'transfer(address,uint256)',
                          description: 'Transfer tokens to another address'
                        },
                        '0x23b872dd': {
                          name: 'transferFrom',
                          signature: 'transferFrom(address,address,uint256)',
                          description: 'Transfer tokens from one address to another'
                        },
                        '0x70a08231': {
                          name: 'balanceOf',
                          signature: 'balanceOf(address)',
                          description: 'Get the token balance of an address'
                        },
                        '0x18160ddd': {
                          name: 'totalSupply',
                          signature: 'totalSupply()',
                          description: 'Get the total token supply'
                        },
                        '0x40c10f19': {
                          name: 'mint',
                          signature: 'mint(address,uint256)',
                          description: 'Mint new tokens to an address'
                        },
                        '0x42966c68': {
                          name: 'burn',
                          signature: 'burn(uint256)',
                          description: 'Burn tokens'
                        },
                        '0x94562944': {
                          name: 'withdraw',
                          signature: 'withdraw(uint256,address,uint256,uint256,bytes)',
                          description: 'Withdraw tokens from the contract'
                        }
                      };
                      
                      if (methodSignature && knownMethods[methodSignature]) {
                        const method = knownMethods[methodSignature];
                        
                        // Try to extract parameters for common functions
                        let extractedParams = null;
                        
                        if (methodSignature === '0x095ea7b3' && transaction.data.length >= 138) {
                          // For approve(address,uint256)
                          try {
                            // Extract the spender address from the data
                            // Format: 0x + method signature (8 chars) + address padded with zeros (64 chars)
                            const addressHex = '0x' + transaction.data.substring(34, 74).replace(/^0+/, '');
                            
                            // Extract the amount from the data
                            // Format: address + amount (64 chars)
                            const amountHex = '0x' + transaction.data.substring(74, 138);
                            const amountBigInt = BigInt(amountHex);
                            
                            extractedParams = {
                              spender: addressHex,
                              amount: amountBigInt.toString()
                            };
                          } catch (error) {
                            console.error('Error extracting approve parameters:', error);
                          }
                        }
                        
                        return (
                          <>
                            <div className="mb-2">
                              <span className="text-gray-400">Function: </span>
                              <span className="text-accent-teal font-mono">{method.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({method.signature})
                              </span>
                            </div>
                            <div className="text-gray-300 mb-2 pb-2 border-b border-gray-700">
                              <span className="text-accent-purple font-medium">Description: </span>
                              {method.description}
                            </div>
                            
                            {/* Show extracted parameters if available */}
                            {extractedParams && methodSignature === '0x095ea7b3' && (
                              <div className="mt-2 mb-3">
                                <div className="text-gray-400 mb-1">Parameters:</div>
                                <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 ml-2">
                                  <li>
                                    <span className="text-gray-500">spender (address): </span>
                                    <Link to={`/address/${extractedParams.spender}`} className="text-primary hover:underline">
                                      {extractedParams.spender.substring(0, 6)}...{extractedParams.spender.substring(extractedParams.spender.length - 4)}
                                    </Link>
                                  </li>
                                  <li>
                                    <span className="text-gray-500">amount (uint256): </span>
                                    <span className="text-accent-teal font-mono break-all">
                                      {extractedParams.amount}
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500 mt-1">
                              Note: This function was decoded using a local signature database.
                              {!extractedParams && " Parameter values could not be decoded."}
                            </div>
                          </>
                        );
                      }
                      
                      // If we couldn't decode it, show the raw method signature
                      return (
                        <>
                          <span className="text-gray-400">Method Signature: </span>
                          <span className="text-accent-teal font-mono">{methodSignature}</span>
                          <div className="mt-2 text-gray-300">
                            This contract interaction could not be fully decoded. The raw method signature is shown above.
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
                
                <div className="mt-3 pt-2 border-t border-gray-700">
                  <Link to={`/address/${transaction.to}`} className="text-primary hover:underline">
                    {contractName || 'Contract'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Token Transfers Summary - Only show for ERC20 token transfers */}
        {hasTokenTransfers && (
          <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
            <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Token Transfers:</div>
            <div className="w-full md:w-2/3">
              <div className="bg-dark-100 p-3 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">
                  {transaction.tokenTransfers && transaction.tokenTransfers.length > 1 
                    ? "This transaction contains multiple token transfers:"
                    : "Token transfer details:"}
                </p>
                
                <ul className="list-disc list-inside text-sm text-gray-400 space-y-3">
                  {(transaction.tokenTransfers || (tokenInfo && tokenInfo.transfers) || []).map((transfer, index) => (
                    <li key={index} className={index > 0 ? "pt-2 border-t border-gray-700" : ""}>
                      <div>
                        <span className="text-gray-300">
                          Function{' '}
                          <span className="text-accent-teal font-mono">
                            {decodedData ? decodedData.functionName : 'Transfer'}
                          </span>:
                        </span>
                      </div>
                      <div className="ml-4 mt-1">
                        <span className="text-accent-teal">{transfer.amount} {transfer.symbol}</span> from{' '}
                        <Link to={`/address/${transfer.from}`} className="text-primary hover:underline">
                          {transfer.from.substring(0, 6)}...{transfer.from.substring(transfer.from.length - 4)}
                        </Link>{' '}
                        to{' '}
                        <Link to={`/address/${transfer.to}`} className="text-primary hover:underline">
                          {transfer.to.substring(0, 6)}...{transfer.to.substring(transfer.to.length - 4)}
                        </Link>
                        {index === 0 && transaction.tokenTransfers && transaction.tokenTransfers.length > 1 
                          ? " (Primary Transfer)" 
                          : index > 0 ? " (Secondary Transfer)" : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
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
        
        <div className="flex flex-col md:flex-row py-3 border-b border-gray-800">
          <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">Nonce:</div>
          <div className="w-full md:w-2/3 font-mono">{transaction.nonce || 'N/A'}</div>
        </div>
      </div>
      
      {/* AI-Optimized Transaction Explanation (only if gas price is 0) */}
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
                This transaction received priority processing through Studio Blockchain's on-chain neural networks.
                The AI analyzed the transaction and assigned it high priority in the blockchain's priority system,
                allowing it to be processed efficiently with optimized gas fees. This advanced AI-driven approach
                makes blockchain interactions more accessible and cost-effective.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TransactionOverviewTab;
