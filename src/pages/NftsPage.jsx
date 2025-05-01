import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import useGasOptimization from '../hooks/useGasOptimization';

const NftsPage = () => {
  const [nfts, setNfts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [nftsPerPage, setNftsPerPage] = useState(12);
  const [totalNfts, setTotalNfts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trending');
  
  // Fetch gas optimization percentage from AI Dashboard
  const { gasOptimization, isLoading: isLoadingGasOptimization } = useGasOptimization();
  
  // Fetch NFTs data
  useEffect(() => {
    const fetchNfts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch NFT collections from the API
        const collections = await apiService.getNftCollections();
        setCollections(collections);
        
        // Get NFTs from collections
        let allNfts = [];
        for (let i = 0; i < Math.min(3, collections.length); i++) {
          const collection = collections[i];
          try {
            // Fetch NFTs for this collection
            const collectionNfts = await apiService.getNftToken(collection.address, 0);
            if (collectionNfts) {
              const processedNfts = Array.isArray(collectionNfts) ? collectionNfts : [collectionNfts];
              const mappedNfts = processedNfts.map(item => ({
                id: item.tokenId,
                name: item.name || `${collection.name} #${item.tokenId}`,
                tokenId: item.tokenId,
                collection: collection.name,
                collectionAddress: collection.address,
                image: item.image || `/src/assets/nft-placeholder-${(parseInt(item.tokenId) % 5) + 1}.jpg`,
                price: item.price || "0.00",
                lastSale: item.lastSale || "0.00",
                owner: item.owner,
                verified: item.verified || false
              }));
              allNfts = [...allNfts, ...mappedNfts];
            }
          } catch (error) {
            console.error(`Error fetching NFTs for collection ${collection.address}:`, error);
          }
        }
        
        // Apply search filter if needed
        let filteredNfts = allNfts;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredNfts = allNfts.filter(nft => 
            nft.name.toLowerCase().includes(query) || 
            nft.collection.toLowerCase().includes(query)
          );
        }
        
        // Apply tab filter
        if (activeTab === 'trending') {
          // Sort by price for "trending"
          filteredNfts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        } else if (activeTab === 'top') {
          // Sort by lastSale for "top"
          filteredNfts.sort((a, b) => parseFloat(b.lastSale) - parseFloat(a.lastSale));
        } else if (activeTab === 'new') {
          // Sort by id for "new" (assuming newer NFTs have higher IDs)
          filteredNfts.sort((a, b) => b.id - a.id);
        }
        
        setTotalNfts(filteredNfts.length);
        
        // Apply pagination
        const indexOfLastNft = currentPage * nftsPerPage;
        const indexOfFirstNft = indexOfLastNft - nftsPerPage;
        const paginatedNfts = filteredNfts.slice(indexOfFirstNft, indexOfLastNft);
        
        setNfts(paginatedNfts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setIsLoading(false);
      }
    };
    
    fetchNfts();
  }, [currentPage, nftsPerPage, searchQuery, activeTab]);
  
  // Handle pagination
  const totalPages = Math.ceil(totalNfts / nftsPerPage);
  
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  const handleNftsPerPageChange = (e) => {
    setNftsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
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
  const truncateAddress = (address, length = 6) => {
    if (!address) return '';
    return `${address.substring(0, length)}...${address.substring(address.length - length)}`;
  };
  
  return (
    <div className="nfts-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">NFT Collections</h1>
        <p className="text-gray-300 mb-8">
          Explore NFT collections on the Studio Blockchain network. Browse trending, top, and new NFTs.
        </p>
      </motion.div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="mb-4 md:mb-0 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search by name or collection"
              className="w-full md:w-64 px-4 py-2 bg-dark-100 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
        
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded ${
              activeTab === 'trending' 
                ? 'bg-primary text-white' 
                : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
            }`}
            onClick={() => setActiveTab('trending')}
          >
            Trending
          </button>
          <button
            className={`px-3 py-1 rounded ${
              activeTab === 'top' 
                ? 'bg-primary text-white' 
                : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
            }`}
            onClick={() => setActiveTab('top')}
          >
            Top
          </button>
          <button
            className={`px-3 py-1 rounded ${
              activeTab === 'new' 
                ? 'bg-primary text-white' 
                : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
            }`}
            onClick={() => setActiveTab('new')}
          >
            New
          </button>
        </div>
      </div>
      
      {/* Top Collections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Top Collections</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="py-3 px-4 text-gray-400 font-medium">Collection</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Floor Price</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Volume</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Items</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Owners</th>
              </tr>
            </thead>
            <tbody>
              {collections.slice(0, 5).map((collection) => (
                <tr key={collection.id} className="border-b border-gray-800 hover:bg-dark-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold">{collection.name.substring(0, 2)}</span>
                      </div>
                      <div>
                        <Link to={`/nfts/${collection.address}`} className="text-primary hover:underline font-medium flex items-center">
                          {collection.name}
                          {collection.verified && (
                            <svg className="w-4 h-4 ml-1 text-accent-teal" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </Link>
                        <div className="text-gray-500 text-xs font-mono">
                          {truncateAddress(collection.address)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">{collection.floorPrice} STO</td>
                  <td className="py-3 px-4 font-mono">{collection.volume} STO</td>
                  <td className="py-3 px-4 font-mono">{collection.items.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono">{collection.owners.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* NFT Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {activeTab === 'trending' && 'Trending NFTs'}
            {activeTab === 'top' && 'Top NFTs'}
            {activeTab === 'new' && 'New NFTs'}
          </h2>
          
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">Show</span>
            <select
              className="bg-dark-100 border border-gray-700 rounded px-2 py-1 text-white"
              value={nftsPerPage}
              onChange={handleNftsPerPageChange}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
            <span className="text-gray-400 ml-2">per page</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <div key={nft.id} className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-square bg-dark-100 relative">
                    <img 
                      src={nft.image} 
                      alt={nft.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/src/assets/nft-placeholder-1.jpg';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-dark-200 bg-opacity-80 rounded-full px-2 py-1 text-xs font-mono">
                      {nft.price} STO
                    </div>
                  </div>
                  <div className="p-4">
                    <Link to={`/nfts/${nft.collectionAddress}/${nft.tokenId}`} className="text-primary hover:underline">
                      <h3 className="font-medium truncate">{nft.name}</h3>
                    </Link>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-gray-400 text-sm flex items-center">
                        {nft.collection}
                        {nft.verified && (
                          <svg className="w-3 h-3 ml-1 text-accent-teal" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">#{nft.tokenId}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {renderPagination()}
          </>
        )}
      </motion.div>
      
      {/* Priority System for NFT Transfers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card mt-8"
      >
        <h2 className="text-xl font-semibold mb-4">Priority System for NFT Transfers</h2>
        <div className="bg-dark-100 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3 mt-1">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">AI-Optimized NFT Transfers</h3>
              <p className="text-gray-300 text-sm mb-3">
                Studio Blockchain's revolutionary on-chain neural networks implement a priority system for NFT transfers.
                The AI analyzes transaction patterns and network conditions to optimize block production and transaction processing,
                resulting in a more efficient and accessible blockchain for NFT trading.
              </p>
              <p className="text-gray-300 text-sm">
                NFT transfers are processed based on their priority level, with higher priority transfers being processed faster.
                This creates a balanced system that maintains network efficiency while providing flexibility for different types of NFT transactions.
              </p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-dark-200 p-3 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Standard Transfers</h4>
                  <p className="text-xl font-mono text-primary">Low Priority</p>
                  <p className="text-xs text-gray-500 mt-1">Minimal gas fees</p>
                </div>
                
                <div className="bg-dark-200 p-3 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Priority Transfers</h4>
                  <p className="text-xl font-mono text-accent-teal">Medium/High</p>
                  <p className="text-xs text-gray-500 mt-1">User-defined priority</p>
                </div>
                
                <div className="bg-dark-200 p-3 rounded-lg">
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

export default NftsPage;
