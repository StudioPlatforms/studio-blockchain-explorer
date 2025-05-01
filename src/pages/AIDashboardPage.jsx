import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import blockchainAIApi from '../services/api/blockchainAI.js';
import apiService from '../services/api';

// Import components
import NeuralNetworkVisualizer from '../components/ai-visualization/NeuralNetworkVisualizer';
import createChartConfigs from '../components/ai-visualization/ChartConfigs';
import DashboardTabs from '../components/ai-visualization/DashboardTabs';
import ActivityFeed from '../components/ai-visualization/ActivityFeed';

// Register Chart.js components
Chart.register(...registerables);

const AIDashboardPage = () => {
  // Main state for UI rendering
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [animatingFields, setAnimatingFields] = useState({});
  const [prevAiData, setPrevAiData] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Chart zoom level state
  const [blockChartZoom, setBlockChartZoom] = useState('daily'); // 'daily', 'monthly', 'yearly'
  const [learningChartZoom, setLearningChartZoom] = useState('daily'); // 'daily', 'monthly', 'yearly'
  
  // Function to add logs (for debugging)
  const addLog = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    setLogs(prevLogs => [
      { id: Date.now(), message, type, timestamp: new Date().toLocaleTimeString() },
      ...prevLogs.slice(0, 99) // Keep only the last 100 logs
    ]);
  };

  // Function to test API connection
  const testApiConnection = async () => {
    try {
      addLog('Testing API connection...', 'info');
      const baseUrl = apiService.getBaseUrl ? apiService.getBaseUrl() : 'https://mainnetindexer.studio-blockchain.com';
      addLog(`API Base URL: ${baseUrl}`, 'info');
      
      const healthResponse = await fetch(`${baseUrl}/health`);
      const healthData = await healthResponse.json();
      
      if (healthData && healthData.status === 'ok') {
        addLog('API connection successful!', 'success');
        return true;
      } else {
        addLog(`API connection failed: ${JSON.stringify(healthData)}`, 'error');
        return false;
      }
    } catch (error) {
      addLog(`API connection test failed: ${error.message}`, 'error');
      return false;
    }
  };

  // Fetch AI dashboard data
  const fetchAiDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      addLog('Starting AI dashboard data fetch...', 'info');
      
      // Test API connection first
      const apiConnected = await testApiConnection();
      if (!apiConnected) {
        addLog('Skipping AI data fetch due to API connection failure', 'warning');
        setError('API connection failed');
        setLoading(false);
        return;
      }
      
      // Fetch AI dashboard data directly from blockchainAI.js
      addLog('Fetching AI dashboard data...', 'info');
      const result = await blockchainAIApi.getAiDashboardData();
      
      // Log the result
      addLog(`AI data fetch completed. Simulated: ${result.isSimulated}`, result.isSimulated ? 'warning' : 'success');
      
      // Log key metrics
      addLog(`Learning Cycles: ${result.learningCycles}`, 'info');
      addLog(`Blocks Processed: ${result.blocksProcessed}`, 'info');
      addLog(`Prediction Accuracy: ${result.predictionAccuracy}%`, 'info');
      addLog(`Gas Optimization: ${result.gasOptimization}%`, 'info');
      
      // Store previous data for animations
      setPrevAiData(aiData);
      
      // Check which fields have changed to animate them
      if (aiData) {
        const newAnimatingFields = {};
        
        // Check key metrics
        if (aiData.learningCycles !== result.learningCycles) {
          newAnimatingFields.learningCycles = true;
          addLog(`Learning cycles changed: ${aiData.learningCycles} -> ${result.learningCycles}`, 'info');
        }
        if (aiData.blocksProcessed !== result.blocksProcessed) {
          newAnimatingFields.blocksProcessed = true;
          addLog(`Blocks processed changed: ${aiData.blocksProcessed} -> ${result.blocksProcessed}`, 'info');
        }
        if (aiData.predictionAccuracy !== result.predictionAccuracy) {
          newAnimatingFields.predictionAccuracy = true;
          addLog(`Prediction accuracy changed: ${aiData.predictionAccuracy} -> ${result.predictionAccuracy}`, 'info');
        }
        if (aiData.gasOptimization !== result.gasOptimization) {
          newAnimatingFields.gasOptimization = true;
          addLog(`Gas optimization changed: ${aiData.gasOptimization} -> ${result.gasOptimization}`, 'info');
        }
        
        // Set animating fields
        setAnimatingFields(newAnimatingFields);
        
        // Reset animation flags after animation duration
        setTimeout(() => {
          setAnimatingFields({});
        }, 1000);
      }
      
      // Set the data
      setAiData(result);
      setLoading(false);
      
    } catch (error) {
      addLog(`Error fetching AI dashboard data: ${error.message}`, 'error');
      setError(error.message);
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchAiDashboardData();
    
    // Set up polling to refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      addLog('Refreshing AI dashboard data...', 'info');
      fetchAiDashboardData();
    }, 30000);
    
    // Cleanup
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);
  
  // Get chart configurations with default empty data structure if aiData is null
  const chartConfigs = createChartConfigs(aiData || {
    blockPredictionData: { labels: [], predicted: [], actual: [] },
    transactionPriorityData: { labels: [], values: [] },
    gasOptimizationData: { labels: [], traditional: [], optimized: [] },
    learningProgressData: { labels: [], accuracy: [] }
  });
  const {
    blockPredictionChartConfig,
    transactionPriorityChartConfig,
    gasOptimizationChartConfig,
    learningProgressChartConfig
  } = chartConfigs;
  
  // Show loading spinner while data is being fetched
  if (loading && !aiData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="ai-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold mb-2 sm:mb-0">AI Neural Network Dashboard</h1>
          {aiData && (
            <div className={`px-3 py-1 rounded-full text-sm inline-flex items-center ${aiData.isSimulated ? 'bg-yellow-800 text-yellow-200' : 'bg-green-800 text-green-200'}`}>
              <span className="w-2 h-2 rounded-full mr-1.5 bg-current"></span>
              {aiData.isSimulated ? 'Simulated Data' : 'Real-time Data'}
            </div>
          )}
        </div>
        <p className="text-gray-300 mb-8">
          Explore Studio Blockchain's revolutionary on-chain neural networks that enable priority system gas fees, 
          optimize block processing, and continuously adapt to network conditions.
        </p>
      </motion.div>
      
      {/* Dashboard Tabs */}
      <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-tab">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">Learning Cycles</h3>
                  <p className={`text-2xl font-mono ${animatingFields.learningCycles ? 'animate-pulse text-primary' : ''}`}>
                    {aiData?.learningCycles.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-accent-teal bg-opacity-20 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">Blocks Processed</h3>
                  <p className={`text-2xl font-mono ${animatingFields.blocksProcessed ? 'animate-pulse text-accent-teal' : ''}`}>
                    {aiData?.blocksProcessed.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-accent-purple bg-opacity-20 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">Prediction Accuracy</h3>
                  <p className={`text-2xl font-mono ${animatingFields.predictionAccuracy ? 'animate-pulse text-accent-purple' : ''}`}>
                    {aiData?.predictionAccuracy || '0'}%
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">Gas Optimization</h3>
                  <p className={`text-2xl font-mono ${animatingFields.gasOptimization ? 'animate-pulse text-primary' : ''}`}>
                    {aiData?.gasOptimization || '0'}%
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Block Height Prediction</h3>
                <div className="flex space-x-2">
                  <button 
                    className={`px-2 py-1 text-xs rounded ${blockChartZoom === 'daily' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'}`}
                    onClick={() => setBlockChartZoom('daily')}
                  >
                    Daily
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded ${blockChartZoom === 'monthly' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'}`}
                    onClick={() => setBlockChartZoom('monthly')}
                  >
                    Monthly
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded ${blockChartZoom === 'yearly' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'}`}
                    onClick={() => setBlockChartZoom('yearly')}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <div className="h-80">
                {aiData && <Line 
                  data={blockChartZoom === 'daily' 
                    ? blockPredictionChartConfig.data 
                    : blockChartZoom === 'monthly'
                      ? {
                          labels: aiData.blockPredictionData.monthlyLabels || aiData.blockPredictionData.labels,
                          datasets: blockPredictionChartConfig.data.datasets
                        }
                      : {
                          labels: aiData.blockPredictionData.yearlyLabels || aiData.blockPredictionData.labels,
                          datasets: blockPredictionChartConfig.data.datasets
                        }
                  } 
                  options={blockPredictionChartConfig.options} 
                />}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">Gas Fee Optimization</h3>
              <div className="h-80">
                {aiData && <Bar data={gasOptimizationChartConfig.data} options={gasOptimizationChartConfig.options} />}
              </div>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="card lg:col-span-1"
            >
              <h3 className="text-lg font-semibold mb-4">Transaction Priority Distribution</h3>
              <div className="h-80">
                {aiData && <Doughnut data={transactionPriorityChartConfig.data} options={transactionPriorityChartConfig.options} />}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="card lg:col-span-1"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Network Learning Progress</h3>
                <div className="flex space-x-2">
                  <button 
                    className={`px-2 py-1 text-xs rounded ${learningChartZoom === 'daily' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'}`}
                    onClick={() => setLearningChartZoom('daily')}
                  >
                    Daily
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded ${learningChartZoom === 'monthly' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'}`}
                    onClick={() => setLearningChartZoom('monthly')}
                  >
                    Monthly
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded ${learningChartZoom === 'yearly' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'}`}
                    onClick={() => setLearningChartZoom('yearly')}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <div className="h-80">
                {aiData && <Line 
                  data={learningChartZoom === 'daily' 
                    ? learningProgressChartConfig.data 
                    : learningChartZoom === 'monthly'
                      ? {
                          labels: aiData.learningProgressData.monthlyLabels || aiData.learningProgressData.labels,
                          datasets: learningProgressChartConfig.data.datasets
                        }
                      : {
                          labels: aiData.learningProgressData.yearlyLabels || aiData.learningProgressData.labels,
                          datasets: learningProgressChartConfig.data.datasets
                        }
                  } 
                  options={learningProgressChartConfig.options} 
                />}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="card lg:col-span-1"
            >
              {aiData && <ActivityFeed aiData={aiData} />}
            </motion.div>
          </div>
          
          {/* Refresh Button */}
          <div className="mt-8 flex justify-center">
            <button 
              className="bg-primary text-white px-4 py-2 rounded-md"
              onClick={fetchAiDashboardData}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      )}
      
      {/* Neural Network Visualization Tab */}
      {activeTab === 'visualization' && (
        <div className="visualization-tab">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="card mb-6"
          >
            <h3 className="text-lg font-semibold mb-4">Neural Network Visualization</h3>
            {/* Pass the neural network data from the API to the visualizer */}
            <NeuralNetworkVisualizer 
              isLoading={loading && !aiData} 
              neuralNetwork={aiData?.neuralNetwork} 
            />
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">Network Architecture</h3>
              {loading && !aiData ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Input Layer</h4>
                    <p className="text-sm">
                      {/* Calculate input nodes based on transaction types */}
                      {aiData?.transactionPriorityData?.labels?.length || 0} input nodes processing 
                      {aiData?.transactionPriorityData?.labels?.join(', ') || 'transaction data'}, 
                      block metadata, and network conditions
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Hidden Layers</h4>
                    <p className="text-sm">
                      {/* Use actual layers from neural network data */}
                      {aiData?.neuralNetwork?.layers || 0} layers with 
                      {' '}{Math.floor((aiData?.neuralNetwork?.nodes || 0) / Math.max(1, aiData?.neuralNetwork?.layers || 1))} 
                      {' '}nodes implementing deep learning algorithms for pattern recognition
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Output Layer</h4>
                    <p className="text-sm">
                      {/* Calculate output nodes based on network capabilities */}
                      4 nodes determining block optimization, transaction priority, 
                      gas optimization, and network adjustments
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Total Connections</h4>
                    <p className="text-sm">
                      {/* Use actual connections from neural network data */}
                      {aiData?.neuralNetwork?.connections?.toLocaleString() || 0} synaptic connections 
                      processing blockchain data
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Network Scale</h4>
                    <p className="text-sm">
                      {/* Use actual blocks processed */}
                      Scaled to process {aiData?.blocksProcessed?.toLocaleString() || 0} blocks with 
                      {' '}{Math.floor((aiData?.neuralNetwork?.nodes || 0) / 2)} parallel processing units
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">Learning Algorithm</h3>
              {loading && !aiData ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-4/5"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Type</h4>
                    <p className="text-sm">
                      {/* Adjust algorithm type based on prediction accuracy */}
                      Reinforcement learning with 
                      {aiData?.predictionAccuracy > 75 ? ' advanced' : ' standard'} backpropagation
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Optimization</h4>
                    <p className="text-sm">
                      {/* Adjust optimization based on gas optimization */}
                      Adaptive gradient descent with 
                      {aiData?.gasOptimization > 85 ? ' high' : ' standard'} momentum
                      {' '}({((aiData?.gasOptimization || 0) / 100).toFixed(2)})
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Activation Functions</h4>
                    <p className="text-sm">
                      {/* Adjust activation functions based on prediction accuracy and gas optimization */}
                      {aiData?.predictionAccuracy > 80 ? 'Leaky ReLU' : 'ReLU'} for hidden layers, 
                      {' '}{aiData?.gasOptimization > 80 ? 'Specialized Sigmoid' : 'Sigmoid'} for output layer
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Learning Rate</h4>
                    <p className="text-sm">
                      {/* Calculate learning rate based on prediction accuracy */}
                      Dynamic: {(0.001 + ((aiData?.predictionAccuracy || 0) / 10000)).toFixed(4)} - 
                      {' '}{(0.001 + ((aiData?.predictionAccuracy || 0) / 1000)).toFixed(4)} based on network conditions
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Training Cycles</h4>
                    <p className="text-sm">
                      {/* Use actual learning cycles and prediction accuracy */}
                      {aiData?.learningCycles?.toLocaleString() || 0} completed cycles with 
                      {' '}{aiData?.predictionAccuracy || 0}% accuracy
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">Network Capabilities</h3>
              {loading && !aiData ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-4/5"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Block Prediction</h4>
                    <p className="text-sm">
                      {/* Use actual prediction accuracy and blocks processed */}
                      Forecasts optimal block heights with {aiData?.predictionAccuracy || 0}% accuracy 
                      based on {aiData?.blocksProcessed?.toLocaleString() || 0} processed blocks
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Transaction Processing</h4>
                    <p className="text-sm">
                      {/* Calculate total transactions from transaction priority data */}
                      Prioritizes {aiData?.transactionPriorityData?.values?.reduce((a, b) => a + b, 0) || 0} 
                      {' '}transactions across {aiData?.transactionPriorityData?.labels?.length || 0} 
                      {' '}categories based on network impact
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Gas Optimization</h4>
                    <p className="text-sm">
                      {/* Use actual gas optimization */}
                      Achieves {aiData?.gasOptimization || 0}% gas optimization through 
                      neural analysis of transaction patterns
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Adaptive Learning</h4>
                    <p className="text-sm">
                      {/* Calculate improvement from initial to current accuracy */}
                      Improved from {aiData?.learningProgressData?.accuracy?.find(a => a !== null) || 60}% to 
                      {' '}{aiData?.predictionAccuracy || 0}% accuracy through continuous learning
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Network Efficiency</h4>
                    <p className="text-sm">
                      {/* Calculate blocks per layer and use gas optimization for efficiency */}
                      Processes {Math.floor((aiData?.blocksProcessed || 0) / Math.max(1, aiData?.neuralNetwork?.layers || 1)).toLocaleString()} 
                      {' '}blocks per layer with {aiData?.gasOptimization || 0}% efficiency
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Performance Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="metrics-tab">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Block Height Prediction</h3>
                <div className="flex space-x-2">
                  <button 
                    className={`px-2 py-1 text-xs rounded ${blockChartZoom === 'daily' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'}`}
                    onClick={() => setBlockChartZoom('daily')}
                  >
                    Daily
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded ${blockChartZoom === 'monthly' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'}`}
                    onClick={() => setBlockChartZoom('monthly')}
                  >
                    Monthly
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded ${blockChartZoom === 'yearly' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'}`}
                    onClick={() => setBlockChartZoom('yearly')}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <div className="h-80">
                {aiData && <Line 
                  data={blockChartZoom === 'daily' 
                    ? blockPredictionChartConfig.data 
                    : blockChartZoom === 'monthly'
                      ? {
                          labels: aiData.blockPredictionData.monthlyLabels || aiData.blockPredictionData.labels,
                          datasets: blockPredictionChartConfig.data.datasets
                        }
                      : {
                          labels: aiData.blockPredictionData.yearlyLabels || aiData.blockPredictionData.labels,
                          datasets: blockPredictionChartConfig.data.datasets
                        }
                  } 
                  options={blockPredictionChartConfig.options} 
                />}
              </div>
              <div className="mt-4 p-4 bg-dark-200 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">How It Works</h4>
                <p className="text-sm text-gray-300">
                  The neural network analyzes historical block data and current network conditions to predict optimal block heights.
                  This allows the network to dynamically adjust block production based on transaction volume and network congestion,
                  resulting in more efficient processing and reduced wait times.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">Gas Fee Optimization</h3>
              <div className="h-80">
                {aiData && <Bar data={gasOptimizationChartConfig.data} options={gasOptimizationChartConfig.options} />}
              </div>
              <div className="mt-4 p-4 bg-dark-200 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">How It Works</h4>
                <p className="text-sm text-gray-300">
                  Studio Blockchain's neural network optimizes transaction processing to minimize gas usage.
                  By analyzing transaction patterns and network conditions, it can process standard transactions
                  with priority system gas fees while maintaining network security and efficiency.
                </p>
              </div>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">Transaction Priority Distribution</h3>
              <div className="h-80">
                {aiData && <Doughnut data={transactionPriorityChartConfig.data} options={transactionPriorityChartConfig.options} />}
              </div>
              <div className="mt-4 p-4 bg-dark-200 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">How It Works</h4>
                <p className="text-sm text-gray-300">
                  Transactions are categorized into priority levels based on user-defined urgency and network impact.
                  Standard transactions (the majority) are processed with priority system gas fees, while higher priority transactions
                  can optionally include higher fees to expedite processing during high-demand periods.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Network Learning Progress</h3>
                <div className="flex space-x-2">
                  <button 
                    className={`px-2 py-1 text-xs rounded ${learningChartZoom === 'daily' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'}`}
                    onClick={() => setLearningChartZoom('daily')}
                  >
                    Daily
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded ${learningChartZoom === 'monthly' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'}`}
                    onClick={() => setLearningChartZoom('monthly')}
                  >
                    Monthly
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded ${learningChartZoom === 'yearly' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'}`}
                    onClick={() => setLearningChartZoom('yearly')}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <div className="h-80">
                {aiData && <Line 
                  data={learningChartZoom === 'daily' 
                    ? learningProgressChartConfig.data 
                    : learningChartZoom === 'monthly'
                      ? {
                          labels: aiData.learningProgressData.monthlyLabels || aiData.learningProgressData.labels,
                          datasets: learningProgressChartConfig.data.datasets
                        }
                      : {
                          labels: aiData.learningProgressData.yearlyLabels || aiData.learningProgressData.labels,
                          datasets: learningProgressChartConfig.data.datasets
                        }
                  } 
                  options={learningProgressChartConfig.options} 
                />}
              </div>
              <div className="mt-4 p-4 bg-dark-200 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">How It Works</h4>
                <p className="text-sm text-gray-300">
                  The neural network continuously learns from network activity, improving its prediction and optimization
                  capabilities over time. This chart shows the accuracy improvement of the network's predictions as it
                  processes more blocks and transactions.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mt-6 bg-red-900 bg-opacity-20 text-red-300 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-700 text-white px-4 py-2 rounded-md"
            onClick={fetchAiDashboardData}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default AIDashboardPage;
