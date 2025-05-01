import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';

// Import components
import AddressOverview from '../components/addresses/AddressOverview';
import AddressTransactionsTab from '../components/addresses/AddressTransactionsTab';
import AddressTokensTab from '../components/addresses/AddressTokensTab';
import AddressDetailsTab from '../components/addresses/AddressDetailsTab';

const AddressPage = () => {
  const { address } = useParams();
  const [addressData, setAddressData] = useState(null);
  const [addressType, setAddressType] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [tokenTransfers, setTokenTransfers] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('transactions');
  const [copiedText, setCopiedText] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    });
  };
  
  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch address type first to determine what other data to fetch
        const typeData = await apiService.getAddressType(address);
        setAddressType(typeData);
        
        // Fetch address balances
        const balances = await apiService.getAccountBalances(address);
        console.log('Fetched balances:', balances);
        
        // Fetch transactions for this address
        const txData = await apiService.getAddressTransactions(address, itemsPerPage, (currentPage - 1) * itemsPerPage);
        
        // Fetch tokens owned by this address
        const tokenData = await apiService.getAddressTokens(address);
        console.log('Fetched tokens:', tokenData);
        
        // Fetch NFTs owned by this address
        const nftData = await apiService.getAddressNfts(address);
        
        // Fetch token transfers
        let tokenTransfersData = [];
        
        // If this is a token contract, fetch all transfers for this token
        if (typeData.type === 'contract' && typeData.contractType === 'ERC20') {
          console.log('Fetching token transfers for token contract:', address);
          
          // Fetch token info first
          const tokenInfo = await apiService.getTokenInfo(address);
          console.log('Fetched token info:', tokenInfo);
          
          // Fetch token transfers
          const transfers = await apiService.getTokenTransfers(address);
          
          // Add token info to each transfer
          if (tokenInfo && transfers.length > 0) {
            tokenTransfersData = transfers.map(transfer => ({
              ...transfer,
              tokenSymbol: tokenInfo.symbol,
              tokenName: tokenInfo.name,
              decimals: tokenInfo.decimals,
              from: transfer.fromAddress,
              to: transfer.toAddress,
              hash: transfer.transactionHash
            }));
          } else {
            tokenTransfersData = transfers;
          }
        } else {
          // Otherwise, fetch token transfers for this address
          console.log('Fetching token transfers for address:', address);
          tokenTransfersData = await apiService.getAddressTokenTransfers(address);
        }
        
        console.log('Fetched token transfers:', tokenTransfersData);
        setTokenTransfers(tokenTransfersData);
        
        // If this is a contract, fetch contract details
        let tokenInfo = null;
        let ownerAddress = null;
        let creatorAddress = null;
        
        if (typeData.type === 'contract') {
          // Get contract details
          const contractDetails = await apiService.getContractDetails(address);
          console.log('Fetched contract details:', contractDetails);
          
          if (contractDetails) {
            ownerAddress = contractDetails.ownerAddress;
            creatorAddress = contractDetails.creatorAddress;
          }
          
          // If it's a token contract, also fetch token info
          if (typeData.contractType === 'ERC20') {
            tokenInfo = await apiService.getTokenInfo(address);
            console.log('Fetched token info for contract:', tokenInfo);
          }
        }
        
        // Combine all data
        setAddressData({
          address,
          balance: balances.native,
          tokens: balances.tokens && balances.tokens.length > 0 ? balances.tokens : tokenData,
          type: typeData.type,
          contractType: typeData.contractType,
          tokenInfo: tokenInfo, // Add token info if this is a token contract
          ownerAddress: ownerAddress, // Add owner address if this is a contract
          creatorAddress: creatorAddress // Add creator address if this is a contract
        });
        
        setTransactions(txData);
        setTokens(tokenData);
        setNfts(nftData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching address data:', error);
        setError('Failed to load address data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchAddressData();
  }, [address, currentPage, itemsPerPage]);
  
  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
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
        <Link to="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }
  
  if (!addressData) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4">Address not found</div>
        <Link to="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="address-page">
      {/* Address Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">Address</h1>
              <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                addressData.type === 'contract' 
                  ? 'bg-accent-purple bg-opacity-20 text-accent-purple' 
                  : 'bg-accent-teal bg-opacity-20 text-accent-teal'
              }`}>
                {addressData.type === 'contract' ? 'Contract' : 'Wallet'}
                {addressData.contractType && ` (${addressData.contractType})`}
              </span>
            </div>
            <p className="text-gray-400 mt-1 font-mono text-sm break-all">
              {address}
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Address Overview */}
      <AddressOverview 
        addressData={addressData} 
        transactions={transactions} 
        tokens={tokens} 
        nfts={nfts} 
      />
      
      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap border-b border-gray-700">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'transactions' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'token_transfers' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('token_transfers')}
          >
            Token Transfers
          </button>
          
          {nfts.length > 0 && (
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'nfts' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('nfts')}
            >
              NFTs
            </button>
          )}
          
          {addressData.type === 'contract' && (
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'contract' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('contract')}
            >
              Contract
              {/* Check if contract is verified from localStorage */}
              {localStorage.getItem(`contract-verified-${addressData.address}`) === 'true' && (
                <span className="ml-1 text-green-400">✓</span>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'transactions' && (
        <AddressTransactionsTab 
          transactions={transactions} 
          address={address} 
          currentPage={currentPage} 
          itemsPerPage={itemsPerPage} 
          handlePageChange={handlePageChange} 
          handleItemsPerPageChange={handleItemsPerPageChange} 
        />
      )}
      
      {activeTab === 'token_transfers' && (
        <AddressTokensTab 
          tokenTransfers={tokenTransfers} 
          copyToClipboard={copyToClipboard} 
          copiedText={copiedText} 
        />
      )}
      
      {(activeTab === 'nfts' || activeTab === 'contract') && (
        <AddressDetailsTab 
          addressData={addressData} 
          nfts={nfts} 
          activeTab={activeTab} 
        />
      )}
    </div>
  );
};

export default AddressPage;
