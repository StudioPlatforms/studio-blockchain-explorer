import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import BlockItem from '../components/blocks/BlockItem';

const BlocksPage = () => {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [blocksPerPage, setBlocksPerPage] = useState(25);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [showOnlyWithTransactions, setShowOnlyWithTransactions] = useState(false);

  // Fetch blocks data
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the latest block number from the health endpoint
        const healthData = await apiService.getHealth();
        console.log('Health data:', healthData);
        if (healthData && healthData.lastBlock) {
          setTotalBlocks(healthData.lastBlock);
        }
        
        // Fetch blocks with pagination
        const offset = (currentPage - 1) * blocksPerPage;
        // Pass the showOnlyWithTransactions parameter to the API service
        const data = await apiService.getBlocks(blocksPerPage, offset, showOnlyWithTransactions);
        console.log('Blocks data:', data);
        setBlocks(data || []);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching blocks:', error);
        setIsLoading(false);
      }
    };
    
    fetchBlocks();
    
    // Set up polling to refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchBlocks();
    }, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [currentPage, blocksPerPage, showOnlyWithTransactions]);
  
  // Handle pagination
  const totalPages = Math.ceil(totalBlocks / blocksPerPage);
  
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  const handleBlocksPerPageChange = (e) => {
    setBlocksPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  
  // Render pagination controls
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`px-3 py-1 mx-1 rounded ${
            i === currentPage
              ? 'bg-primary text-white'
              : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex items-center justify-center mt-6">
        <button
          className="px-3 py-1 mx-1 rounded bg-dark-100 text-gray-300 hover:bg-dark-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              className="px-3 py-1 mx-1 rounded bg-dark-100 text-gray-300 hover:bg-dark-200"
              onClick={() => handlePageChange(1)}
            >
              1
            </button>
            {startPage > 2 && <span className="mx-1 text-gray-500">...</span>}
          </>
        )}
        
        {pages}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="mx-1 text-gray-500">...</span>}
            <button
              className="px-3 py-1 mx-1 rounded bg-dark-100 text-gray-300 hover:bg-dark-200"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          className="px-3 py-1 mx-1 rounded bg-dark-100 text-gray-300 hover:bg-dark-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };
  
  return (
    <div className="blocks-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Blocks</h1>
        <p className="text-gray-300 mb-8">
          Explore all blocks on the Studio Blockchain network. View block details, transactions, and more.
        </p>
      </motion.div>
      
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">Show</span>
                <select
                  className="bg-dark-200 border border-gray-700 rounded px-2 py-1 text-white"
                  value={blocksPerPage}
                  onChange={handleBlocksPerPageChange}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-gray-400 ml-2">entries</span>
              </div>
              
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={showOnlyWithTransactions}
                    onChange={() => {
                      const newValue = !showOnlyWithTransactions;
                      console.log('Toggle switch changed to:', newValue);
                      setShowOnlyWithTransactions(newValue);
                    }}
                  />
                  <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ms-3 text-sm font-medium text-gray-300">Only blocks with transactions</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">Latest Block:</span>
            <span className="text-primary font-mono">{totalBlocks.toLocaleString()}</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {blocks.length > 0 ? (
                blocks.map((block, index) => (
                  <BlockItem 
                    key={block.number} 
                    block={block} 
                    isNew={false}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">
                  {showOnlyWithTransactions ? 
                    "No blocks with transactions found in this range." : 
                    "No blocks found."}
                </div>
              )}
            </div>
            
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default BlocksPage;
