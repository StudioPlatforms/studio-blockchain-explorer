import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCode, FaCopy, FaCheck, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

/**
 * Component for displaying transaction input data tab
 */
const TransactionDataTab = ({ transaction, decodedData, copiedText, copyToClipboard }) => {
  const [dataFormat, setDataFormat] = useState('raw'); // 'raw' or 'utf8'
  
  // Get input data (handle both data and input field names)
  const inputData = transaction.data || transaction.input || '0x';
  
  // Check if there's any data
  const hasData = inputData && inputData !== '0x';
  
  // Convert hex to UTF-8 (for text view)
  const hexToUtf8 = (hex) => {
    try {
      if (!hex || hex === '0x') return '';
      
      // Remove '0x' prefix if present
      const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
      
      // Convert hex to bytes
      let bytes = [];
      for (let i = 0; i < cleanHex.length; i += 2) {
        bytes.push(parseInt(cleanHex.substr(i, 2), 16));
      }
      
      // Convert bytes to UTF-8 string
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(new Uint8Array(bytes));
    } catch (error) {
      console.error('Error converting hex to UTF-8:', error);
      return '[Error decoding UTF-8]';
    }
  };
  
  // Format the data for display
  const formattedData = dataFormat === 'utf8' ? hexToUtf8(inputData) : inputData;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card mb-8"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Input Data</h2>
        
        {hasData && (
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                dataFormat === 'raw' 
                  ? 'bg-primary text-white' 
                  : 'bg-dark-200 text-gray-400 hover:text-white'
              }`}
              onClick={() => setDataFormat('raw')}
            >
              Hex
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                dataFormat === 'utf8' 
                  ? 'bg-primary text-white' 
                  : 'bg-dark-200 text-gray-400 hover:text-white'
              }`}
              onClick={() => setDataFormat('utf8')}
            >
              UTF-8
            </button>
            <button 
              className="px-3 py-1 rounded-md text-sm bg-dark-200 text-gray-400 hover:text-white"
              onClick={() => copyToClipboard(inputData)}
            >
              {copiedText === inputData ? <FaCheck size={12} /> : <FaCopy size={12} />}
            </button>
          </div>
        )}
      </div>
      
      {!hasData ? (
        <div className="text-center py-10 text-gray-400">
          No input data for this transaction
        </div>
      ) : (
        <div className="bg-dark-200 p-4 rounded-lg">
          <div className="flex items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-dark-100 flex items-center justify-center mr-3">
              <FaCode className="text-gray-400" />
            </div>
            <div>
              <h3 className="font-medium">Transaction Input Data</h3>
              <p className="text-sm text-gray-400">
                {dataFormat === 'raw' 
                  ? 'Hexadecimal input data sent with the transaction' 
                  : 'UTF-8 representation of the input data (may contain non-printable characters)'}
              </p>
            </div>
          </div>
          
          <div className="font-mono text-sm overflow-x-auto bg-dark-100 p-4 rounded-lg">
            {dataFormat === 'raw' ? (
              <div className="break-all">{formattedData}</div>
            ) : (
              <pre className="whitespace-pre-wrap">{formattedData}</pre>
            )}
          </div>
          
          {dataFormat === 'raw' && inputData.length > 10 && (
            <div className="mt-4 text-sm text-gray-400">
              {Math.floor((inputData.length - 2) / 2).toLocaleString()} bytes
            </div>
          )}
        </div>
      )}
      
      {/* Decoded Function Data Section */}
      {hasData && inputData.length >= 10 && (
        <div className="mt-6 bg-dark-200 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-accent-teal bg-opacity-20 flex items-center justify-center mr-3 mt-1">
              <FaExchangeAlt className="text-accent-teal" />
            </div>
            <div className="w-full">
              <h3 className="text-white font-medium mb-2">Decoded Function Call</h3>
              
              {decodedData ? (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-gray-300 text-sm">
                        Function: <span className="font-mono text-accent-teal">{decodedData.functionName}</span>
                      </p>
                      {decodedData.functionSignature && (
                        <p className="text-gray-400 text-xs mt-1">
                          Signature: <span className="font-mono">{decodedData.functionSignature}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-teal bg-opacity-20 text-accent-teal">
                        <FaInfoCircle className="mr-1" size={10} />
                        Decoded
                      </span>
                    </div>
                  </div>
                  
                  {/* Human-readable description */}
                  {decodedData.description && (
                    <div className="bg-dark-100 p-3 rounded-lg mb-4">
                      <p className="text-white">
                        {decodedData.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Function parameters */}
                  {decodedData.params && decodedData.params.length > 0 && (
                    <div>
                      <h4 className="text-gray-300 text-sm mb-2">Parameters:</h4>
                      <div className="bg-dark-100 p-3 rounded-lg">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-400 border-b border-gray-700">
                              <th className="pb-2 pr-4">Name</th>
                              <th className="pb-2 pr-4">Type</th>
                              <th className="pb-2">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {decodedData.params.map((param, index) => (
                              <tr key={index} className="border-b border-gray-800 last:border-0">
                                <td className="py-2 pr-4 font-mono text-gray-300">
                                  {param.name || `param${index}`}
                                </td>
                                <td className="py-2 pr-4 text-gray-400">
                                  {param.type}
                                </td>
                                <td className="py-2 font-mono break-all">
                                  {param.type === 'address' ? (
                                    <Link 
                                      to={`/address/${param.value}`} 
                                      className="text-primary hover:underline"
                                    >
                                      {param.value}
                                    </Link>
                                  ) : (
                                    <span className="text-gray-300">
                                      {typeof param.value === 'object' 
                                        ? JSON.stringify(param.value) 
                                        : String(param.value)
                                      }
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 text-sm mb-3">
                    The first 4 bytes of the input data (<span className="font-mono">{inputData.substring(0, 10)}</span>) represent the function selector.
                  </p>
                  
                  <div className="bg-dark-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">
                      {transaction.to ? (
                        <>
                          This transaction calls a function on contract <Link to={`/address/${transaction.to}`} className="text-primary hover:underline">{transaction.to}</Link>, but the function could not be decoded.
                          <br /><br />
                          This may be because the contract is not verified, or the function signature is not recognized.
                        </>
                      ) : (
                        'This is a contract creation transaction. The input data contains the bytecode of the contract being deployed.'
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TransactionDataTab;
