import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { formatEth } from '../utils/formatters';

// Import components
import BlockItem from '../components/blocks/BlockItem';
import TransactionItem from '../components/transactions/TransactionItem';
import NeuralNetworkVisualizer from '../components/ai-visualization/NeuralNetworkVisualizer';
import SearchDropdown from '../components/common/SearchDropdown';

const HomePage = () => {
  // We no longer need the searchQuery state as it's managed by the SearchDropdown component
  const [blocks, setBlocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [networkStats, setNetworkStats] = useState({
    latestBlock: 0,
    totalTransactions: 0,
    gasPrice: 0,
  });
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [aiMetrics, setAiMetrics] = useState({
    accuracy: 0,
    optimization: 0,
  });
  const navigate = useNavigate();
  
  // News items
  const newsItems = [
    {
      title: "Studio Blockchain Launches Mainnet",
      content: "Studio Blockchain has officially launched its mainnet, bringing on-chain neural networks and priority system gas fees to the blockchain ecosystem.",
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Deploy One-Click AI Agents on X",
      content: "Create and deploy AI agents on X with just one click. ",
      link: "https://app.studio-blockchain.com/ai/agents",
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Instant AI-Powered Smart Contract Audits",
      content: "Get your smart contracts audited instantly with our AI-powered audit tool. ",
      link: "https://app.studio-blockchain.com/ai/audit",
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Bridge USDT to STUDIO for Public Sale",
      content: "Bridge your USDT to STUDIO and get ready for the upcoming public sale. ",
      link: "https://app.studio-blockchain.com/bridge",
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      title: "Step Into the Metaverse: Explore 3D City",
      content: "Explore 3D City and play for free on Epic Games. ",
      link: "https://store.epicgames.com/en-US/p/3d-city-32fc13",
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    }
  ];
  
  // Current news index
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  
  // Rotate news every 10 seconds
  useEffect(() => {
    const newsInterval = setInterval(() => {
      setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
    }, 10000);
    
    return () => clearInterval(newsInterval);
  }, [newsItems.length]);
  
  // AI visualization loading state and neural network data
  const [isAiVisLoading, setIsAiVisLoading] = useState(true);
  const [neuralNetworkData, setNeuralNetworkData] = useState(null);
  
  // Set AI visualization as loaded after initial data fetch
  useEffect(() => {
    if (aiMetrics.accuracy > 0) {
      setIsAiVisLoading(false);
    }
  }, [aiMetrics]);
  
  // Helper function to format ETH values from Wei hex
  const formatEthFromWei = (weiHex) => {
    try {
      if (!weiHex) return '0 STUDIO';
      
      // If weiHex is already a number, just format it
      if (typeof weiHex === 'number') {
        return formatEth(weiHex);
      }
      
      // If weiHex is an object with a hex property, convert it
      if (weiHex.hex) {
        const valueInWei = BigInt(weiHex.hex);
        const valueInEther = Number(valueInWei) / 1e18;
        return formatEth(valueInEther);
      }
      
      // If weiHex is a string that looks like a hex value
      if (typeof weiHex === 'string' && weiHex.startsWith('0x')) {
        const valueInWei = BigInt(weiHex);
        const valueInEther = Number(valueInWei) / 1e18;
        return formatEth(valueInEther);
      }
      
      // Otherwise just use the formatEth function
      return formatEth(weiHex);
    } catch (error) {
      console.error('Error formatting ETH value:', error);
      return '0 STUDIO';
    }
  };
  
  // Helper function to format timestamp
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
  
  // State for tracking new blocks and transactions
  const [newBlocksCount, setNewBlocksCount] = useState(0);
  const [lastKnownBlockNumber, setLastKnownBlockNumber] = useState(0);
  const [newTransactionsCount, setNewTransactionsCount] = useState(0);
  const [lastKnownTransactionHash, setLastKnownTransactionHash] = useState('');
  
  // Reset counters when user views the data
  const handleViewLatestBlocks = () => {
    setNewBlocksCount(0);
  };
  
  const handleViewLatestTransactions = () => {
    setNewTransactionsCount(0);
  };
  
  // Handle search
  const handleSearch = (query) => {
    // This function will be called by the SearchDropdown component when a search is submitted
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };
  
  // Function to fetch total transactions count
  const fetchTotalTransactions = async () => {
    try {
      console.log('Fetching total transactions count from dedicated endpoint');
      const response = await fetch('https://mainnetindexer.studio-blockchain.com/stats/transactions/count');
      const data = await response.json();
      
      if (data && data.totalTransactions && typeof data.totalTransactions === 'number') {
        console.log(`Got total transactions from dedicated endpoint: ${data.totalTransactions}`);
        setTotalTransactions(data.totalTransactions);
      } else {
        console.warn('Invalid transaction count data from dedicated endpoint');
      }
    } catch (error) {
      console.error('Error fetching total transactions count:', error);
    }
  };
  
  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total transactions count
        await fetchTotalTransactions();
        
        // Fetch latest blocks (11 for desktop, will show conditionally)
        const blocksData = await apiService.getBlocks(11, 0);
        console.log('Fetched blocks data:', blocksData);
        
        // Check if we have new blocks
        if (blocksData && blocksData.length > 0) {
          const latestBlockNumber = blocksData[0].number;
          console.log('Latest block number:', latestBlockNumber);
          
          // If this is the first load, just set the last known block number
          if (lastKnownBlockNumber === 0) {
            setLastKnownBlockNumber(latestBlockNumber);
          } 
          // If we have a new block, increment the counter
          else if (latestBlockNumber > lastKnownBlockNumber) {
            const newBlocks = latestBlockNumber - lastKnownBlockNumber;
            setNewBlocksCount(prevCount => prevCount + newBlocks);
            setLastKnownBlockNumber(latestBlockNumber);
          }
        } else {
          console.warn('No blocks data returned from API or empty array');
        }
        
        // Update blocks state
        setBlocks(blocksData || []);
        
        // Fetch latest transactions
        const transactionsData = await apiService.getTransactions(5, 0);
        
        // Check if we have new transactions
        if (transactionsData.length > 0 && lastKnownTransactionHash) {
          // If the latest transaction hash is different from the last known one,
          // we have new transactions
          if (transactionsData[0].hash !== lastKnownTransactionHash) {
            setNewTransactionsCount(prevCount => prevCount + 1);
          }
        }
        
        // Update last known transaction hash
        if (transactionsData.length > 0) {
          setLastKnownTransactionHash(transactionsData[0].hash);
        }
        
        // Update transactions state
        setTransactions(transactionsData);
        
        // Fetch network stats
        const networkStatsData = await apiService.getNetworkStats();
        setNetworkStats(networkStatsData);
        
        // Fetch AI Dashboard data with real metrics
        try {
          const aiDashboardData = await apiService.getAiDashboardData();
          
          // Set AI metrics from real data
          setAiMetrics({
            accuracy: aiDashboardData.predictionAccuracy || 98,
            optimization: aiDashboardData.gasOptimization || 92
          });
          
          // Set neural network data
          setNeuralNetworkData(aiDashboardData.neuralNetwork);
          
          console.log('AI Dashboard data:', {
            predictionAccuracy: aiDashboardData.predictionAccuracy,
            gasOptimization: aiDashboardData.gasOptimization,
            isSimulated: aiDashboardData.isSimulated,
            neuralNetwork: aiDashboardData.neuralNetwork
          });
        } catch (error) {
          console.error('Error fetching AI dashboard data:', error);
          // Fallback to default values
          setAiMetrics({
            accuracy: 98,
            optimization: 92
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Set up polling to refresh data every 10 seconds for more real-time updates
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 10000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [lastKnownBlockNumber]);
  
  
  return (
    <div className="home-page">
      <section className="hero mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Desktop title - hidden on mobile */}
          <div className="hidden md:block">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Studio Blockchain Explorer</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Explore the first Ethereum fork with on-chain neural networks and priority system gas fees
            </p>
          </div>
          
          {/* Mobile search container */}
          <div className="md:hidden flex flex-col items-start w-full px-4 mb-6">
            <h2 className="text-white font-bold text-left mb-2">STO Blockchain Explorer</h2>
            <div className="relative w-full">
              <SearchDropdown onSearch={handleSearch} />
            </div>
          </div>
        </motion.div>
      </section>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Network Stats Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4">Network Statistics</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="stat-item">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Latest Block</p>
                  <p className="text-xl font-mono">{networkStats.latestBlock.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-accent-teal bg-opacity-20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Transactions</p>
              <p className="text-xl font-mono">
                {totalTransactions.toLocaleString()} 
                <span className="text-sm text-gray-400 ml-2">
                  ({Math.round(networkStats.tps * 10) / 10} TPS)
                </span>
              </p>
                </div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-accent-purple bg-opacity-20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Holders</p>
                  <p className="text-xl font-mono">{networkStats.totalHolders?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-accent-gold bg-opacity-20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Validators Payout</p>
                  <p className="text-xl font-mono">
                    {(() => {
                      // Hardcoded STO to USD conversion rate
                      const stoToUsdRate = 0.10; // $0.10 per STO
                      
                      // Get STO value first
                      let stoValue = 0;
                      
                      // Use the formatted value from the API if available
                      if (networkStats.validatorsPayout?.formatted) {
                        // Extract numeric value from formatted string
                        const formattedValue = networkStats.validatorsPayout.formatted;
                        // Remove commas and convert to number
                        stoValue = parseFloat(formattedValue.replace(/,/g, ''));
                      } else if (networkStats.validatorsPayout?.raw) {
                        try {
                          // Convert to BigInt if it's a string
                          const valueInWei = typeof networkStats.validatorsPayout.raw === 'string' 
                            ? BigInt(networkStats.validatorsPayout.raw)
                            : BigInt(networkStats.validatorsPayout.raw);
                          
                          // Convert to STO (divide by 10^18)
                          const divisor = BigInt(10) ** BigInt(18);
                          const wholePart = valueInWei / divisor;
                          const fractionalPart = valueInWei % divisor;
                          
                          // Calculate STO value
                          if (fractionalPart === BigInt(0)) {
                            // If there's no fractional part
                            stoValue = Number(wholePart);
                          } else {
                            // For values with fractional parts
                            const fractionalStr = fractionalPart.toString().padStart(18, '0');
                            const significantFractionalStr = fractionalStr.substring(0, 6);
                            stoValue = Number(wholePart) + Number(`0.${significantFractionalStr}`);
                          }
                        } catch (error) {
                          console.error('Error calculating STO value:', error);
                          // Try to use formatEth as fallback
                          const formattedEth = formatEth(networkStats.validatorsPayout.raw, { includeSymbol: false });
                          stoValue = parseFloat(formattedEth) || 0;
                        }
                      }
                      
                      // Convert STO to USD
                      const usdValue = stoValue * stoToUsdRate;
                      
                      // Format USD value with 2 decimal places and commas for thousands
                      return `$${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    })()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(() => {
                      // Show the original STO value in smaller text
                      if (networkStats.validatorsPayout?.formatted) {
                        return `${networkStats.validatorsPayout.formatted} STO`;
                      }
                      
                      if (!networkStats.validatorsPayout?.raw) return '0 STO';
                      
                      try {
                        // Convert to BigInt if it's a string
                        const valueInWei = typeof networkStats.validatorsPayout.raw === 'string' 
                          ? BigInt(networkStats.validatorsPayout.raw)
                          : BigInt(networkStats.validatorsPayout.raw);
                        
                        // Convert to STO (divide by 10^18)
                        const divisor = BigInt(10) ** BigInt(18);
                        const wholePart = valueInWei / divisor;
                        const fractionalPart = valueInWei % divisor;
                        
                        // If there's no fractional part, just return the whole part
                        if (fractionalPart === BigInt(0)) {
                          // Format with commas for thousands separator
                          return `${wholePart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} STO`;
                        }
                        
                        // For values with fractional parts, format with appropriate decimal places
                        const fractionalStr = fractionalPart.toString().padStart(18, '0');
                        const significantFractionalStr = fractionalStr.substring(0, 6).replace(/0+$/, '');
                        
                        if (significantFractionalStr.length > 0) {
                          return `${wholePart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${significantFractionalStr} STO`;
                        } else {
                          return `${wholePart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} STO`;
                        }
                      } catch (error) {
                        console.error('Error formatting validators payout:', error);
                        return formatEth(networkStats.validatorsPayout.raw) || '0 STO';
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* News Section - Now inside Network Statistics with rotation */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-3">News</h3>
            <div className="news-container p-4 bg-dark-100 rounded-lg border border-dark-300 relative overflow-hidden" style={{ minHeight: '150px' }}>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentNewsIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    duration: 0.5 
                  }}
                  className="w-full"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center flex-shrink-0 mt-1">
                      {newsItems[currentNewsIndex].icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{newsItems[currentNewsIndex].title}</h3>
                      <p className="text-gray-300 mb-2">
                        {newsItems[currentNewsIndex].content}
                      </p>
                      {newsItems[currentNewsIndex].link && (
                        <a 
                          href={newsItems[currentNewsIndex].link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline"
                        >
                          Learn More →
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* News navigation dots */}
            <div className="flex justify-center mt-3 space-x-2">
              {newsItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentNewsIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentNewsIndex ? 'bg-primary scale-125' : 'bg-gray-500 opacity-50'
                  }`}
                  aria-label={`News item ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* AI Highlights Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4">AI Neural Network</h2>
          <div className="ai-preview">
            <NeuralNetworkVisualizer 
              isLoading={isAiVisLoading} 
              neuralNetwork={neuralNetworkData}
            />
            
            <div className="ai-metrics space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Block Prediction Accuracy</span>
                  <span className="text-sm font-semibold">{aiMetrics.accuracy}%</span>
                </div>
                <div className="w-full bg-dark-200 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${aiMetrics.accuracy}%` }}
                    transition={{ duration: 1 }}
                    className="bg-primary h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Network Optimization</span>
                  <span className="text-sm font-semibold">{aiMetrics.optimization}%</span>
                </div>
                <div className="w-full bg-dark-200 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${aiMetrics.optimization}%` }}
                    transition={{ duration: 1.2 }}
                    className="bg-accent-teal h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </div>
            
            <Link to="/ai-dashboard" className="btn btn-primary mt-4 inline-block">
              View Full AI Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Latest Blocks */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">Latest Blocks</h2>
              {newBlocksCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full animate-pulse">
                  +{newBlocksCount} new
                </span>
              )}
            </div>
            <Link 
              to="/blocks" 
              className="text-primary text-sm hover:underline"
              onClick={handleViewLatestBlocks}
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <div 
                key={block.number} 
                className={index >= 8 ? 'hidden md:block' : ''}
              >
                <BlockItem 
                  block={block} 
                  isNew={index === 0 && newBlocksCount > 0}
                />
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Latest Transactions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">Latest Transactions</h2>
              {newTransactionsCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-accent-purple text-white text-xs rounded-full animate-pulse">
                  +{newTransactionsCount} new
                </span>
              )}
            </div>
            <Link 
              to="/transactions" 
              className="text-primary text-sm hover:underline"
              onClick={handleViewLatestTransactions}
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <TransactionItem 
                  key={tx.hash} 
                  transaction={tx} 
                  isNew={index === 0 && newTransactionsCount > 0}
                />
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <p>Loading transactions...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
