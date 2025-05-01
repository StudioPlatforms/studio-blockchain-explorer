import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { formatEth } from '../utils/formatters';
import TransactionItem from '../components/transactions/TransactionItem';
import useGasOptimization from '../hooks/useGasOptimization';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [txPerPage, setTxPerPage] = useState(25);
  const [totalTx, setTotalTx] = useState(0);
  
  // State for tracking new transactions
  const [newTransactionsCount, setNewTransactionsCount] = useState(0);
  const [lastKnownTransactionHash, setLastKnownTransactionHash] = useState('');
  
  // Fetch gas optimization percentage from AI Dashboard
  const { gasOptimization, isLoading: isLoadingGasOptimization } = useGasOptimization();
  
  // Function to fetch total transactions count
  const fetchTotalTransactions = async () => {
    try {
      console.log('Fetching total transactions count from dedicated endpoint');
      const response = await fetch('https://mainnetindexer.studio-blockchain.com/stats/transactions/count');
      const data = await response.json();
      
      if (data && data.totalTransactions && typeof data.totalTransactions === 'number') {
        console.log(`Got total transactions from dedicated endpoint: ${data.totalTransactions}`);
        setTotalTx(data.totalTransactions);
      } else {
        console.warn('Invalid transaction count data from dedicated endpoint');
      }
    } catch (error) {
      console.error('Error fetching total transactions count:', error);
    }
  };
  
  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async (isRefresh = false) => {
      try {
        // Only set loading state if it's not a refresh or it's the initial page load
        if (!isRefresh) {
          setIsLoading(true);
        } else {
          // For refreshes, we set a separate state that doesn't trigger the loading UI
          setIsRefreshing(true);
        }
        
        // Fetch total transactions count from dedicated endpoint
        await fetchTotalTransactions();
        
        // Fetch transactions with pagination
        const offset = (currentPage - 1) * txPerPage;
        const data = await apiService.getTransactions(txPerPage, offset);
        
        // Check if we have new transactions (only on first page)
        if (currentPage === 1 && data.length > 0 && lastKnownTransactionHash) {
          // If the latest transaction hash is different from the last known one,
          // we have new transactions
          if (data[0].hash !== lastKnownTransactionHash) {
            setNewTransactionsCount(prevCount => prevCount + 1);
          }
        }
        
        // Update last known transaction hash (only on first page)
        if (currentPage === 1 && data.length > 0) {
          setLastKnownTransactionHash(data[0].hash);
        }
        
        setTransactions(data);
        setIsLoading(false);
        setIsRefreshing(false);
        
        // After first successful load, set isInitialLoad to false
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };
    
    // Initial fetch
    fetchTransactions(false);
    
    // Set up polling to refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      if (currentPage === 1) { // Only refresh first page automatically
        fetchTransactions(true); // Pass true to indicate this is a refresh
      }
    }, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [currentPage, txPerPage, lastKnownTransactionHash]);
  
  // Reset new transactions counter
  const resetNewTransactionsCount = () => {
    setNewTransactionsCount(0);
  };
  
  // Handle pagination
  const totalPages = Math.ceil(totalTx / txPerPage);
  
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  const handleTxPerPageChange = (e) => {
    setTxPerPage(Number(e.target.value));
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
  
  // Helper function to truncate hash
  const truncateHash = (hash, length = 8) => {
    if (!hash) return '';
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
  };
  
  return (
    <div className="transactions-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Transactions</h1>
        <p className="text-gray-300 mb-8">
          Explore all transactions on the Studio Blockchain network. View transaction details, status, and more.
        </p>
      </motion.div>
      
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Show</span>
              <select
                className="bg-dark-200 border border-gray-700 rounded px-2 py-1 text-white"
                value={txPerPage}
                onChange={handleTxPerPageChange}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-gray-400 ml-2">entries</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">Total Transactions:</span>
            <span className="text-primary font-mono">{totalTx.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Only show loading spinner during initial load, not during refreshes */}
        {isLoading && !isRefreshing ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              {newTransactionsCount > 0 && currentPage === 1 && (
                <div 
                  className="bg-accent-purple bg-opacity-20 text-accent-purple p-3 rounded-lg mb-4 flex justify-between items-center cursor-pointer"
                  onClick={resetNewTransactionsCount}
                >
                  <span>
                    <span className="font-bold">{newTransactionsCount}</span> new transaction{newTransactionsCount !== 1 ? 's' : ''} detected
                  </span>
                  <button className="text-white bg-accent-purple px-3 py-1 rounded-lg text-sm">
                    Refresh
                  </button>
                </div>
              )}
              
              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <TransactionItem 
                    key={tx.hash} 
                    transaction={tx} 
                    isNew={index === 0 && newTransactionsCount > 0 && currentPage === 1}
                  />
                ))}
              </div>
            </div>
            
            {renderPagination()}
          </>
        )}
      </div>
      
      {/* Priority System Gas Fee Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card"
      >
        <h2 className="text-xl font-semibold mb-4">Priority System Gas Fees</h2>
        <div className="bg-dark-200 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3 mt-1">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">How Studio Blockchain's Priority System Gas Fees Work</h3>
              <p className="text-gray-300 text-sm mb-3">
                Studio Blockchain's revolutionary on-chain neural networks implement a priority system for gas fees.
                The AI analyzes transaction patterns and network conditions to optimize block production and transaction processing,
                resulting in a more efficient and accessible blockchain for all users.
              </p>
              <p className="text-gray-300 text-sm">
                Transactions are processed based on their priority level, with higher priority transactions being processed faster.
                Users can choose their priority level based on their needs, creating a balanced system that maintains network efficiency
                while providing flexibility for different types of transactions.
              </p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-dark-100 p-3 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Standard Transactions</h4>
                  <p className="text-xl font-mono text-primary">Low Priority</p>
                  <p className="text-xs text-gray-500 mt-1">Minimal gas fees</p>
                </div>
                
                <div className="bg-dark-100 p-3 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Priority Transactions</h4>
                  <p className="text-xl font-mono text-accent-teal">Medium/High</p>
                  <p className="text-xs text-gray-500 mt-1">User-defined priority</p>
                </div>
                
                <div className="bg-dark-100 p-3 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Gas Optimization</h4>
                  <p className="text-xl font-mono text-accent-purple">
                    {isLoadingGasOptimization ? '...' : `${gasOptimization || 0}%`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Neural network efficiency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TransactionsPage;
