import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BlockItem = ({ block, isNew = false }) => {
  // Format timestamp to relative time if it's a timestamp
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

  return (
    <motion.div 
      initial={isNew ? { opacity: 0, y: -20, backgroundColor: 'rgba(255, 76, 41, 0.3)' } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(18, 18, 18, 1)' }}
      transition={{ duration: isNew ? 0.5 : 0, backgroundColor: { duration: 1.5 } }}
      className="block-item p-3 bg-dark-200 rounded-lg hover:bg-opacity-80 transition-colors"
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-lg bg-primary bg-opacity-20 flex items-center justify-center mr-3 relative">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {block.aiOptimized && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-teal rounded-full border border-dark-200"></div>
          )}
        </div>
        <div className="flex-1">
          <Link to={`/blocks/${block.number}`} className="text-white hover:text-primary transition-colors">
            <span className="font-semibold">Block</span> #{block.number}
          </Link>
          <div className="flex flex-wrap text-sm text-gray-400">
            <span>{formatTimestamp(block.timestamp)}</span>
            <span className="mx-1">•</span>
            <span>{block.transactions_count || block.transactions || 0} txns</span>
            {block.aiOptimized && (
              <>
                <span className="mx-1">•</span>
                <span className="text-accent-teal">AI Optimized</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BlockItem;
