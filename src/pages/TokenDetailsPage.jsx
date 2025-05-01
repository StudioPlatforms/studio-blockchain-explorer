import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import apiService from '../services/api';
import { formatEth } from '../utils/formatters';
import TokenLogo from '../components/common/TokenLogo';

// Register Chart.js components
Chart.register(...registerables);

const TokenDetailsPage = () => {
  const { address } = useParams();
  const [token, setToken] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [holders, setHolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartPeriod, setChartPeriod] = useState('24h');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  useEffect(() => {
    const fetchTokenDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch token data from the API
        const tokenData = await apiService.getNftCollection(address);
        
        if (!tokenData) {
          setError('Token not found');
          setIsLoading(false);
          return;
        }
        
        setToken(tokenData);
        
        // Fetch price history data from the API
        try {
          const priceHistoryData = await apiService.getTokenTransfers(address, 30, 0);
          setPriceHistory(priceHistoryData.map(item => ({
            timestamp: item.timestamp,
            price: item.value || tokenData.price
          })));
        } catch (error) {
          console.error('Error fetching price history:', error);
          // If price history fails, we can still show the rest of the data
        }
        
        // Fetch transfers from the API
        try {
          const transfersData = await apiService.getTokenTransfers(address, itemsPerPage, (currentPage - 1) * itemsPerPage);
          setTransfers(transfersData);
        } catch (error) {
          console.error('Error fetching transfers:', error);
          setTransfers([]);
        }
        
        // Fetch holders from the API
        try {
          const holdersData = await apiService.getAddressTokens(address, itemsPerPage, (currentPage - 1) * itemsPerPage);
          setHolders(holdersData.map(holder => ({
            address: holder.address,
            balance: holder.balance,
            percentage: holder.percentage || '0.00'
          })));
        } catch (error) {
          console.error('Error fetching holders:', error);
          setHolders([]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching token details:', error);
        setError('Failed to load token details. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchTokenDetails();
  }, [address]);
  
  // Helper function to truncate address
  const truncateAddress = (address, length = 8) => {
    if (!address) return '';
    return `${address.substring(0, length)}...${address.substring(address.length - length)}`;
  };
  
  // Prepare chart data
  const chartData = {
    labels: priceHistory.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Price (USD)',
        data: priceHistory.map(item => item.price),
        borderColor: '#FF4C29',
        backgroundColor: 'rgba(255, 76, 41, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `$${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#AAAAAA' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: {
          color: '#AAAAAA',
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    }
  };
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransfers = transfers.slice(indexOfFirstItem, indexOfLastItem);
  const currentHolders = holders.slice(indexOfFirstItem, indexOfLastItem);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
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
        <Link to="/tokens" className="text-primary hover:underline">
          Back to Tokens
        </Link>
      </div>
    );
  }
  
  if (!token) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4">Token not found</div>
        <Link to="/tokens" className="text-primary hover:underline">
          Back to Tokens
        </Link>
      </div>
    );
  }
  
  return (
    <div className="token-details-page">
      {/* Token Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center">
          <TokenLogo token={token} size="lg" className="mr-4" />
          <div>
            <h1 className="text-3xl font-bold">{token.name}</h1>
            <div className="flex items-center mt-1">
              <span className="text-gray-400 mr-2">{token.symbol}</span>
              <Link to={`/address/${token.address}`} className="text-primary hover:underline font-mono text-sm">
                {truncateAddress(token.address)}
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0">
          <div className="text-3xl font-bold">${token.price.toLocaleString()}</div>
          <div className={`text-sm ${token.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {token.priceChange >= 0 ? '+' : ''}{token.priceChange}% (24h)
          </div>
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
              activeTab === 'transfers' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('transfers')}
          >
            Transfers
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'holders' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('holders')}
          >
            Holders
          </button>
        </div>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-tab">
          {/* Price Chart */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">Price Chart</h2>
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
          
          {/* Token Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Token Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Token Name:</span>
                  <span className="font-medium">{token.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Symbol:</span>
                  <span className="font-medium">{token.symbol}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Contract Address:</span>
                  <Link to={`/address/${token.address}`} className="text-primary hover:underline font-mono text-sm">
                    {truncateAddress(token.address, 12)}
                  </Link>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Holders:</span>
                  <span className="font-mono">{token.holders.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Market Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Price:</span>
                  <span className="font-mono">${token.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Price Change (24h):</span>
                  <span className={`font-mono ${token.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {token.priceChange >= 0 ? '+' : ''}{token.priceChange}%
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Market Cap:</span>
                  <span className="font-mono">${token.marketCap}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Volume (24h):</span>
                  <span className="font-mono">${token.volume}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Transfers Tab */}
      {activeTab === 'transfers' && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Token Transfers</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-400 font-medium">Txn Hash</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Block</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">From</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">To</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {currentTransfers.map((transfer, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-dark-100">
                    <td className="py-3 px-4">
                      <Link to={`/transactions/${transfer.hash}`} className="text-primary hover:underline font-mono text-sm">
                        {truncateAddress(transfer.hash)}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/blocks/${transfer.blockNumber}`} className="text-primary hover:underline">
                        {transfer.blockNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/address/${transfer.from}`} className="text-primary hover:underline font-mono text-sm">
                        {truncateAddress(transfer.from, 6)}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/address/${transfer.to}`} className="text-primary hover:underline font-mono text-sm">
                        {truncateAddress(transfer.to, 6)}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-mono">
                      {formatEth(transfer.amount, { includeSymbol: false })} {token.symbol}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 mx-1 rounded bg-dark-100 text-gray-300 hover:bg-dark-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 mx-1">Page {currentPage}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastItem >= transfers.length}
              className="px-3 py-1 mx-1 rounded bg-dark-100 text-gray-300 hover:bg-dark-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Holders Tab */}
      {activeTab === 'holders' && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Token Holders</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-400 font-medium">Rank</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Address</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Balance</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {currentHolders.map((holder, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-dark-100">
                    <td className="py-3 px-4 text-gray-300">#{indexOfFirstItem + index + 1}</td>
                    <td className="py-3 px-4">
                      <Link to={`/address/${holder.address}`} className="text-primary hover:underline font-mono text-sm">
                        {truncateAddress(holder.address, 6)}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-mono">{formatEth(holder.balance, { includeSymbol: false })} {token.symbol}</td>
                    <td className="py-3 px-4 text-gray-300">{holder.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 mx-1 rounded bg-dark-100 text-gray-300 hover:bg-dark-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 mx-1">Page {currentPage}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastItem >= holders.length}
              className="px-3 py-1 mx-1 rounded bg-dark-100 text-gray-300 hover:bg-dark-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDetailsPage;
