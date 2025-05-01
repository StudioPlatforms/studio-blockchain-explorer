import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ContractVerificationForm from '../components/contracts/ContractVerificationForm';

const ContractVerificationPage = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAddressChange = (e) => {
    setContractAddress(e.target.value);
    // Reset verification result and error when address changes
    setVerificationResult(null);
    setError(null);
  };

  const handleVerificationSuccess = (result) => {
    setVerificationResult(result);
    setError(null);
  };

  const handleVerificationError = (err) => {
    setError(err.message || 'An error occurred during contract verification');
    setVerificationResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">Verify & Publish Contract Source Code</h1>
      
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Contract Address</h2>
        <p className="text-gray-400 mb-6">
          Enter the address of the contract you want to verify.
        </p>
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2 font-medium">Contract Address</label>
          <input
            type="text"
            value={contractAddress}
            onChange={handleAddressChange}
            placeholder="0x..."
            className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>
      
      {contractAddress && (
        <div className="card mb-8">
          <ContractVerificationForm 
            addressData={{ address: contractAddress }} 
            onVerificationSuccess={handleVerificationSuccess}
            onVerificationError={handleVerificationError}
          />
        </div>
      )}
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Tips for Successful Verification</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-300">
          <li>Make sure the contract address is correct and exists on the Studio Blockchain.</li>
          <li>The contract source code must match exactly what was deployed, including all comments and whitespace.</li>
          <li>If your contract imports other contracts, include all imported contracts in the source code.</li>
          <li>Select the exact compiler version that was used to deploy the contract.</li>
          <li>If optimization was enabled during deployment, make sure to enable it here with the same number of runs.</li>
          <li>For contracts with constructor arguments, provide the ABI-encoded constructor arguments.</li>
          <li>If your contract uses libraries, provide the library addresses in the Libraries field.</li>
          <li>Select the correct EVM version that was used when deploying the contract.</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default ContractVerificationPage;
