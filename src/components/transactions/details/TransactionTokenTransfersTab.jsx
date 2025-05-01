import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCoins, FaCopy, FaCheck, FaArrowRight } from 'react-icons/fa';
import { shortenAddress } from '../../../utils/formatters';

/**
 * Component for displaying token transfers tab
 */
const TransactionTokenTransfersTab = ({ transaction, tokenInfo, copiedText, copyToClipboard }) => {
  // Determine which token transfers to display
  const transfers = transaction.tokenTransfers || (tokenInfo && tokenInfo.transfers) || [];
  
  // If no transfers, return null
  if (transfers.length === 0) {
    return null;
  }
  
  // Get token info from the first transfer if available
  const tokenAddress = transfers[0].tokenAddress;
  const tokenName = transfers[0].name || tokenInfo?.name || 'Unknown Token';
  const tokenSymbol = transfers[0].symbol || tokenInfo?.symbol || 'TOKEN';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card mb-8"
    >
      <h2 className="text-xl font-semibold mb-4">Token Transfers</h2>
      
      <div className="bg-dark-200 p-4 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-lg bg-dark-100 flex items-center justify-center mr-3">
            <FaCoins className="text-accent-teal" />
          </div>
          <div>
            <h3 className="font-medium">
              <Link to={`/address/${tokenAddress}`} className="text-primary hover:underline">
                {tokenName} ({tokenSymbol})
              </Link>
            </h3>
            <p className="text-sm text-gray-400 font-mono">
              {tokenAddress}
              <button 
                className="ml-2 text-gray-400 hover:text-white focus:outline-none"
                onClick={() => copyToClipboard(tokenAddress)}
              >
                {copiedText === tokenAddress ? <FaCheck size={12} /> : <FaCopy size={12} />}
              </button>
            </p>
          </div>
        </div>
        
        {transfers.map((transfer, index) => (
          <div key={index} className={index > 0 ? "border-t border-gray-800 pt-4 mt-4" : ""}>
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                <FaArrowRight className="text-primary" />
              </div>
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                  <div className="mb-2 md:mb-0">
                    <span className="text-gray-400 mr-2">From:</span>
                    <Link to={`/address/${transfer.from}`} className="text-primary hover:underline font-mono">
                      {shortenAddress(transfer.from)}
                    </Link>
                    <button 
                      className="ml-1 text-gray-400 hover:text-white focus:outline-none"
                      onClick={() => copyToClipboard(transfer.from)}
                    >
                      {copiedText === transfer.from ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    </button>
                  </div>
                  <div>
                    <span className="text-gray-400 mr-2">To:</span>
                    <Link to={`/address/${transfer.to}`} className="text-primary hover:underline font-mono">
                      {shortenAddress(transfer.to)}
                    </Link>
                    <button 
                      className="ml-1 text-gray-400 hover:text-white focus:outline-none"
                      onClick={() => copyToClipboard(transfer.to)}
                    >
                      {copiedText === transfer.to ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  <span className="text-gray-400 mr-2">Amount:</span>
                  {transfer.amount} {tokenSymbol}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TransactionTokenTransfersTab;
