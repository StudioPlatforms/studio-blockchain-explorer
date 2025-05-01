import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Component for displaying transaction logs tab
 */
const TransactionLogsTab = ({ receipt }) => {
  if (!receipt || !receipt.logs || receipt.logs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Event Logs</h2>
        <div className="text-center py-10 text-gray-400">
          No logs found for this transaction
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card mb-8"
    >
      <h2 className="text-xl font-semibold mb-4">Event Logs</h2>
      
      <div className="space-y-4">
        {receipt.logs.map((log, index) => (
          <div key={index} className="bg-dark-200 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Log #{index}</h3>
              <span className="text-xs text-gray-400">Index: {log.logIndex}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/4 text-gray-400 text-sm">Address:</div>
                <div className="w-full md:w-3/4 font-mono text-sm truncate">
                  <Link to={`/address/${log.address}`} className="text-primary hover:underline">
                    {log.address}
                  </Link>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/4 text-gray-400 text-sm">Topics:</div>
                <div className="w-full md:w-3/4">
                  {log.topics && log.topics.map((topic, i) => (
                    <div key={i} className="font-mono text-sm truncate mb-1">
                      {i === 0 ? 'Event Signature: ' : `Topic ${i}: `}
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/4 text-gray-400 text-sm">Data:</div>
                <div className="w-full md:w-3/4 font-mono text-sm break-all">
                  {log.data || '0x'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TransactionLogsTab;
