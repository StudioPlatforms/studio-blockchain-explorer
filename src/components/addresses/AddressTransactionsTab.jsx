import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatEth, formatTimestamp } from '../../utils/formatters';

const AddressTransactionsTab = ({ 
  transactions, 
  address, 
  currentPage, 
  itemsPerPage, 
  handlePageChange, 
  handleItemsPerPageChange 
}) => {
  // Helper function to truncate hash
  const truncateHash = (hash, length = 8) => {
    if (!hash) return '';
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card mb-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-4 md:mb-0">Transactions</h2>
        
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Show</span>
          <select
            className="bg-dark-200 border border-gray-700 rounded px-2 py-1 text-white"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-gray-400 ml-2">entries</span>
        </div>
      </div>
      
      {transactions.length > 0 ? (
        <div>
          {/* Table for desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-400 font-medium">Txn Hash</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Function</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Block</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Age</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">From</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">To</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.hash} className="border-b border-gray-800 hover:bg-dark-100">
                    <td className="py-3 px-4">
                      <Link to={`/transactions/${tx.hash}`} className="text-primary hover:underline font-mono text-sm">
                        {truncateHash(tx.hash)}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      {(() => {
                        // Determine transaction type and function name
                        if (!tx.to) {
                          return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-900 bg-opacity-20 text-purple-400">contract creation</span>;
                        } else if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
                          return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-900 bg-opacity-20 text-teal-400">transfer</span>;
                        } else if (tx.data && tx.data !== '0x' && tx.data.length > 2) {
                          // Try to decode common method signatures
                          const methodSignature = tx.data.substring(0, 10);
                          
                          // Common ERC20 method signatures
                          const knownMethods = {
                            '0x095ea7b3': 'approve',
                            '0xa9059cbb': 'transfer',
                            '0x23b872dd': 'transferFrom',
                            '0x70a08231': 'balanceOf',
                            '0x18160ddd': 'totalSupply',
                            '0x40c10f19': 'mint',
                            '0x42966c68': 'burn',
                            '0x94562944': 'withdraw'
                          };
                          
                          if (methodSignature && knownMethods[methodSignature]) {
                            return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-900 bg-opacity-20 text-teal-400">{knownMethods[methodSignature]}</span>;
                          }
                          
                          return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-900 bg-opacity-20 text-teal-400">contract call</span>;
                        } else if (tx.value && tx.value !== '0x0' && tx.value !== 0) {
                          return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary bg-opacity-20 text-primary">transfer</span>;
                        } else {
                          return <span className="text-gray-400 text-xs">-</span>;
                        }
                      })()}
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/blocks/${tx.blockNumber}`} className="text-primary hover:underline">
                        {tx.blockNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{formatTimestamp(tx.timestamp)}</td>
                    <td className="py-3 px-4">
                      {tx.from === address ? (
                        <span className="font-mono text-sm text-gray-300">
                          {truncateHash(tx.from, 6)}
                        </span>
                      ) : (
                        <Link to={`/address/${tx.from}`} className="text-primary hover:underline font-mono text-sm">
                          {truncateHash(tx.from, 6)}
                        </Link>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {tx.to === address ? (
                        <span className="font-mono text-sm text-gray-300">
                          {truncateHash(tx.to, 6)}
                        </span>
                      ) : (
                        <Link to={`/address/${tx.to}`} className="text-primary hover:underline font-mono text-sm">
                          {truncateHash(tx.to, 6)}
                        </Link>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-mono">
                      {(() => {
                        try {
                          // Ensure proper formatting for STO values
                          return formatEth(tx.value, { maxDecimals: 6 });
                        } catch (error) {
                          console.error('Error formatting STO value:', error);
                          return formatEth(0);
                        }
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Card layout for mobile view */}
          <div className="md:hidden space-y-4">
            {transactions.map((tx) => (
              <div key={tx.hash} className="bg-dark-200 p-3 rounded-lg">
                {/* Transaction hash and function */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <Link to={`/transactions/${tx.hash}`} className="text-primary hover:underline font-mono text-xs block truncate">
                      {truncateHash(tx.hash)}
                    </Link>
                  </div>
                  <div className="ml-2">
                    {(() => {
                      // Determine transaction type and function name
                      if (!tx.to) {
                        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-900 bg-opacity-20 text-purple-400">contract creation</span>;
                      } else if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
                        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-900 bg-opacity-20 text-teal-400">transfer</span>;
                      } else if (tx.data && tx.data !== '0x' && tx.data.length > 2) {
                        // Try to decode common method signatures
                        const methodSignature = tx.data.substring(0, 10);
                        
                        // Common ERC20 method signatures
                        const knownMethods = {
                          '0x095ea7b3': 'approve',
                          '0xa9059cbb': 'transfer',
                          '0x23b872dd': 'transferFrom',
                          '0x70a08231': 'balanceOf',
                          '0x18160ddd': 'totalSupply',
                          '0x40c10f19': 'mint',
                          '0x42966c68': 'burn',
                          '0x94562944': 'withdraw'
                        };
                        
                        if (methodSignature && knownMethods[methodSignature]) {
                          return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-900 bg-opacity-20 text-teal-400">{knownMethods[methodSignature]}</span>;
                        }
                        
                        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-900 bg-opacity-20 text-teal-400">contract call</span>;
                      } else if (tx.value && tx.value !== '0x0' && tx.value !== 0) {
                        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary bg-opacity-20 text-primary">transfer</span>;
                      } else {
                        return <span className="text-gray-400 text-xs">-</span>;
                      }
                    })()}
                  </div>
                </div>
                
                {/* Block and age */}
                <div className="flex justify-between items-center mb-2 text-xs">
                  <div>
                    <span className="text-gray-400">Block: </span>
                    <Link to={`/blocks/${tx.blockNumber}`} className="text-primary hover:underline">
                      {tx.blockNumber}
                    </Link>
                  </div>
                  <div className="text-gray-300">{formatTimestamp(tx.timestamp)}</div>
                </div>
                
                {/* From and To */}
                <div className="grid grid-cols-1 gap-1 text-xs mb-2">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1.5 w-10 flex-shrink-0">From:</span>
                    {tx.from === address ? (
                      <span className="font-mono text-gray-300 truncate">
                        {truncateHash(tx.from, 6)}
                      </span>
                    ) : (
                      <Link to={`/address/${tx.from}`} className="text-primary hover:underline font-mono truncate">
                        {truncateHash(tx.from, 6)}
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1.5 w-10 flex-shrink-0">To:</span>
                    {tx.to === address ? (
                      <span className="font-mono text-gray-300 truncate">
                        {truncateHash(tx.to, 6)}
                      </span>
                    ) : (
                      <Link to={`/address/${tx.to}`} className="text-primary hover:underline font-mono truncate">
                        {truncateHash(tx.to, 6)}
                      </Link>
                    )}
                  </div>
                </div>
                
                {/* Value */}
                <div className="text-right text-xs text-gray-300 font-mono">
                  {(() => {
                    try {
                      // Ensure proper formatting for STO values
                      return formatEth(tx.value, { maxDecimals: 6 });
                    } catch (error) {
                      console.error('Error formatting STO value:', error);
                      return formatEth(0);
                    }
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          No transactions found for this address
        </div>
      )}
      
      {/* Pagination */}
      {transactions.length > 0 && (
        <div className="flex items-center justify-center mt-6">
          <button
            className="px-3 py-1 mx-1 rounded bg-dark-100 text-gray-300 hover:bg-dark-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <span className="mx-2 text-gray-400">
            Page {currentPage}
          </span>
          
          <button
            className="px-3 py-1 mx-1 rounded bg-dark-100 text-gray-300 hover:bg-dark-200"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default AddressTransactionsTab;
