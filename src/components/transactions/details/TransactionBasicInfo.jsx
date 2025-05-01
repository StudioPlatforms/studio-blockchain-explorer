import React from 'react';
import { Link } from 'react-router-dom';
import { FaCopy, FaCheck } from 'react-icons/fa';

/**
 * Component for displaying basic transaction information
 */
const TransactionBasicInfo = ({ transaction, receipt, txStatus, copiedText, copyToClipboard }) => {
  return (
    <div className="space-y-3">
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
          <div className="flex items-center">
            <Link to={`/blocks/${transaction.blockNumber}`} className="text-primary hover:underline">
              {transaction.blockNumber}
            </Link>
            {(() => {
              // Calculate confirmations
              try {
                // We'll use a hardcoded latest block number for now
                // In a real implementation, this would come from a context or state
                const latestBlockNumber = 69418; // This should be fetched from API
                if (transaction.blockNumber) {
                  const confirmations = latestBlockNumber - parseInt(transaction.blockNumber);
                  if (confirmations > 0) {
                    return (
                      <span className="ml-2 px-2 py-1 bg-dark-100 rounded-md text-xs text-gray-300">
                        {confirmations} Block {confirmations === 1 ? 'Confirmation' : 'Confirmations'}
                      </span>
                    );
                  }
                }
              } catch (error) {
                console.error('Error calculating confirmations:', error);
              }
              return null;
            })()}
          </div>
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
        <div className="w-full md:w-1/3 text-gray-400 mb-1 md:mb-0">To:</div>
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
    </div>
  );
};

export default TransactionBasicInfo;
