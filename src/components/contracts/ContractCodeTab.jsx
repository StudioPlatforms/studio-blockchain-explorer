import React from 'react';
import { FaCopy, FaCheck, FaExclamationTriangle, FaSync } from 'react-icons/fa';

const ContractCodeTab = ({ contractSourceCode, contractAbi, copiedText, onCopyToClipboard }) => {
  // Log the props for debugging
  console.log('ContractCodeTab props:', { 
    contractSourceCode: contractSourceCode ? { 
      ...contractSourceCode, 
      sourceCode: contractSourceCode.sourceCode ? 'sourceCode exists' : 'no sourceCode',
      verified: contractSourceCode.verified
    } : null, 
    contractAbi: contractAbi ? 'ABI exists' : null 
  });
  
  // Handle case when source code is not available
  if (!contractSourceCode) {
    console.log('No contract source code available');
    return (
      <div className="text-center py-10">
        <FaExclamationTriangle className="text-yellow-400 text-4xl mx-auto mb-4" />
        <p className="text-gray-300 mb-2 font-semibold">No source code available for this contract</p>
        <p className="text-gray-400 mb-4">
          The contract is marked as verified, but the source code could not be loaded.
        </p>
        <p className="text-gray-400">
          This may be due to a temporary API issue. Please try refreshing the page.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-dark-300 hover:bg-dark-400 rounded-lg flex items-center mx-auto"
        >
          <FaSync className="mr-2" />
          Refresh Page
        </button>
      </div>
    );
  }
  
  // Check if this is a placeholder for an unverified contract
  if (!contractSourceCode.verified) {
    console.log('Contract source code is not verified:', contractSourceCode);
    return (
      <div className="text-center py-10 text-gray-400">
        <FaExclamationTriangle className="text-yellow-400 text-4xl mx-auto mb-4" />
        <p className="mb-4 font-semibold">This contract is not verified.</p>
        <p>The source code and ABI shown are placeholders based on the contract type.</p>
        <p className="mt-4">Please verify the contract to see the actual source code and ABI.</p>
      </div>
    );
  }
  
  // Handle case when ABI is not available
  if (!contractAbi) {
    return (
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Contract Source Code</h3>
          <button 
            className="text-gray-400 hover:text-white focus:outline-none flex items-center"
            onClick={() => onCopyToClipboard(contractSourceCode.sourceCode)}
          >
            {copiedText === contractSourceCode.sourceCode ? <FaCheck size={14} className="mr-1" /> : <FaCopy size={14} className="mr-1" />}
            <span className="text-sm">Copy Code</span>
          </button>
        </div>
        <div className="bg-dark-200 p-4 rounded-lg overflow-auto max-h-[600px]">
          <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
            {contractSourceCode.sourceCode}
          </pre>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-md font-semibold mb-2">Contract Details</h3>
            <div className="bg-dark-200 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-400">Contract Name:</div>
              <div>{contractSourceCode.contractName}</div>
              
              <div className="text-gray-400">Compiler Version:</div>
              <div>v{contractSourceCode.compilerVersion}</div>
              
              <div className="text-gray-400">Optimization:</div>
              <div>{contractSourceCode.optimizationUsed ? `Enabled (${contractSourceCode.runs} runs)` : 'Disabled'}</div>
              
              <div className="text-gray-400">EVM Version:</div>
              <div>{contractSourceCode.evmVersion || 'cancun'}</div>
              
              <div className="text-gray-400">License:</div>
              <div>{contractSourceCode.license}</div>
              
              {contractSourceCode.creatorAddress && (
                <>
                  <div className="text-gray-400">Creator:</div>
                  <div className="font-mono text-xs break-all">{contractSourceCode.creatorAddress}</div>
                </>
              )}
              
              {contractSourceCode.ownerAddress && contractSourceCode.ownerAddress !== contractSourceCode.creatorAddress && (
                <>
                  <div className="text-gray-400">Owner:</div>
                  <div className="font-mono text-xs break-all">{contractSourceCode.ownerAddress}</div>
                </>
              )}
              
              {contractSourceCode.metadataHash && (
                <>
                  <div className="text-gray-400">Metadata Hash:</div>
                  <div className="font-mono text-xs break-all">{contractSourceCode.metadataHash}</div>
                </>
              )}
              
              {contractSourceCode.verifiedAt && (
                <>
                  <div className="text-gray-400">Verified At:</div>
                  <div>{new Date(contractSourceCode.verifiedAt).toLocaleString()}</div>
                </>
              )}
              
              {contractSourceCode.libraries && Object.keys(contractSourceCode.libraries).length > 0 && (
                <>
                  <div className="text-gray-400">Libraries:</div>
                  <div className="font-mono text-xs">
                    {Object.entries(contractSourceCode.libraries).map(([name, address]) => (
                      <div key={name}>
                        {name}: {address}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold mb-2">ABI</h3>
            <div className="bg-dark-200 p-4 rounded-lg">
              <div className="text-center py-4 text-yellow-400">
                <FaExclamationTriangle className="mx-auto mb-2" />
                <p>ABI data is not available</p>
                <p className="text-gray-400 text-sm mt-2">
                  The contract is verified, but the ABI could not be loaded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contract Source Code</h3>
        <button 
          className="text-gray-400 hover:text-white focus:outline-none flex items-center"
          onClick={() => onCopyToClipboard(contractSourceCode.sourceCode)}
        >
          {copiedText === contractSourceCode.sourceCode ? <FaCheck size={14} className="mr-1" /> : <FaCopy size={14} className="mr-1" />}
          <span className="text-sm">Copy Code</span>
        </button>
      </div>
      <div className="bg-dark-200 p-4 rounded-lg overflow-auto max-h-[600px]">
        <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
          {contractSourceCode.sourceCode}
        </pre>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-md font-semibold mb-2">Contract Details</h3>
          <div className="bg-dark-200 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-400">Contract Name:</div>
              <div>{contractSourceCode.contractName}</div>
              
              <div className="text-gray-400">Compiler Version:</div>
              <div>v{contractSourceCode.compilerVersion}</div>
              
              <div className="text-gray-400">Optimization:</div>
              <div>{contractSourceCode.optimizationUsed ? `Enabled (${contractSourceCode.runs} runs)` : 'Disabled'}</div>
              
              <div className="text-gray-400">EVM Version:</div>
              <div>{contractSourceCode.evmVersion || 'cancun'}</div>
              
              <div className="text-gray-400">License:</div>
              <div>{contractSourceCode.license}</div>
              
              {contractSourceCode.creatorAddress && (
                <>
                  <div className="text-gray-400">Creator:</div>
                  <div className="font-mono text-xs break-all">{contractSourceCode.creatorAddress}</div>
                </>
              )}
              
              {contractSourceCode.ownerAddress && contractSourceCode.ownerAddress !== contractSourceCode.creatorAddress && (
                <>
                  <div className="text-gray-400">Owner:</div>
                  <div className="font-mono text-xs break-all">{contractSourceCode.ownerAddress}</div>
                </>
              )}
              
              {contractSourceCode.metadataHash && (
                <>
                  <div className="text-gray-400">Metadata Hash:</div>
                  <div className="font-mono text-xs break-all">{contractSourceCode.metadataHash}</div>
                </>
              )}
              
              {contractSourceCode.verifiedAt && (
                <>
                  <div className="text-gray-400">Verified At:</div>
                  <div>{new Date(contractSourceCode.verifiedAt).toLocaleString()}</div>
                </>
              )}
              
              {contractSourceCode.libraries && Object.keys(contractSourceCode.libraries).length > 0 && (
                <>
                  <div className="text-gray-400">Libraries:</div>
                  <div className="font-mono text-xs">
                    {Object.entries(contractSourceCode.libraries).map(([name, address]) => (
                      <div key={name}>
                        {name}: {address}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="mb-2 flex justify-between items-center">
            <h3 className="text-md font-semibold">ABI</h3>
            <button 
              className="text-gray-400 hover:text-white focus:outline-none flex items-center"
              onClick={() => onCopyToClipboard(JSON.stringify(contractAbi, null, 2))}
            >
              {copiedText === JSON.stringify(contractAbi, null, 2) ? <FaCheck size={14} className="mr-1" /> : <FaCopy size={14} className="mr-1" />}
              <span className="text-sm">Copy ABI</span>
            </button>
          </div>
          <div className="bg-dark-200 p-4 rounded-lg overflow-auto max-h-[200px]">
            <pre className="text-gray-300 font-mono text-xs">
              {JSON.stringify(contractAbi, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractCodeTab;
