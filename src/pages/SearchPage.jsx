import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import TokenLogo from '../components/common/TokenLogo';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setSearchResults(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Try direct navigation first based on query format
        if (/^\d+$/.test(query)) {
          // Looks like a block number - try to fetch it directly
          try {
            const block = await apiService.getBlockByNumber(query);
            if (block) {
              navigate(`/blocks/${query}`);
              return;
            }
          } catch (blockError) {
            console.log('Not a valid block number, continuing with search...');
          }
        } else if (query.startsWith('0x') && query.length === 66) {
          // Looks like a transaction hash - try to fetch it directly
          try {
            // First check if the transaction exists using the search endpoint
            const searchResult = await apiService.search(query);
            if (searchResult && searchResult.type === 'transaction' && searchResult.data) {
              navigate(`/transactions/${query}`);
              return;
            }
            
            // If search doesn't find it, try direct API call
            const transaction = await apiService.getTransactionByHash(query);
            if (transaction) {
              navigate(`/transactions/${query}`);
              return;
            }
          } catch (txError) {
            console.log('Not a valid transaction hash, continuing with search...', txError);
            // Don't navigate, just show search results
          }
        } else if (query.startsWith('0x') && query.length === 42) {
          // Looks like an address - try to fetch its type
          try {
            // First check if the address exists using the search endpoint
            const searchResult = await apiService.search(query);
            if (searchResult && searchResult.type === 'address' && searchResult.data) {
              navigate(`/address/${query}`);
              return;
            }
            
            // If search doesn't find it, try direct API call
            const addressType = await apiService.getAddressType(query);
            if (addressType) {
              navigate(`/address/${query}`);
              return;
            }
          } catch (addressError) {
            console.log('Not a valid address, continuing with search...', addressError);
            // Don't navigate, just show search results
          }
        }
        
        // If direct navigation didn't work, use the search API
        const results = await apiService.search(query);
        setSearchResults(results);
        
        // If search returns a single result with high confidence, redirect
        if (results && results.type && results.data) {
          if (results.type === 'block') {
            navigate(`/blocks/${results.data.number}`);
            return;
          } else if (results.type === 'transaction') {
            navigate(`/transactions/${results.data.hash}`);
            return;
          } else if (results.type === 'address') {
            navigate(`/address/${results.data.address}`);
            return;
          } else if (results.type === 'token') {
            // Redirect to address page instead of token page since token pages are being removed
            navigate(`/address/${results.data.address}`);
            return;
          } else if (results.type === 'nft') {
            navigate(`/nfts/${results.data.address}/${results.data.tokenId}`);
            return;
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Search error:', error);
        setError('Failed to perform search. Please try again.');
        setIsLoading(false);
      }
    };
    
    performSearch();
  }, [query, navigate]);
  
  // Helper function to truncate hash
  const truncateHash = (hash, length = 8) => {
    if (!hash) return '';
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
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
        <p className="text-gray-400">Try searching for a block number, transaction hash, or address.</p>
      </div>
    );
  }
  
  if (!query) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4">Please enter a search query.</div>
        <p className="text-gray-500">Try searching for a block number, transaction hash, or address.</p>
      </div>
    );
  }
  
  if (!searchResults || (Array.isArray(searchResults) && searchResults.length === 0)) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4">No results found for "{query}"</div>
        <p className="text-gray-500">Try searching for a block number, transaction hash, or address.</p>
      </div>
    );
  }
  
  // If we have multiple results, display them
  return (
    <div className="search-results-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Search Results</h1>
        <p className="text-gray-300 mb-8">
          Results for "{query}"
        </p>
      </motion.div>
      
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Results</h2>
        
        {/* Display results based on type */}
        {searchResults.type === 'block' && (
          <div className="bg-dark-200 p-4 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-primary bg-opacity-20 flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <Link to={`/blocks/${searchResults.data.number}`} className="text-white hover:text-primary transition-colors">
                  <span className="font-semibold">Block</span> #{searchResults.data.number}
                </Link>
                <div className="text-sm text-gray-400">
                  <span>{searchResults.data.timestamp}</span>
                  <span className="mx-1">•</span>
                  <span>{searchResults.data.transactions} txns</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {searchResults.type === 'transaction' && (
          <div className="bg-dark-200 p-4 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-accent-purple bg-opacity-20 flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="overflow-hidden">
                <Link to={`/transactions/${searchResults.data.hash}`} className="text-white hover:text-primary transition-colors block truncate">
                  <span className="font-semibold">Transaction</span> {truncateHash(searchResults.data.hash, 12)}
                </Link>
                <div className="text-sm text-gray-400">
                  <span>Block #{searchResults.data.blockNumber}</span>
                  <span className="mx-1">•</span>
                  <span>{searchResults.data.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {searchResults.type === 'address' && (
          <div className="bg-dark-200 p-4 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-accent-teal bg-opacity-20 flex items-center justify-center mr-3">
                {searchResults.addressType === 'contract' ? (
                  <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div className="overflow-hidden">
                <Link to={`/address/${searchResults.data.address}`} className="text-white hover:text-primary transition-colors block truncate">
                  <span className="font-semibold">
                    {searchResults.addressType === 'contract' ? 'Contract' : 'Address'}
                  </span> {truncateHash(searchResults.data.address, 12)}
                </Link>
                <div className="text-sm text-gray-400">
                  {searchResults.contractType && (
                    <span className="mr-1">{searchResults.contractType}</span>
                  )}
                  {searchResults.data.balance && (
                    <>
                      <span className="mx-1">•</span>
                      <span>Balance: {searchResults.data.balance}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {searchResults.type === 'token' && (
          <div className="bg-dark-200 p-4 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-primary bg-opacity-20 flex items-center justify-center mr-3">
                <TokenLogo 
                  token={{
                    address: searchResults.data.address,
                    symbol: searchResults.data.symbol,
                    name: searchResults.data.name
                  }} 
                  size="md" 
                />
              </div>
              <div>
                <Link to={`/address/${searchResults.data.address}`} className="text-white hover:text-primary transition-colors">
                  <span className="font-semibold">Token</span> {searchResults.data.name} ({searchResults.data.symbol})
                </Link>
                <div className="text-sm text-gray-400">
                  <span>{truncateHash(searchResults.data.address)}</span>
                  {searchResults.data.totalSupply && (
                    <>
                      <span className="mx-1">•</span>
                      <span>Supply: {searchResults.data.totalSupply}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {searchResults.type === 'nft' && (
          <div className="bg-dark-200 p-4 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-accent-purple bg-opacity-20 flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <Link to={`/nfts/${searchResults.data.address}/${searchResults.data.tokenId}`} className="text-white hover:text-primary transition-colors">
                  <span className="font-semibold">NFT</span> {searchResults.data.name || `#${searchResults.data.tokenId}`}
                </Link>
                <div className="text-sm text-gray-400">
                  <span>Collection: {searchResults.data.collection}</span>
                  <span className="mx-1">•</span>
                  <span>Token ID: {searchResults.data.tokenId}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* If we have multiple results, display them as a list */}
        {searchResults.type === 'multiple' && searchResults.data && searchResults.data.length > 0 && (
          <div className="space-y-4">
            {searchResults.data.map((result, index) => (
              <div key={index} className="bg-dark-200 p-4 rounded-lg">
                {/* Render based on result type */}
                {/* Similar to above, but for each result in the array */}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Search Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card"
      >
        <h2 className="text-xl font-semibold mb-4">Search Tips</h2>
        <div className="bg-dark-200 p-4 rounded-lg">
          <p className="text-gray-300 mb-3">You can search for:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Block numbers (e.g., <span className="text-primary">12345678</span>)</li>
            <li>Transaction hashes (e.g., <span className="text-primary">0x7336c320de67bb571055bc2f0bc19e7d8e77fa9d2434713a49ffef975cff776e</span>)</li>
            <li>Addresses (e.g., <span className="text-primary">0x1234567890123456789012345678901234567890</span>)</li>
            <li>Token names or symbols (e.g., <span className="text-primary">Studio Token</span> or <span className="text-primary">STO</span>)</li>
            <li>NFT collection names or token IDs</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default SearchPage;
