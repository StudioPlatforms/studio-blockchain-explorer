import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { shortenAddress, formatTimestamp, formatTokenValue } from '../../utils/formatters';
import { FaCoins, FaArrowRight, FaCopy, FaCheck } from 'react-icons/fa';
import TokenLogo from '../common/TokenLogo';

const AddressTokensTab = ({ 
  tokenTransfers, 
  copyToClipboard, 
  copiedText 
}) => {
  // Get the current address from URL params
  const { address } = useParams();
  
  // Filter token transfers to only show those involving the current address
  const filteredTransfers = address && tokenTransfers ? tokenTransfers.filter(transfer => 
    transfer.from?.toLowerCase() === address.toLowerCase() || 
    transfer.to?.toLowerCase() === address.toLowerCase()
  ) : tokenTransfers;
  
  // Check if we're viewing token transfers for a token contract
  const isTokenContract = tokenTransfers && tokenTransfers.length > 0 && (
    (tokenTransfers[0].tokenAddress && tokenTransfers[0].from && tokenTransfers[0].tokenAddress === tokenTransfers[0].from) || 
    (tokenTransfers[0].tokenAddress && tokenTransfers[0].to && tokenTransfers[0].tokenAddress === tokenTransfers[0].to)
  );
  
  // Get token info from the first transfer
  const tokenInfo = tokenTransfers && tokenTransfers.length > 0 && tokenTransfers[0].tokenAddress ? {
    address: tokenTransfers[0].tokenAddress,
    symbol: tokenTransfers[0].tokenSymbol || 'Unknown',
    name: tokenTransfers[0].tokenName || 'Unknown Token',
    decimals: tokenTransfers[0].decimals || 18
  } : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card mb-8"
    >
      <h2 className="text-xl font-semibold mb-4">
        {isTokenContract && tokenInfo 
          ? `${tokenInfo.name} (${tokenInfo.symbol}) Transfers` 
          : 'Token Transfers'}
      </h2>
      
      {filteredTransfers && filteredTransfers.length > 0 ? (
        <div className="space-y-4">
          {filteredTransfers.map((transfer, index) => (
            <div key={index} className="bg-dark-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <TokenLogo 
                  token={{
                    address: transfer.tokenAddress,
                    symbol: transfer.tokenSymbol,
                    name: transfer.tokenName
                  }} 
                  size="md" 
                  className="mr-3"
                />
                <div>
                  <h3 className="font-medium">
                    <Link to={`/address/${transfer.tokenAddress}`} className="text-primary hover:underline">
                      {transfer.tokenSymbol || 'Unknown Token'}
                    </Link>
                    {transfer.tokenName && <span className="text-sm text-gray-400 ml-2">({transfer.tokenName})</span>}
                  </h3>
                  <p className="text-sm text-gray-400 font-mono">
                    {shortenAddress(transfer.tokenAddress)}
                    <button 
                      className="ml-1 text-gray-400 hover:text-white focus:outline-none"
                      onClick={() => copyToClipboard(transfer.tokenAddress)}
                    >
                      {copiedText === transfer.tokenAddress ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    </button>
                  </p>
                </div>
              </div>
              
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between text-sm">
                    <div className="mb-2 md:mb-0">
                      <span className="text-gray-400 mr-2">Amount:</span>
                      <span className="font-mono">
                        {formatTokenValue(transfer.value, transfer.decimals || 18)} {transfer.tokenSymbol}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 mr-2">Transaction:</span>
                      <Link to={`/transactions/${transfer.hash}`} className="text-primary hover:underline font-mono">
                        {shortenAddress(transfer.hash)}
                      </Link>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {formatTimestamp(transfer.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          No token transfers found for this address
        </div>
      )}
    </motion.div>
  );
};

export default AddressTokensTab;
