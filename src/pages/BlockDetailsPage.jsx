import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { formatEth } from '../utils/formatters';

const BlockDetailsPage = () => {
  const { blockNumber } = useParams();
  console.log('Block number from params:', blockNumber);
  const [block, setBlock] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBlockDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching block details for block number:', blockNumber);
        const data = await apiService.getBlockByNumber(blockNumber);
        console.log('Block data received:', data);
        
        if (!data) {
          throw new Error('Block data is empty or null');
        }
        
        setBlock(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching block details:', error);
        setError(`Failed to load block details: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    
    if (blockNumber) {
      fetchBlockDetails();
    } else {
      setError('Invalid block number');
      setIsLoading(false);
    }
  }, [blockNumber]);
  
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
        <Link to="/blocks" className="text-primary hover:underline">
          Back to Blocks
        </Link>
      </div>
    );
  }
  
  if (!block) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4">Block not found</div>
        <Link to="/blocks" className="text-primary hover:underline">
          Back to Blocks
        </Link>
      </div>
    );
  }
  
  return (
    <div className="block-details-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Block #{block.number || 'Unknown'}</h1>
            <p className="text-gray-400 mt-1">
              {(() => {
                try {
                  if (block.aiOptimized) {
                    return (
                      <span className="inline-flex items-center mr-2 px-2 py-1 rounded-full text-xs font-medium bg-accent-teal bg-opacity-20 text-accent-teal">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        AI Optimized
                      </span>
                    );
                  }
                } catch (error) {
                  console.error('Error rendering AI optimized badge:', error);
                }
                return null;
              })()}
              <span>{block.timestamp || 'Unknown time'}</span>
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            {block.number && Number(block.number) > 0 ? (
              <Link
                to={`/blocks/${Number(block.number) - 1}`}
                className="px-3 py-1 rounded bg-dark-100 text-gray-300 hover:bg-dark-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Block
              </Link>
            ) : (
              <button
                disabled
                className="px-3 py-1 rounded bg-dark-100 text-gray-500 flex items-center opacity-50 cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Block
              </button>
            )}
            
            {block.number !== undefined ? (
              <Link
                to={`/blocks/${Number(block.number) + 1}`}
                className="px-3 py-1 rounded bg-dark-100 text-gray-300 hover:bg-dark-200 flex items-center"
              >
                Next Block
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <button
                disabled
                className="px-3 py-1 rounded bg-dark-100 text-gray-500 flex items-center opacity-50 cursor-not-allowed"
              >
                Next Block
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Block Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Block Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Block Height:</span>
              <span className="font-mono">{block.number || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Timestamp:</span>
              <span className="font-mono">{block.timestamp || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Transactions:</span>
              <span className="font-mono">
                {(() => {
                  if (Array.isArray(block.transactions)) {
                    return block.transactions.length;
                  } else if (typeof block.transactions === 'number') {
                    return block.transactions;
                  } else {
                    return '0';
                  }
                })()}
              </span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Mined by:</span>
              {block.miner ? (
                <Link to={`/address/${block.miner}`} className="font-mono text-primary hover:underline truncate max-w-[250px]">
                  {block.miner}
                </Link>
              ) : (
                <span className="font-mono">N/A</span>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Block Hash:</span>
              <span className="font-mono truncate max-w-[250px]">{block.hash || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Gas Used:</span>
              <span className="font-mono">
                {block.gasUsed || '0'} 
                {block.gasUsed && block.gasLimit ? (
                  ` (${(() => {
                    try {
                      const gasUsed = typeof block.gasUsed === 'string' ? 
                        parseInt(block.gasUsed.replace(/,/g, '')) : 
                        block.gasUsed;
                      const gasLimit = typeof block.gasLimit === 'string' ? 
                        parseInt(block.gasLimit.replace(/,/g, '')) : 
                        block.gasLimit;
                      return ((gasUsed / gasLimit) * 100).toFixed(2);
                    } catch (error) {
                      console.error('Error calculating gas percentage:', error);
                      return '0.00';
                    }
                  })()}%)`
                ) : ''}
              </span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Gas Limit:</span>
              <span className="font-mono">{block.gasLimit || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Block Reward:</span>
              <span className="font-mono">{block.reward || 'N/A'}</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* AI Optimization Details (only if AI optimized) */}
      {(() => {
        try {
          if (block.aiOptimized) {
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card mb-8"
              >
                <h2 className="text-xl font-semibold mb-4">AI Optimization Details</h2>
                <div className="bg-dark-200 p-4 rounded-lg">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent-teal bg-opacity-20 flex items-center justify-center mr-3 mt-1">
                      <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Neural Network Optimization</h3>
                      <p className="text-gray-300 text-sm">
                        This block was optimized by Studio Blockchain's on-chain neural network. The AI analyzed transaction patterns
                        and network conditions to determine the optimal block structure, resulting in improved efficiency and reduced gas costs.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-dark-100 p-3 rounded-lg">
                      <h4 className="text-gray-400 text-sm mb-1">Gas Savings</h4>
                      <p className="text-2xl font-mono text-accent-teal">98.7%</p>
                      <p className="text-xs text-gray-500 mt-1">Compared to traditional processing</p>
                    </div>
                    
                    <div className="bg-dark-100 p-3 rounded-lg">
                      <h4 className="text-gray-400 text-sm mb-1">Transaction Throughput</h4>
                      <p className="text-2xl font-mono text-accent-purple">+42%</p>
                      <p className="text-xs text-gray-500 mt-1">Increased capacity</p>
                    </div>
                    
                    <div className="bg-dark-100 p-3 rounded-lg">
                      <h4 className="text-gray-400 text-sm mb-1">Prediction Accuracy</h4>
                      <p className="text-2xl font-mono text-primary">99.2%</p>
                      <p className="text-xs text-gray-500 mt-1">Block height prediction</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          }
          return null;
        } catch (error) {
          console.error('Error rendering AI optimization details:', error);
          return null;
        }
      })()}
      
      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card"
      >
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>
        
        {(() => {
          try {
            // Check if transactions is an array
            if (Array.isArray(block.transactions) && block.transactions.length > 0) {
              return (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-700">
                        <th className="py-3 px-4 text-gray-400 font-medium">Txn Hash</th>
                        <th className="py-3 px-4 text-gray-400 font-medium">From</th>
                        <th className="py-3 px-4 text-gray-400 font-medium">To</th>
                        <th className="py-3 px-4 text-gray-400 font-medium">Value</th>
                        <th className="py-3 px-4 text-gray-400 font-medium">Gas Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {block.transactions.map((tx, index) => (
                        <tr key={tx.hash || index} className="border-b border-gray-800 hover:bg-dark-100">
                          <td className="py-3 px-4">
                            {tx.hash ? (
                              <Link to={`/transactions/${tx.hash}`} className="text-primary hover:underline font-mono text-sm truncate block max-w-[150px]">
                                {tx.hash}
                              </Link>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {tx.from ? (
                              <Link to={`/address/${tx.from}`} className="text-primary hover:underline font-mono text-sm truncate block max-w-[120px]">
                                {tx.from}
                              </Link>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {tx.to ? (
                              <Link to={`/address/${tx.to}`} className="text-primary hover:underline font-mono text-sm truncate block max-w-[120px]">
                                {tx.to}
                              </Link>
                            ) : (
                              <span className="text-accent-purple">[Contract Creation]</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-300 font-mono text-sm">
                            {formatEth(tx.value)}
                          </td>
                          <td className="py-3 px-4 text-gray-300 font-mono text-sm">
                            {tx.gasUsed || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            } 
            // Check if transactions is a number (count only)
            else if (typeof block.transactions === 'number') {
              return (
                <div className="text-center py-10 text-gray-400">
                  This block contains {block.transactions} transactions, but detailed transaction data is not available.
                </div>
              );
            }
            // No transactions
            else {
              return (
                <div className="text-center py-10 text-gray-400">
                  No transactions in this block
                </div>
              );
            }
          } catch (error) {
            console.error('Error rendering transactions:', error);
            return (
              <div className="text-center py-10 text-red-400">
                Error displaying transactions: {error.message}
              </div>
            );
          }
        })()}
      </motion.div>
    </div>
  );
};

export default BlockDetailsPage;
