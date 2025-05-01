import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCopy, FaCheck, FaCode, FaFileContract } from 'react-icons/fa';
import apiService from '../services/api';

const ContractDetailsPage = () => {
  const { address } = useParams();
  const [contract, setContract] = useState(null);
  const [abi, setAbi] = useState(null);
  const [sourceCode, setSourceCode] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [functionInputs, setFunctionInputs] = useState({});
  const [functionResult, setFunctionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('code');
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    const fetchContractDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get contract ABI
        const abiData = await apiService.getContractAbi(address);
        setAbi(abiData);
        
        // Get contract source code
        const sourceData = await apiService.getContractSource(address);
        setSourceCode(sourceData);
        
        // Get contract details
        const addressType = await apiService.getAddressType(address);
        setContract({
          address,
          name: sourceData?.name || 'Unknown Contract',
          type: addressType?.type || 'contract',
          verified: !!sourceData
        });
      } catch (err) {
        console.error('Error fetching contract details:', err);
        setError('Failed to load contract details. The contract may not be verified.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContractDetails();
  }, [address]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleFunctionSelect = (func) => {
    setSelectedFunction(func);
    setFunctionResult(null);
    
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
      // Prepare parameters
      const params = selectedFunction.inputs.map(input => functionInputs[input.name]);
      
      // Call the contract function
      const result = await apiService.interactWithContract(
        address,
        selectedFunction.name,
        params
      );
      
      setFunctionResult(result);
    } catch (err) {
      console.error('Error executing contract function:', err);
      setError(`Failed to execute function: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Group ABI functions by type
  const groupedFunctions = React.useMemo(() => {
    if (!abi) return {};
    
    return abi.reduce((acc, item) => {
      if (item.type === 'function') {
        const group = item.stateMutability === 'view' || item.stateMutability === 'pure' 
          ? 'read' 
          : 'write';
        
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
      }
      return acc;
    }, {});
  }, [abi]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {contract?.name || 'Contract'}
              {contract?.verified && (
                <span className="ml-2 px-2 py-1 bg-green-900 bg-opacity-20 text-green-400 text-xs rounded-full">
                  Verified
                </span>
              )}
            </h1>
            <div className="flex items-center text-gray-400">
              <span className="font-mono text-sm break-all">{address}</span>
              <button 
                className="ml-2 text-gray-400 hover:text-white focus:outline-none"
                onClick={() => copyToClipboard(address)}
              >
                {copiedText === address ? <FaCheck size={14} /> : <FaCopy size={14} />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-700 mb-6">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'code' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('code')}
            >
              <FaCode className="inline mr-2" />
              Source Code
            </button>
            <button
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'interact' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('interact')}
            >
              <FaFileContract className="inline mr-2" />
              Interact
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 p-4 rounded-lg mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {activeTab === 'code' && (
          <div>
            {sourceCode ? (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Contract Source Code</h2>
                  <button 
                    className="text-gray-400 hover:text-white focus:outline-none flex items-center"
                    onClick={() => copyToClipboard(sourceCode.sourceCode)}
                  >
                    <FaCopy size={14} className="mr-1" />
                    <span className="text-sm">Copy Code</span>
                  </button>
                </div>
                <div className="bg-dark-200 p-4 rounded-lg overflow-auto max-h-[600px]">
                  <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                    {sourceCode.sourceCode}
                  </pre>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-md font-semibold mb-2">Contract Details</h3>
                    <div className="bg-dark-200 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-400">Contract Name:</div>
                        <div>{sourceCode.name}</div>
                        
                        <div className="text-gray-400">Compiler Version:</div>
                        <div>v{sourceCode.compilerVersion}</div>
                        
                        <div className="text-gray-400">Optimization:</div>
                        <div>{sourceCode.optimization ? `Enabled (${sourceCode.runs} runs)` : 'Disabled'}</div>
                        
                        <div className="text-gray-400">License:</div>
                        <div>{sourceCode.license}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-semibold mb-2">ABI</h3>
                    <div className="bg-dark-200 p-4 rounded-lg overflow-auto max-h-[200px]">
                      <pre className="text-gray-300 font-mono text-xs">
                        {JSON.stringify(abi, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400 mb-4">This contract is not verified.</p>
                <a href="/verify-contract" className="btn btn-primary">
                  Verify Contract
                </a>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'interact' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h2 className="text-lg font-semibold mb-4">Contract Functions</h2>
              
              {!abi ? (
                <div className="bg-dark-200 p-4 rounded-lg">
                  <p className="text-gray-400">
                    This contract is not verified. Verify the contract to interact with it.
                  </p>
                </div>
              ) : (
                <div>
                  {groupedFunctions.read && groupedFunctions.read.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-md font-semibold mb-2 text-blue-400">Read Functions</h3>
                      <div className="space-y-2">
                        {groupedFunctions.read.map((func, index) => (
                          <button
                            key={index}
                            className={`w-full text-left px-3 py-2 rounded-lg ${
                              selectedFunction && selectedFunction.name === func.name
                                ? 'bg-blue-900 bg-opacity-30 border border-blue-700'
                                : 'bg-dark-200 hover:bg-dark-300'
                            }`}
                            onClick={() => handleFunctionSelect(func)}
                          >
                            <span className="font-mono text-sm">
                              {func.name}({func.inputs.map(input => `${input.type} ${input.name}`).join(', ')})
                              {func.outputs && func.outputs.length > 0 && (
                                <span className="text-gray-400">
                                  {' → '}
                                  {func.outputs.map(output => output.type).join(', ')}
                                </span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {groupedFunctions.write && groupedFunctions.write.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold mb-2 text-orange-400">Write Functions</h3>
                      <div className="space-y-2">
                        {groupedFunctions.write.map((func, index) => (
                          <button
                            key={index}
                            className={`w-full text-left px-3 py-2 rounded-lg ${
                              selectedFunction && selectedFunction.name === func.name
                                ? 'bg-orange-900 bg-opacity-30 border border-orange-700'
                                : 'bg-dark-200 hover:bg-dark-300'
                            }`}
                            onClick={() => handleFunctionSelect(func)}
                          >
                            <span className="font-mono text-sm">
                              {func.name}({func.inputs.map(input => `${input.type} ${input.name}`).join(', ')})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              {selectedFunction ? (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    {selectedFunction.name}
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      {selectedFunction.stateMutability === 'view' || selectedFunction.stateMutability === 'pure'
                        ? '(Read Function)'
                        : '(Write Function)'}
                    </span>
                  </h2>
                  
                  <div className="bg-dark-200 p-4 rounded-lg mb-6">
                    {selectedFunction.inputs.length > 0 ? (
                      <div className="space-y-4">
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
                              className="w-full px-3 py-2 bg-dark-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">This function doesn't require any inputs.</p>
                    )}
                    
                    <div className="mt-4">
                      <button
                        onClick={executeFunction}
                        disabled={isExecuting}
                        className={`px-4 py-2 rounded-lg ${
                          selectedFunction.stateMutability === 'view' || selectedFunction.stateMutability === 'pure'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-orange-600 hover:bg-orange-700'
                        } text-white`}
                      >
                        {isExecuting ? 'Executing...' : 'Execute'}
                      </button>
                    </div>
                  </div>
                  
                  {functionResult !== null && (
                    <div>
                      <h3 className="text-md font-semibold mb-2">Result</h3>
                      <div className="bg-dark-200 p-4 rounded-lg overflow-auto max-h-[200px]">
                        <pre className="text-gray-300 font-mono text-sm">
                          {typeof functionResult === 'object'
                            ? JSON.stringify(functionResult, null, 2)
                            : String(functionResult)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-dark-200 p-6 rounded-lg flex items-center justify-center h-full">
                  <p className="text-gray-400">Select a function to interact with the contract.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ContractDetailsPage;
