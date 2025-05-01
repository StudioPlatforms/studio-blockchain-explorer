import React from 'react';

/**
 * Error message and logs component
 */
export const ErrorDisplay = ({ error, errorLogs, showErrorLogs, setShowErrorLogs }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-900 bg-opacity-20 border border-red-700 p-4 rounded-lg mb-6">
      <div className="flex justify-between items-center">
        <p className="text-red-400 font-medium">{error}</p>
        {errorLogs.length > 0 && (
          <button
            type="button"
            onClick={() => setShowErrorLogs(!showErrorLogs)}
            className="text-red-400 hover:text-red-300 focus:outline-none text-sm"
          >
            {showErrorLogs ? 'Hide Details' : 'Show Details'}
          </button>
        )}
      </div>
      
      {/* Collapsible error logs */}
      {showErrorLogs && errorLogs.length > 0 && (
        <div className="mt-4 bg-dark-200 p-3 rounded-lg border border-red-800 overflow-auto max-h-[300px]">
          <pre className="text-red-300 text-sm font-mono whitespace-pre-wrap">
            {errorLogs.map((log, index) => (
              <div key={index} className="mb-1 pb-1 border-b border-red-800/30 last:border-0">
                {log}
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
};

/**
 * Success message and logs component
 */
export const SuccessDisplay = ({ verificationResult, verificationLogs, showVerificationLogs, setShowVerificationLogs }) => {
  if (!verificationResult) return null;
  
  return (
    <div className="bg-green-900 bg-opacity-20 border border-green-700 p-4 rounded-lg mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-green-400">Contract Verified Successfully!</h3>
        {verificationLogs.length > 0 && (
          <button
            type="button"
            onClick={() => setShowVerificationLogs(!showVerificationLogs)}
            className="text-green-400 hover:text-green-300 focus:outline-none text-sm"
          >
            {showVerificationLogs ? 'Hide Logs' : 'Show Logs'}
          </button>
        )}
      </div>
      
      <p className="text-gray-300 mt-2 mb-2">
        The contract source code has been verified and published. You can now interact with the contract directly through the explorer.
      </p>
      
      {/* Collapsible verification logs */}
      {showVerificationLogs && verificationLogs.length > 0 && (
        <div className="mt-4 bg-dark-200 p-3 rounded-lg border border-green-800 overflow-auto max-h-[300px]">
          <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap">
            {verificationLogs.map((log, index) => (
              <div key={index} className="mb-1 pb-1 border-b border-green-800/30 last:border-0">
                {log}
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
};

/**
 * Network response display component (for debugging)
 */
export const NetworkResponseDisplay = ({ networkResponse, showNetworkResponse, setShowNetworkResponse }) => {
  if (!networkResponse) return null;
  
  return (
    <div className="bg-blue-900 bg-opacity-20 border border-blue-700 p-4 rounded-lg mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-blue-400">Network Response</h3>
        <button
          type="button"
          onClick={() => setShowNetworkResponse(!showNetworkResponse)}
          className="text-blue-400 hover:text-blue-300 focus:outline-none text-sm"
        >
          {showNetworkResponse ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {showNetworkResponse && (
        <div className="mt-4 bg-dark-200 p-3 rounded-lg border border-blue-800 overflow-auto max-h-[300px]">
          <pre className="text-blue-300 text-sm font-mono whitespace-pre-wrap">
            {JSON.stringify(networkResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

/**
 * Contract name input component
 */
export const ContractNameInput = ({ formData, handleChange }) => (
  <div>
    <label className="block text-gray-300 mb-2 font-medium" htmlFor="contractName">Contract Name</label>
    <input
      type="text"
      id="contractName"
      name="contractName"
      value={formData.contractName}
      onChange={handleChange}
      placeholder="MyToken"
      className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      required
    />
  </div>
);

/**
 * Source code textarea component
 */
export const SourceCodeInput = ({ formData, handleChange }) => (
  <div>
    <label className="block text-gray-300 mb-2 font-medium" htmlFor="sourceCode">Solidity Contract Code</label>
    <textarea
      id="sourceCode"
      name="sourceCode"
      value={formData.sourceCode}
      onChange={handleChange}
      placeholder="// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    // Your contract code here
}"
      className="w-full h-64 px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
      required
    />
  </div>
);

/**
 * Compiler version select component
 */
export const CompilerVersionSelect = ({ formData, handleChange, compilerVersions, isLoadingVersions, compilerVersionError }) => (
  <div>
    <label className="block text-gray-300 mb-2 font-medium" htmlFor="compilerVersion">Compiler Version</label>
    {isLoadingVersions ? (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
        <span className="text-gray-400">Loading compiler versions...</span>
      </div>
    ) : (
      <select
        id="compilerVersion"
        name="compilerVersion"
        value={formData.compilerVersion}
        onChange={handleChange}
        className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        required
        disabled={isLoadingVersions}
      >
        {compilerVersions.map((version) => (
          <option key={version.value} value={version.value}>
            {version.label}
          </option>
        ))}
      </select>
    )}
    {compilerVersionError && (
      <p className="text-xs text-yellow-400 mt-1">
        {compilerVersionError}
      </p>
    )}
    <p className="text-xs text-gray-400 mt-1">
      Select the compiler version used to compile your contract.
    </p>
  </div>
);

/**
 * License select component
 */
export const LicenseSelect = ({ formData, handleChange, licenses }) => (
  <div>
    <label className="block text-gray-300 mb-2 font-medium" htmlFor="license">License Type</label>
    <select
      id="license"
      name="license"
      value={formData.license}
      onChange={handleChange}
      className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {licenses.map((lic) => (
        <option key={lic} value={lic}>
          {lic}
        </option>
      ))}
    </select>
  </div>
);

/**
 * EVM version select component
 */
export const EVMVersionSelect = ({ formData, handleChange, evmVersions }) => (
  <div>
    <label className="block text-gray-300 mb-2 font-medium" htmlFor="evmVersion">EVM Version</label>
    <select
      id="evmVersion"
      name="evmVersion"
      value={formData.evmVersion}
      onChange={handleChange}
      className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {evmVersions.map((version) => (
        <option key={version.value} value={version.value}>
          {version.label}
        </option>
      ))}
    </select>
    <p className="text-xs text-gray-400 mt-1">
      Select the EVM version used when deploying this contract. Using the wrong version may cause verification to fail.
    </p>
  </div>
);

/**
 * Optimization settings component
 */
export const OptimizationSettings = ({ formData, handleChange }) => (
  <div>
    <div className="flex items-center mb-2">
      <input
        type="checkbox"
        id="optimizationUsed"
        name="optimizationUsed"
        checked={formData.optimizationUsed}
        onChange={handleChange}
        className="mr-2 h-4 w-4"
      />
      <label htmlFor="optimizationUsed" className="text-gray-300 font-medium">Enable Optimization</label>
    </div>
    
    {formData.optimizationUsed && (
      <div className="mt-2">
        <label className="block text-gray-300 mb-1" htmlFor="runs">Optimization Runs</label>
        <input
          type="number"
          id="runs"
          name="runs"
          value={formData.runs}
          onChange={handleChange}
          min="1"
          max="10000"
          className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    )}
  </div>
);

/**
 * Constructor arguments input component
 */
export const ConstructorArgumentsInput = ({ formData, handleChange }) => (
  <div>
    <label className="block text-gray-300 mb-2 font-medium" htmlFor="constructorArguments">Constructor Arguments (optional)</label>
    <input
      type="text"
      id="constructorArguments"
      name="constructorArguments"
      value={formData.constructorArguments}
      onChange={handleChange}
      placeholder="0x..."
      className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    />
    <p className="text-xs text-gray-400 mt-1">
      ABI-encoded constructor arguments used when deploying the contract.
    </p>
  </div>
);

/**
 * Libraries input component
 */
export const LibrariesInput = ({ libraryInputs, handleLibraryChange, addLibraryInput, removeLibraryInput }) => (
  <div>
    <label className="block text-gray-300 mb-2 font-medium">Libraries (optional)</label>
    {libraryInputs.map((lib, index) => (
      <div key={index} className="flex space-x-2 mb-2">
        <input
          type="text"
          placeholder="Library Name"
          value={lib.name}
          onChange={(e) => handleLibraryChange(index, 'name', e.target.value)}
          className="flex-1 px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Library Address (0x...)"
          value={lib.address}
          onChange={(e) => handleLibraryChange(index, 'address', e.target.value)}
          className="flex-1 px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={() => removeLibraryInput(index)}
          disabled={libraryInputs.length === 1 && !lib.name && !lib.address}
          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Remove
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={addLibraryInput}
      className="px-4 py-2 bg-dark-200 hover:bg-dark-300 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    >
      Add Library
    </button>
    <p className="text-xs text-gray-400 mt-1">
      Add libraries used by the contract. Required if your contract uses libraries.
    </p>
  </div>
);

/**
 * Submit button component
 */
export const SubmitButton = ({ isVerifying }) => (
  <div className="flex justify-end">
    <button
      type="submit"
      disabled={isVerifying}
      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
    >
      {isVerifying ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Verifying...
        </div>
      ) : (
        'Verify & Publish'
      )}
    </button>
  </div>
);
