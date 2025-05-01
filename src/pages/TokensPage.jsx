import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import TokenLogo from '../components/common/TokenLogo';

const TokensPage = () => {
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [tokensPerPage, setTokensPerPage] = useState(25);
  const [totalTokens, setTotalTokens] = useState(0);
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch tokens data
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setIsLoading(true);
        
        // Fetch tokens from the API
        const data = await apiService.getNftCollections(tokensPerPage, (currentPage - 1) * tokensPerPage);
        
        // Apply search filter if needed
        let filteredTokens = data;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredTokens = data.filter(token => 
            token.name.toLowerCase().includes(query) || 
            token.symbol.toLowerCase().includes(query) ||
            token.address.toLowerCase().includes(query)
          );
        }
        
        // Apply sorting
        filteredTokens.sort((a, b) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];
          
          // Handle numeric values with commas
          if (typeof aValue === 'string' && aValue.includes(',')) {
            aValue = parseFloat(aValue.replace(/,/g, ''));
          }
          if (typeof bValue === 'string' && bValue.includes(',')) {
            bValue = parseFloat(bValue.replace(/,/g, ''));
          }
          
          if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
        
        // Get total tokens count from API or use length of filtered tokens
        try {
          const stats = await apiService.getNetworkStats();
          setTotalTokens(stats.totalTokens || filteredTokens.length);
        } catch (error) {
          console.error('Error fetching token stats:', error);
          setTotalTokens(filteredTokens.length);
        }
        
        setTokens(filteredTokens);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching tokens:', error);
        setIsLoading(false);
      }
    };
    
    fetchTokens();
  }, [currentPage, tokensPerPage, sortBy, sortDirection, searchQuery]);
  
  // Handle pagination
  const totalPages = Math.ceil(totalTokens / tokensPerPage);
  
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  const handleTokensPerPageChange = (e) => {
    setTokensPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  
  // Handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new column
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  // Render sort indicator
  const renderSortIndicator = (column) => {
    if (sortBy !== column) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled in the useEffect
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
  
  // Helper function to truncate address
  const truncateAddress = (address, length = 8) => {
    if (!address) return '';
    return `${address.substring(0, length)}...${address.substring(address.length - length)}`;
  };
  
  return (
    <div className="tokens-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Tokens</h1>
        <p className="text-gray-300 mb-8">
          Explore all tokens on the Studio Blockchain network. View token details, prices, and market data.
        </p>
      </motion.div>
      
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="mb-4 md:mb-0 w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search by name, symbol, or address"
                className="w-full md:w-64 px-4 py-2 bg-dark-200 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-opacity-90"
              >
                Search
              </button>
            </form>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">Show</span>
            <select
              className="bg-dark-200 border border-gray-700 rounded px-2 py-1 text-white"
              value={tokensPerPage}
              onChange={handleTokensPerPageChange}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-gray-400 ml-2">entries</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="py-3 px-4 text-gray-400 font-medium cursor-pointer" onClick={() => handleSort('name')}>
                      Token {renderSortIndicator('name')}
                    </th>
                    <th className="py-3 px-4 text-gray-400 font-medium cursor-pointer" onClick={() => handleSort('price')}>
                      Price {renderSortIndicator('price')}
                    </th>
                    <th className="py-3 px-4 text-gray-400 font-medium cursor-pointer" onClick={() => handleSort('priceChange')}>
                      24h Change {renderSortIndicator('priceChange')}
                    </th>
                    <th className="py-3 px-4 text-gray-400 font-medium cursor-pointer" onClick={() => handleSort('volume')}>
                      Volume {renderSortIndicator('volume')}
                    </th>
                    <th className="py-3 px-4 text-gray-400 font-medium cursor-pointer" onClick={() => handleSort('marketCap')}>
                      Market Cap {renderSortIndicator('marketCap')}
                    </th>
                    <th className="py-3 px-4 text-gray-400 font-medium cursor-pointer" onClick={() => handleSort('holders')}>
                      Holders {renderSortIndicator('holders')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token.address} className="border-b border-gray-800 hover:bg-dark-100">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <TokenLogo token={token} size="md" className="mr-3" />
                          <div>
                            <Link to={`/tokens/${token.address}`} className="text-primary hover:underline font-medium">
                              {token.name}
                            </Link>
                            <div className="flex items-center text-sm">
                              <span className="text-gray-400 mr-2">{token.symbol}</span>
                              <Link to={`/address/${token.address}`} className="text-gray-500 hover:text-gray-300 font-mono text-xs">
                                {truncateAddress(token.address, 4)}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono">
                        ${token.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={token.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {token.priceChange >= 0 ? '+' : ''}{token.priceChange}%
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono">
                        ${token.volume}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        ${token.marketCap}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {token.holders.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {renderPagination()}
          </>
        )}
      </div>
      
      {/* Token Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card"
      >
        <h2 className="text-xl font-semibold mb-4">Studio Blockchain Tokens</h2>
        <div className="bg-dark-200 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3 mt-1">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Zero-Fee Token Transfers</h3>
              <p className="text-gray-300 text-sm mb-3">
                Studio Blockchain's revolutionary on-chain neural networks enable token transfers with zero gas fees.
                This makes it ideal for microtransactions, gaming, and everyday token usage without the prohibitive costs
                found on other blockchains.
              </p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-dark-100 p-3 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Total Tokens</h4>
                  <p className="text-xl font-mono text-primary">5,432</p>
                  <p className="text-xs text-gray-500 mt-1">Across all categories</p>
                </div>
                
                <div className="bg-dark-100 p-3 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Token Standards</h4>
                  <p className="text-xl font-mono text-accent-teal">ERC-20, ERC-721, ERC-1155</p>
                  <p className="text-xs text-gray-500 mt-1">Fully compatible</p>
                </div>
                
                <div className="bg-dark-100 p-3 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Daily Transfers</h4>
                  <p className="text-xl font-mono text-accent-purple">1.2M+</p>
                  <p className="text-xs text-gray-500 mt-1">Zero-fee transactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TokensPage;
