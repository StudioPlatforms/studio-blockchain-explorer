import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';

const NftDetailsPage = () => {
  const { address, tokenId } = useParams();
  const [nft, setNft] = useState(null);
  const [collection, setCollection] = useState(null);
  const [transferHistory, setTransferHistory] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchNftDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch NFT collection data from the API
        const collectionData = await apiService.getNftCollection(address);
        setCollection(collectionData);
        
        // Fetch NFT token data from the API
        const nftData = await apiService.getNftToken(address, tokenId);
        setNft(nftData);
        
        // Fetch transfer history from the API
        const transferHistoryData = await apiService.getAddressNftTransfers(address, 10, 0, address);
        setTransferHistory(transferHistoryData);
        
        // Fetch price history from the API
        try {
          const priceHistoryData = await apiService.getTokenTransfers(address, 10, 0);
          
          // Map the data to the format we need
          const mappedPriceHistory = priceHistoryData.map(item => ({
            date: item.timestamp,
            price: item.value || nftData.price || "0.00"
          }));
          
          // Sort by date (oldest first for chart)
          mappedPriceHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
          
          setPriceHistory(mappedPriceHistory);
        } catch (error) {
          console.error('Error fetching price history:', error);
          // If price history fails, we can still show the rest of the data
          setPriceHistory([]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching NFT details:', error);
        setError('Failed to load NFT details. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchNftDetails();
  }, [address, tokenId]);
  
  // Helper function to truncate address
  const truncateAddress = (address, length = 6) => {
    if (!address) return '';
    return `${address.substring(0, length)}...${address.substring(address.length - length)}`;
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/nfts" className="text-primary hover:underline">
          Back to NFTs
        </Link>
      </div>
    );
  }
  
  if (!nft || !collection) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4">NFT not found</div>
        <Link to="/nfts" className="text-primary hover:underline">
          Back to NFTs
        </Link>
      </div>
    );
  }
  
  return (
    <div className="nft-details-page">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* NFT Image - Left Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="card overflow-hidden">
            <img 
              src={nft.image} 
              alt={nft.name} 
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/src/assets/nft-placeholder-1.jpg';
              }}
            />
          </div>
        </motion.div>
        
        {/* NFT Details - Right Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          {/* Collection and NFT Name */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Link to={`/nfts/${collection.address}`} className="text-gray-400 hover:text-primary text-sm flex items-center">
                {collection.name}
                {collection.verified && (
                  <svg className="w-4 h-4 ml-1 text-accent-teal" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </Link>
            </div>
            <h1 className="text-3xl font-bold">{nft.name}</h1>
          </div>
          
          {/* Current Price */}
          <div className="card mb-6 p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-gray-400 text-sm">Current Price</div>
                <div className="text-2xl font-bold mt-1">{nft.price} STO</div>
                <div className="text-gray-400 text-sm mt-1">≈ ${(parseFloat(nft.price) * 3000).toFixed(2)}</div>
              </div>
              
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
                Buy Now
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap border-b border-gray-700">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'overview' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'properties' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('properties')}
              >
                Properties
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'history' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
            </div>
          </div>
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-gray-300">{nft.description}</p>
              </div>
              
              {/* Details */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-3">Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Token ID</span>
                    <span className="font-mono">{nft.tokenId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Token Standard</span>
                    <span>ERC-721</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Blockchain</span>
                    <span>Studio Blockchain</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Creator</span>
                    <Link to={`/address/${nft.creator}`} className="text-primary hover:underline font-mono">
                      {truncateAddress(nft.creator)}
                    </Link>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Owner</span>
                    <Link to={`/address/${nft.owner}`} className="text-primary hover:underline font-mono">
                      {truncateAddress(nft.owner)}
                    </Link>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Created</span>
                    <span>{formatDate(nft.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              {/* About Collection */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-3">About {collection.name}</h2>
                <p className="text-gray-300 mb-4">{collection.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-dark-100 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">Floor Price</div>
                    <div className="text-lg font-medium mt-1">{collection.floorPrice} STO</div>
                  </div>
                  <div className="bg-dark-100 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">Volume</div>
                    <div className="text-lg font-medium mt-1">{collection.volume} STO</div>
                  </div>
                  <div className="bg-dark-100 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">Items</div>
                    <div className="text-lg font-medium mt-1">{collection.items.toLocaleString()}</div>
                  </div>
                  <div className="bg-dark-100 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">Owners</div>
                    <div className="text-lg font-medium mt-1">{collection.owners.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Properties</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {nft.traits.map((trait, index) => (
                  <div key={index} className="bg-dark-100 p-3 rounded-lg border border-primary border-opacity-30 text-center">
                    <div className="text-primary text-xs uppercase tracking-wider">{trait.type}</div>
                    <div className="text-white font-medium my-1">{trait.value}</div>
                    <div className="text-gray-400 text-xs">{trait.rarity} rarity</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
              
              <div className="space-y-4">
                {transferHistory.map((transfer, index) => (
                  <div key={index} className="bg-dark-100 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        {transfer.from === '0x0000000000000000000000000000000000000000' ? (
                          <span className="text-accent-teal font-medium">Minted</span>
                        ) : (
                          <span className="text-white font-medium">Transferred</span>
                        )}
                        <span className="text-gray-400 text-sm ml-2">
                          {formatDate(transfer.timestamp)}
                        </span>
                      </div>
                      <div className="text-primary font-mono">
                        {transfer.price === '0' ? 'Mint' : `${transfer.price} STO`}
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">From:</span>
                        {transfer.from === '0x0000000000000000000000000000000000000000' ? (
                          <span className="text-gray-300">Mint</span>
                        ) : (
                          <Link to={`/address/${transfer.from}`} className="text-primary hover:underline font-mono">
                            {truncateAddress(transfer.from)}
                          </Link>
                        )}
                      </div>
                      
                      <div className="hidden md:block mx-2 text-gray-500">→</div>
                      
                      <div className="flex items-center mt-1 md:mt-0">
                        <span className="text-gray-400 mr-1">To:</span>
                        <Link to={`/address/${transfer.to}`} className="text-primary hover:underline font-mono">
                          {truncateAddress(transfer.to)}
                        </Link>
                      </div>
                      
                      <div className="ml-auto mt-2 md:mt-0">
                        <Link to={`/transactions/${transfer.txHash}`} className="text-gray-400 hover:text-primary text-xs font-mono">
                          Tx: {truncateAddress(transfer.txHash, 8)}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Zero Fee NFT Transfers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card mt-8"
      >
        <h2 className="text-xl font-semibold mb-4">Zero-Fee NFT Transfers</h2>
        <div className="bg-dark-100 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-accent-teal bg-opacity-20 flex items-center justify-center mr-3 mt-1">
              <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">AI-Optimized NFT Transfers</h3>
              <p className="text-gray-300 text-sm mb-3">
                Studio Blockchain's on-chain neural networks enable NFT transfers with zero gas fees.
                This revolutionary technology makes it possible to trade NFTs without the prohibitive costs
                found on other blockchains, opening up new possibilities for gaming, digital art, and collectibles.
              </p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-dark-200 p-3 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Transfer Cost</h4>
                  <p className="text-xl font-mono text-accent-teal">0 Gwei</p>
                  <p className="text-xs text-gray-500 mt-1">No gas fees required</p>
                </div>
                
                <div className="bg-dark-200 p-3 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Transfer Speed</h4>
                  <p className="text-xl font-mono text-primary">~2 seconds</p>
                  <p className="text-xs text-gray-500 mt-1">AI-optimized confirmation</p>
                </div>
                
                <div className="bg-dark-200 p-3 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Daily Transfers</h4>
                  <p className="text-xl font-mono text-accent-purple">50K+</p>
                  <p className="text-xs text-gray-500 mt-1">Across all collections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NftDetailsPage;
