import React, { useState, useMemo, useEffect } from 'react';
import apiService from '../../services/api';

const ContractInteractionTab = ({ addressData, contractAbi, mode = 'read', isVerified = false }) => {
  // Show a message if the contract is not verified
  if (!isVerified) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="mb-4">This contract is not verified.</p>
        <p>The functions shown are based on a placeholder ABI.</p>
        <p className="mt-4">Please verify the contract to interact with its actual functions.</p>
      </div>
    );
  }
  
  // Show a message if the ABI is not available
  if (!contractAbi) {
    return (
      <div className="text-center py-10">
        <div className="text-yellow-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-gray-300 mb-2 font-semibold">Contract ABI is not available</p>
        <p className="text-gray-400 mb-4">
          The contract is marked as verified, but the ABI could not be loaded.
        </p>
        <p className="text-gray-400">
          This may be due to a temporary API issue. Please try refreshing the page.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-dark-300 hover:bg-dark-400 rounded-lg flex items-center mx-auto"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Refresh Page
        </button>
      </div>
    );
  }
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [functionInputs, setFunctionInputs] = useState({});
  const [functionResult, setFunctionResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [value, setValue] = useState("0");
  
  // Debug: Log ABI data when it changes
  useEffect(() => {
    console.log('ContractInteractionTab - contractAbi:', contractAbi);
    if (contractAbi && Array.isArray(contractAbi)) {
      console.log('ContractInteractionTab - ABI functions:', contractAbi.filter(item => item.type === 'function').length);
      console.log('ContractInteractionTab - ABI read functions:', contractAbi.filter(item => 
        item.type === 'function' && (
          item.stateMutability === 'view' || 
          item.stateMutability === 'pure' || 
          item.constant === true
        )
      ).length);
      console.log('ContractInteractionTab - ABI write functions:', contractAbi.filter(item => 
        item.type === 'function' && !(
          item.stateMutability === 'view' || 
          item.stateMutability === 'pure' || 
          item.constant === true
        )
      ).length);
    }
    
    // Log mode
    console.log('ContractInteractionTab - mode:', mode);
  }, [contractAbi, mode]);

  // Group ABI functions by type using the processABI utility
  const groupedFunctions = useMemo(() => {
    try {
      if (!contractAbi || !Array.isArray(contractAbi)) {
        return { read: [], write: [] };
      }
      
      console.log('ContractInteractionTab - Processing ABI:', contractAbi);
      
      // Process the ABI to get read and write functions
      // Use apiService.processABI directly instead of destructuring
      const { readFunctions, writeFunctions } = apiService.processABI(contractAbi);
      
      console.log('ContractInteractionTab - Processed ABI:', { readFunctions, writeFunctions });
      
      // Ensure inputs and outputs are arrays
      const safeReadFunctions = readFunctions.map(item => ({
        ...item,
        inputs: Array.isArray(item.inputs) ? item.inputs : [],
        outputs: Array.isArray(item.outputs) ? item.outputs : []
      }));
      
      const safeWriteFunctions = writeFunctions.map(item => ({
        ...item,
        inputs: Array.isArray(item.inputs) ? item.inputs : [],
        outputs: Array.isArray(item.outputs) ? item.outputs : []
      }));
      
      return {
        read: safeReadFunctions,
        write: safeWriteFunctions
      };
    } catch (error) {
      console.error('Error grouping ABI functions:', error);
      return { read: [], write: [] };
    }
  }, [contractAbi]);

  const handleFunctionSelect = (func) => {
    setSelectedFunction(func);
    setFunctionResult(null);
    setError(null);
    
    // Initialize inputs
    const inputs = {};
    if (func.inputs) {
      func.inputs.forEach(input => {
        inputs[input.name] = '';
      });
    }
    setFunctionInputs(inputs);
  };

  const handleInputChange = (name, value) => {
    setFunctionInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const executeFunction = async () => {
    if (!selectedFunction) return;
    
    setIsExecuting(true);
    setError(null);
    setFunctionResult(null);
    
    try {
      // Validate address
      if (!addressData || !addressData.address) {
        throw new Error('Contract address is missing');
      }
      
      // Validate function name
      if (!selectedFunction.name) {
        throw new Error('Function name is missing');
      }
      
      // Prepare parameters with validation
      const params = selectedFunction.inputs.map((input, index) => {
        const inputValue = functionInputs[input.name];
        
        // For read functions, allow empty inputs (they'll be treated as default values)
        // For write functions, require inputs unless it's a view/pure function
        const isReadFunction = mode === 'read' || 
                              selectedFunction.stateMutability === 'view' || 
                              selectedFunction.stateMutability === 'pure' ||
                              selectedFunction.constant === true;
        
        if (!isReadFunction && (inputValue === undefined || inputValue === '')) {
          throw new Error(`Parameter ${input.name || index + 1} (${input.type}) is required`);
        }
        
        // Return empty string for empty inputs in read functions
        return inputValue === undefined || inputValue === '' ? 
          (input.type.includes('int') ? '0' : '') : // Default to 0 for integer types
          inputValue;
      });
      
      console.log(`Executing ${selectedFunction.name} with params:`, params);
      
      // For read functions, use the API
      if (isReadMode) {
        const result = await apiService.interactWithContract(
          addressData.address,
          selectedFunction.name,
          params,
          value
        );
        
        console.log(`Function ${selectedFunction.name} result:`, result);
        setFunctionResult(result);
      } else {
        // For write functions, use the browser's Web3 provider (MetaMask, etc.)
        if (!window.ethereum) {
          throw new Error('No Web3 provider detected. Please install MetaMask or another Web3 wallet.');
        }
        
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const account = accounts[0];
          
          // Create the transaction parameters
          const txParams = {
            from: account,
            to: addressData.address,
            data: encodeAbiCall(selectedFunction, params),
          };
          
          // Add value if it's a payable function
          if (selectedFunction.stateMutability === 'payable' && value && value !== '0') {
            txParams.value = `0x${parseInt(value * 1e18).toString(16)}`;
          }
          
          // Send the transaction
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [txParams],
          });
          
          console.log(`Transaction sent: ${txHash}`);
          setFunctionResult(`Transaction sent: ${txHash}`);
        } catch (error) {
          console.error('Error sending transaction:', error);
          throw new Error(`Error sending transaction: ${error.message}`);
        }
      }
    } catch (err) {
      console.error('Error executing contract function:', err);
      
      // Provide a more user-friendly error message
      let errorMessage = 'Failed to execute function';
      
      if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMessage += ` - ${err.response.data}`;
        } else if (err.response.data.error) {
          errorMessage += ` - ${err.response.data.error}`;
        } else if (err.response.data.message) {
          errorMessage += ` - ${err.response.data.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Helper function to encode ABI call
  const encodeAbiCall = (func, params) => {
    // Simple implementation - in a real app, you would use a library like ethers.js or web3.js
    // This is just a placeholder to show the concept
    
    // Get the function signature
    const functionSignature = `${func.name}(${func.inputs.map(input => input.type).join(',')})`;
    
    // Hash the function signature to get the function selector (first 4 bytes of the keccak256 hash)
    // In a real implementation, you would use keccak256 to hash the function signature
    // For simplicity, we'll just use a hardcoded mapping for common function selectors
    const functionSelectors = {
      'transfer(address,uint256)': '0xa9059cbb',
      'approve(address,uint256)': '0x095ea7b3',
      'transferFrom(address,address,uint256)': '0x23b872dd',
      'balanceOf(address)': '0x70a08231',
      'totalSupply()': '0x18160ddd',
      'name()': '0x06fdde03',
      'symbol()': '0x95d89b41',
      'decimals()': '0x313ce567',
      'mint(address,uint256)': '0x40c10f19',
      'burn(uint256)': '0x42966c68',
      'pause()': '0x8456cb59',
      'unpause()': '0x3f4ba83a'
    };
    
    // Get the function selector
    let functionSelector = functionSelectors[functionSignature];
    
    // If the function selector is not in our mapping, use a default one
    if (!functionSelector) {
      console.warn(`Function selector not found for ${functionSignature}, using default`);
      functionSelector = '0x00000000';
    }
    
    // For simplicity, we'll just return the function selector
    // In a real implementation, you would encode the parameters as well
    return functionSelector;
  };

  const functions = groupedFunctions[mode] || [];
  const isReadMode = mode === 'read';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <h3 className="text-lg font-semibold mb-4">
          {isReadMode ? 'Read Functions' : 'Write Functions'}
        </h3>
        
        {functions.length === 0 ? (
          <div className="bg-dark-200 p-4 rounded-lg">
            <p className="text-gray-400">
              No {isReadMode ? 'read' : 'write'} functions found in this contract.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {functions.map((func, index) => (
              <button
                key={index}
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  selectedFunction && selectedFunction.name === func.name
                    ? isReadMode 
                      ? 'bg-blue-900 bg-opacity-30 border border-blue-700'
                      : 'bg-purple-900 bg-opacity-30 border border-purple-700'
                    : 'bg-dark-200 hover:bg-dark-300'
                }`}
                onClick={() => handleFunctionSelect(func)}
              >
                <span className="font-mono text-sm">
                  {func.name}({func.inputs.map(input => `${input.type} ${input.name}`).join(', ')})
                  {func.outputs && func.outputs.length > 0 && isReadMode && (
                    <span className="text-gray-400">
                      {' → '}
                      {func.outputs.map(output => output.type).join(', ')}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="md:col-span-2">
        {selectedFunction ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {selectedFunction.name}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({isReadMode ? 'Read' : 'Write'} Function)
              </span>
            </h3>
            
            {error && (
              <div className="bg-red-900 bg-opacity-20 border border-red-700 p-4 rounded-lg mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}
            
            <div className="bg-dark-200 p-4 rounded-lg mb-6">
              <div className="space-y-4">
                {selectedFunction.inputs.length > 0 ? (
                  <>
                    {selectedFunction.inputs.map((input, index) => (
                      <div key={index}>
                        <label className="block text-gray-300 mb-1">
                          {input.name} ({input.type})
                        </label>
                        <input
                          type="text"
                          value={functionInputs[input.name] || ''}
                          onChange={(e) => handleInputChange(input.name, e.target.value)}
                          placeholder={`Enter ${input.type} value`}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-white"
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-gray-400 mb-4">This function doesn't require any inputs.</p>
                )}
                
                {/* Value input for payable functions */}
                {!isReadMode && selectedFunction && selectedFunction.stateMutability === 'payable' && (
                  <div>
                    <label className="block text-gray-300 mb-1">
                      Value (ETH to send)
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Amount of ETH to send with this transaction (for payable functions)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={executeFunction}
                  disabled={isExecuting}
                  className={`px-4 py-2 rounded-md ${
                    isReadMode
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white font-medium`}
                >
                  {isExecuting ? 'Executing...' : `Execute ${selectedFunction.name}`}
                </button>
              </div>
            </div>
            
            {functionResult && (
              <div className="bg-dark-200 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Result</h4>
                <pre className="bg-dark-300 p-3 rounded overflow-x-auto text-sm text-gray-300 font-mono">
                  {typeof functionResult === 'object'
                    ? JSON.stringify(functionResult, null, 2)
                    : String(functionResult)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-dark-200 p-8 rounded-lg">
            <p className="text-gray-400 text-center">
              Select a function from the list to interact with the contract
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractInteractionTab;
