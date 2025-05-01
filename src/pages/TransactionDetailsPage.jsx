import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { formatDecodedTransaction } from '../services/transactionDecoderService';
import { formatTokenValue } from '../utils/formatters';
import TransactionOverviewTab from '../components/transactions/details/TransactionOverviewTab';
import TransactionTokenTransfersTab from '../components/transactions/details/TransactionTokenTransfersTab';
import TransactionLogsTab from '../components/transactions/details/TransactionLogsTab';
import TransactionDataTab from '../components/transactions/details/TransactionDataTab';

/**
 * Page component for displaying transaction details
 */
const TransactionDetailsPage = () => {
  const { hash } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedText, setCopiedText] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [decodedData, setDecodedData] = useState(null);
  
  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    });
  };
  
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch transaction and receipt in parallel
        const [txData, receiptData] = await Promise.all([
          apiService.getTransactionByHash(hash),
          apiService.getTransactionReceipt(hash)
        ]);
        
        // After the main data is loaded, try to fetch the decoded data separately
        // This way, if the decoded data fetch fails, it won't affect the main page load
        try {
          const decodedTxData = await apiService.getDecodedTransaction(hash);
          if (decodedTxData) {
            console.log('Decoded transaction data:', decodedTxData);
            // Check if the decoded data is in the expected format
            if (decodedTxData.decoded) {
              // The API returns the decoded data in a nested 'decoded' property
              const formattedData = {
                functionName: decodedTxData.decoded.functionName,
                functionSignature: decodedTxData.decoded.functionSignature,
                params: decodedTxData.decoded.params,
                description: decodedTxData.description // Description is at the top level
              };
              setDecodedData(formattedData);
            } else {
              // Fallback to the old format
              setDecodedData(formatDecodedTransaction(decodedTxData));
            }
          }
        } catch (err) {
          console.warn('Failed to fetch decoded transaction data:', err);
          // Don't set error state here, just continue without decoded data
        }
        
        console.log('Transaction data:', txData);
        console.log('Receipt data:', receiptData);
        
        setTransaction(txData);
        setReceipt(receiptData);
        
        // Use tokenTransfers from the API if available
        if (txData.tokenTransfers && txData.tokenTransfers.length > 0) {
          // Create tokenInfo from the first token transfer
          const firstTransfer = txData.tokenTransfers[0];
          setTokenInfo({
            address: firstTransfer.tokenAddress,
            name: firstTransfer.name || 'Unknown Token',
            symbol: firstTransfer.symbol || 'TOKEN',
            decimals: firstTransfer.decimals || 18,
            transfers: txData.tokenTransfers.map(transfer => ({
              from: transfer.from,
              to: transfer.to,
              amount: transfer.amount,
              rawAmount: transfer.rawAmount,
              tokenAddress: transfer.tokenAddress,
              timestamp: txData.timestamp
            }))
          });
        }
        // Fallback to the old method if tokenTransfers is not available
        else {
          // Check if this is a token transfer (handle both data and input field names)
          const inputData = txData.data || txData.input;
          if (inputData?.startsWith('0xa9059cbb') && receiptData?.logs?.length > 0) {
            const transferLog = receiptData.logs.find(log => 
              log.topics?.[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
            );
            
            if (transferLog) {
              try {
                // Get token contract address
                const tokenAddress = transferLog.address;
                
                // Try to get token information from the API
                try {
                  // Fetch token contract details
                  const contractResponse = await apiService.getAddressType(tokenAddress);
                  const contractType = contractResponse?.type || 'unknown';
                  
                  let name = 'Unknown Token';
                  let symbol = 'TOKEN';
                  let decimals = 18;
                  
                  // If it's a contract, try to get token details
                  if (contractType === 'contract') {
                    try {
                      // Call contract methods to get token details
                      const nameResponse = await apiService.callContractMethod(tokenAddress, '0x06fdde03'); // name()
                      const symbolResponse = await apiService.callContractMethod(tokenAddress, '0x95d89b41'); // symbol()
                      const decimalsResponse = await apiService.callContractMethod(tokenAddress, '0x313ce567'); // decimals()
                      
                      if (nameResponse) {
                        name = nameResponse;
                      }
                      
                      if (symbolResponse) {
                        symbol = symbolResponse;
                      }
                      
                      if (decimalsResponse) {
                        decimals = parseInt(decimalsResponse);
                      }
                    } catch (error) {
                      console.error('Error fetching token details:', error);
                    }
                  }
                  
                  const tokenInfo = {
                    address: tokenAddress,
                    name,
                    symbol,
                    decimals,
                    transfers: []
                  };
                  
                  // Extract transfer details from the log
                  if (transferLog.topics?.length >= 3) {
                    const from = '0x' + transferLog.topics[1].substring(26);
                    const to = '0x' + transferLog.topics[2].substring(26);
                    
                    let amount = '0';
                    if (transferLog.data && transferLog.data !== '0x') {
                      try {
                        const amountHex = transferLog.data;
                        const amountBigInt = BigInt(amountHex);
                        amount = amountBigInt.toString();
                        
                        // Format amount based on token decimals using the proper formatter
                        const formattedAmount = formatTokenValue(amount, decimals, { maxDecimals: 8 });
                        
                        tokenInfo.transfers.push({
                          from,
                          to,
                          amount: formattedAmount,
                          rawAmount: amount,
                          tokenAddress,
                          timestamp: txData.timestamp
                        });
                      } catch (error) {
                        console.error('Error parsing token amount:', error);
                      }
                    }
                  }
                  
                  setTokenInfo(tokenInfo);
                } catch (error) {
                  console.error('Error fetching token info:', error);
                  
                  // Fallback to basic token info
                  const tokenInfo = {
                    address: tokenAddress,
                    name: 'Unknown Token',
                    symbol: 'TOKEN',
                    decimals: 18,
                    transfers: []
                  };
                  
                  // Extract transfer details from the log
                  if (transferLog.topics?.length >= 3) {
                    const from = '0x' + transferLog.topics[1].substring(26);
                    const to = '0x' + transferLog.topics[2].substring(26);
                    
                    let amount = '0';
                    if (transferLog.data && transferLog.data !== '0x') {
                      try {
                        const amountHex = transferLog.data;
                        const amountBigInt = BigInt(amountHex);
                        amount = amountBigInt.toString();
                      } catch (error) {
                        console.error('Error parsing token amount:', error);
                      }
                    }
                    
                    tokenInfo.transfers.push({
                      from,
                      to,
                      amount,
                      tokenAddress,
                      timestamp: txData.timestamp
                    });
                  }
                  
                  setTokenInfo(tokenInfo);
                }
              } catch (error) {
                console.error('Error processing token transfer:', error);
              }
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        setError('Failed to load transaction details. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchTransactionDetails();
  }, [hash]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/transactions" className="text-primary hover:underline">
          Back to Transactions
        </Link>
      </div>
    );
  }
  
  if (!transaction) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4">Transaction not found</div>
        <Link to="/transactions" className="text-primary hover:underline">
          Back to Transactions
        </Link>
      </div>
    );
  }
  
  // Determine transaction status - use transaction.status if available, otherwise use receipt.status
  const txStatus = transaction.status === true || receipt?.status === '0x1' ? 'Success' : 'Failed';
  
  // Check if this transaction has token transfers
  const hasTokenTransfers = (tokenInfo && tokenInfo.transfers && tokenInfo.transfers.length > 0) || 
                           (transaction.tokenTransfers && transaction.tokenTransfers.length > 0);
  
  return (
    <div className="transaction-details-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Transaction Details</h1>
            <p className="text-gray-400 mt-1 font-mono text-sm truncate max-w-[300px] md:max-w-[500px]">
              {transaction.hash}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              txStatus === 'Success' 
                ? 'bg-green-900 bg-opacity-20 text-green-400' 
                : 'bg-red-900 bg-opacity-20 text-red-400'
            }`}>
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                {txStatus === 'Success' ? (
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                )}
              </svg>
              {txStatus}
            </span>
          </div>
        </div>
      </motion.div>
      
      {/* Transaction Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap border-b border-gray-700">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'overview' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'logs' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('logs')}
          >
            Logs
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'data' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('data')}
          >
            Input Data
          </button>
        </div>
      </div>
      
      {/* Render the active tab */}
      {activeTab === 'overview' && (
        <TransactionOverviewTab 
          transaction={transaction}
          receipt={receipt}
          txStatus={txStatus}
          hasTokenTransfers={hasTokenTransfers}
          tokenInfo={tokenInfo}
          decodedData={decodedData}
          copiedText={copiedText}
          copyToClipboard={copyToClipboard}
        />
      )}
      
      {/* Token Transfers tab removed - now integrated into Overview tab */}
      
      {activeTab === 'logs' && (
        <TransactionLogsTab 
          receipt={receipt}
        />
      )}
      
      {activeTab === 'data' && (
        <TransactionDataTab 
          transaction={transaction}
          decodedData={decodedData}
          copiedText={copiedText}
          copyToClipboard={copyToClipboard}
        />
      )}
    </div>
  );
};

export default TransactionDetailsPage;
