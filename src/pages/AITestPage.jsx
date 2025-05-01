import { useState, useEffect } from 'react';
import blockchainAIApi from '../services/api/blockchainAI.js';
import apiService from '../services/api';

const AITestPage = () => {
  const [loading, setLoading] = useState(true);
  const [aiData, setAiData] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [testMode, setTestMode] = useState('full'); // 'full', 'network', 'blocks', 'transactions'

  // Function to add logs
  const addLog = (message, type = 'info') => {
    setLogs(prevLogs => [
      { id: Date.now(), message, type, timestamp: new Date().toLocaleTimeString() },
      ...prevLogs
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
      
      addLog(`API Health Response: ${JSON.stringify(healthData)}`, 'success');
      
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

  // Function to fetch AI data based on test mode
  const fetchAIData = async () => {
    setLoading(true);
    setError(null);
    setAiData(null);
    
    try {
      addLog(`Starting AI data fetch in ${testMode} mode...`, 'info');
      
      // Test API connection first
      const apiConnected = await testApiConnection();
      if (!apiConnected) {
        addLog('Skipping AI data fetch due to API connection failure', 'warning');
        setError('API connection failed');
        setLoading(false);
        return;
      }
      
      // Fetch AI data based on test mode
      let result;
      
      switch (testMode) {
        case 'full':
          addLog('Fetching full AI dashboard data...', 'info');
          result = await blockchainAIApi.getAiDashboardData();
          break;
          
        // For future implementation of partial testing modes
        default:
          addLog('Fetching full AI dashboard data...', 'info');
          result = await blockchainAIApi.getAiDashboardData();
      }
      
      // Log the result
      addLog(`AI data fetch completed. Simulated: ${result.isSimulated}`, result.isSimulated ? 'warning' : 'success');
      
      // Log key metrics
      addLog(`Learning Cycles: ${result.learningCycles}`, 'info');
      addLog(`Blocks Processed: ${result.blocksProcessed}`, 'info');
      addLog(`Prediction Accuracy: ${result.predictionAccuracy}%`, 'info');
      addLog(`Gas Optimization: ${result.gasOptimization}%`, 'info');
      
      // Set the data
      setAiData(result);
    } catch (error) {
      addLog(`Error fetching AI data: ${error.message}`, 'error');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchAIData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Service Test Page</h1>
      <p className="text-gray-300 mb-8">
        This page tests the outputs of the blockchainAI.js service to diagnose issues with the AI Dashboard.
      </p>
      
      {/* Test Controls */}
      <div className="card mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <select 
            className="bg-dark-200 text-white px-4 py-2 rounded-md"
            value={testMode}
            onChange={(e) => setTestMode(e.target.value)}
          >
            <option value="full">Full AI Dashboard Data</option>
            <option value="network" disabled>Network Stats Only</option>
            <option value="blocks" disabled>Blocks Only</option>
            <option value="transactions" disabled>Transactions Only</option>
          </select>
          
          <button 
            className="bg-primary text-white px-4 py-2 rounded-md"
            onClick={fetchAIData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Run Test'}
          </button>
          
          <button 
            className="bg-dark-200 text-white px-4 py-2 rounded-md"
            onClick={() => setLogs([])}
          >
            Clear Logs
          </button>
        </div>
        
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Status:</span>
          {loading ? (
            <span className="text-yellow-400">Loading...</span>
          ) : error ? (
            <span className="text-red-400">Error: {error}</span>
          ) : aiData ? (
            <span className={aiData.isSimulated ? "text-yellow-400" : "text-green-400"}>
              {aiData.isSimulated ? "Simulated Data" : "Real Data"}
            </span>
          ) : (
            <span className="text-gray-400">No data</span>
          )}
        </div>
      </div>
      
      {/* Results and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Results */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loading-spinner"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900 bg-opacity-20 text-red-300 p-4 rounded-md">
              {error}
            </div>
          ) : aiData ? (
            <div className="space-y-4">
              <div className={`px-3 py-1 inline-block rounded-full text-sm mb-4 ${aiData.isSimulated ? 'bg-yellow-800 text-yellow-200' : 'bg-green-800 text-green-200'}`}>
                {aiData.isSimulated ? 'Simulated Data' : 'Real-time Data'}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-200 p-4 rounded-md">
                  <h3 className="text-sm text-gray-400 mb-1">Learning Cycles</h3>
                  <p className="text-2xl font-mono">{aiData.learningCycles.toLocaleString()}</p>
                </div>
                
                <div className="bg-dark-200 p-4 rounded-md">
                  <h3 className="text-sm text-gray-400 mb-1">Blocks Processed</h3>
                  <p className="text-2xl font-mono">{aiData.blocksProcessed.toLocaleString()}</p>
                </div>
                
                <div className="bg-dark-200 p-4 rounded-md">
                  <h3 className="text-sm text-gray-400 mb-1">Prediction Accuracy</h3>
                  <p className="text-2xl font-mono">{aiData.predictionAccuracy}%</p>
                </div>
                
                <div className="bg-dark-200 p-4 rounded-md">
                  <h3 className="text-sm text-gray-400 mb-1">Gas Optimization</h3>
                  <p className="text-2xl font-mono">{aiData.gasOptimization}%</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Activity Feed</h3>
                <div className="bg-dark-200 p-4 rounded-md max-h-64 overflow-y-auto">
                  {aiData.activityFeed && aiData.activityFeed.length > 0 ? (
                    <ul className="space-y-2">
                      {aiData.activityFeed.map((activity) => (
                        <li key={activity.id} className="border-b border-gray-700 pb-2">
                          <p className="text-white">{activity.message}</p>
                          <p className="text-sm text-gray-400">{activity.timestamp}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No activity data</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Neural Network</h3>
                <div className="bg-dark-200 p-4 rounded-md">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm text-gray-400">Nodes</h4>
                      <p className="text-xl font-mono">{aiData.neuralNetwork.nodes}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-400">Connections</h4>
                      <p className="text-xl font-mono">{aiData.neuralNetwork.connections}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-400">Layers</h4>
                      <p className="text-xl font-mono">{aiData.neuralNetwork.layers}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  className="bg-dark-200 text-white px-4 py-2 rounded-md"
                  onClick={() => {
                    const dataStr = JSON.stringify(aiData, null, 2);
                    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataUri);
                    downloadAnchor.setAttribute('download', 'ai-data.json');
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    document.body.removeChild(downloadAnchor);
                  }}
                >
                  Download Full JSON
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No data available. Run a test to see results.</p>
          )}
        </div>
        
        {/* Logs */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="bg-dark-200 p-4 rounded-md h-[600px] overflow-y-auto font-mono text-sm">
            {logs.length > 0 ? (
              <div className="space-y-2">
                {logs.map(log => (
                  <div 
                    key={log.id} 
                    className={`
                      ${log.type === 'error' ? 'text-red-400' : 
                        log.type === 'warning' ? 'text-yellow-400' : 
                        log.type === 'success' ? 'text-green-400' : 
                        'text-gray-300'}
                    `}
                  >
                    <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No logs available.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Raw Data Viewer */}
      {aiData && (
        <div className="card p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Raw Data</h2>
          <div className="bg-dark-200 p-4 rounded-md overflow-x-auto">
            <pre className="text-gray-300 text-sm">
              {JSON.stringify(aiData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITestPage;
