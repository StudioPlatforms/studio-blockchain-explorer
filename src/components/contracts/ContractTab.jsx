
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCode, FaFileContract, FaPen, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import apiService from '../../services/api';

// Import our modular components
import ContractVerificationForm from './ContractVerificationForm';
import ContractCodeTab from './ContractCodeTab';
import ContractInteractionTab from './ContractInteractionTab';

const ContractTab = ({ addressData }) => {
  const [contractSourceCode, setContractSourceCode] = useState(null);
  const [contractAbi, setContractAbi] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedText, setCopiedText] = useState('');
  const [contractSubTab, setContractSubTab] = useState('code');
  
  useEffect(() => {
    if (addressData && addressData.type === 'contract') {
      // Check localStorage first for verification status for immediate UI feedback
      const storedVerification = localStorage.getItem(`contract-verified-${addressData.address}`);
      if (storedVerification === 'true') {
        setIsVerified(true);
      }
      
      // Always fetch contract details from the API to ensure we have the latest data
      loadContractData();
    }
  }, [addressData]);
  
  const loadContractData = async () => {
    if (!addressData || !addressData.address) return;
    
    console.log('Loading contract data for address:', addressData.address);
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Check if the contract is fully verified
      console.log('Checking if contract is verified...');
      const verificationResponse = await apiService.isContractVerified(addressData.address);
      const verified = verificationResponse === true;
      
      console.log('Contract verification status from API:', verified);
      
      // Update state with verification status
      setIsVerified(verified);
      
      if (verified) {
        // If verified, store in localStorage and fetch all contract data
        localStorage.setItem(`contract-verified-${addressData.address}`, 'true');
        await fetchContractData();
      } else {
        // If not verified, remove from localStorage and clear any data
        localStorage.removeItem(`contract-verified-${addressData.address}`);
        setContractAbi(null);
        setContractSourceCode(null);
      }
    } catch (error) {
      console.error('Error checking contract verification status:', error);
      
      // If we can't check verification status, use localStorage as fallback
      const storedVerification = localStorage.getItem(`contract-verified-${addressData.address}`);
      const isVerified = storedVerification === 'true';
      
      console.log('Using stored verification status as fallback:', isVerified);
      setIsVerified(isVerified);
      
      if (isVerified) {
        // If verified according to localStorage, try to fetch contract data
        try {
          await fetchContractData();
        } catch (fetchError) {
          console.error('Error fetching contract data with fallback:', fetchError);
          setError('Failed to load contract data. Please try again later.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchContractData = async () => {
    console.log('Fetching contract data for address:', addressData.address);
    
    try {
      // Fetch contract details, source code, and ABI in parallel
      const [abiData, sourceData] = await Promise.all([
        apiService.getContractAbi(addressData.address).catch(error => {
          console.error('Error fetching contract ABI:', error);
          
          // Check if the error is because the contract is not verified
          if (error.response && error.response.data && error.response.data.error === 'Contract is not verified') {
            console.error('Contract is not verified (ABI fetch)');
            setIsVerified(false);
            localStorage.removeItem(`contract-verified-${addressData.address}`);
          }
          
          return null;
        }),
        apiService.getContractSource(addressData.address).catch(error => {
          console.error('Error fetching contract source code:', error);
          
          // Check if the error is because the contract is not verified
          if (error.response && error.response.data && error.response.data.error === 'Contract is not verified') {
            console.error('Contract is not verified (source fetch)');
            setIsVerified(false);
            localStorage.removeItem(`contract-verified-${addressData.address}`);
          }
          
          return null;
        })
      ]);
      
      console.log('Contract ABI data:', abiData);
      console.log('Contract source data:', sourceData);
      
      // If both ABI and source code fetch failed, but the API says the contract is verified,
      // there's a discrepancy. We should consider the contract as not verified.
      if (!abiData && !sourceData) {
        console.error('Failed to fetch both ABI and source code for contract marked as verified');
        setIsVerified(false);
        localStorage.removeItem(`contract-verified-${addressData.address}`);
        setError('Contract verification status is inconsistent. The contract is marked as verified, but source code and ABI are not available.');
        return;
      }
      
      // For a contract to be considered verified, it must have both source code and ABI
      if (!abiData || !sourceData) {
        console.error('Contract is missing either ABI or source code');
        setIsVerified(false);
        localStorage.removeItem(`contract-verified-${addressData.address}`);
        setError('Contract verification is incomplete. Both source code and ABI are required for a contract to be considered verified.');
        return;
      }
      
      // Update state with fetched data
      console.log('Setting contract ABI:', abiData);
      
      // Debug the ABI data structure
      if (abiData) {
        console.log('ABI is array?', Array.isArray(abiData));
        console.log('ABI length:', Array.isArray(abiData) ? abiData.length : 'not an array');
        console.log('ABI first few items:', Array.isArray(abiData) ? abiData.slice(0, 3) : abiData);
        
        // If ABI is not an array but has an 'abi' property that is an array, use that
        if (!Array.isArray(abiData) && abiData.abi && Array.isArray(abiData.abi)) {
          console.log('Using nested abi property which is an array');
          setContractAbi(abiData.abi);
        } else {
          setContractAbi(abiData);
        }
      } else {
        setContractAbi(null);
      }
      
      console.log('Setting contract source code:', sourceData);
      // Ensure the verified property is set to true
      if (!sourceData.verified) {
        console.log('Adding verified property to source data');
        sourceData.verified = true;
      }
      setContractSourceCode(sourceData);
    } catch (error) {
      console.error('Error fetching contract data:', error);
      setError('Failed to load contract data. Please try again later.');
      throw error;
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };
  
  const handleVerificationSuccess = (result) => {
    console.log('Contract verification successful:', result);
    
    // Immediately update the state to show verified status
    setIsVerified(true);
    
    // Store verification status in localStorage
    localStorage.setItem(`contract-verified-${addressData.address}`, 'true');
    
    // If we have ABI data in the result, update it directly
    if (result && result.abi) {
      setContractAbi(result.abi);
    }
    
    // If we have source code in the result, update it directly
    if (result && result.sourceCode) {
      const sourceData = {
        ...result,
        verified: true
      };
      setContractSourceCode(sourceData);
    }
    
    // Also refresh contract details from the API to ensure we have the latest data
    loadContractData();
    
    // Switch to the code tab to show the verified contract
    setContractSubTab('code');
  };
  
  const handleVerificationError = (error) => {
    console.error('Contract verification error:', error);
    // No need to do anything here as the error is handled in the form
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card mb-8"
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Contract Type Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold">Contract Information</h2>
              <p className="text-gray-400 mt-1">
                {addressData.contractType === 'ERC20' && 'ERC20 Token Contract'}
                {addressData.contractType === 'ERC721' && 'ERC721 NFT Contract'}
                {addressData.contractType === 'ERC1155' && 'ERC1155 Multi-Token Contract'}
                {!addressData.contractType && 'Standard Contract'}
              </p>
            </div>
            
            {/* Verification Status Badge */}
            <div className={`px-4 py-2 rounded-lg flex items-center ${isVerified 
              ? 'bg-green-900 bg-opacity-20 text-green-400' 
              : 'bg-yellow-900 bg-opacity-20 text-yellow-400'}`}>
              {isVerified ? (
                <>
                  <FaCheckCircle className="mr-2" />
                  <span className="font-medium">Verified</span>
                </>
              ) : (
                <>
                  <FaExclamationTriangle className="mr-2" />
                  <span className="font-medium">Unverified</span>
                </>
              )}
            </div>
          </div>
          
          {/* If contract is not verified, show verification form */}
          {!isVerified ? (
            <div className="bg-dark-100 rounded-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-l-4 border-yellow-500">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <FaExclamationTriangle className="mr-2 text-yellow-400" />
                  <span>This contract is not verified</span>
                </h3>
                <p className="text-gray-300 mb-4">
                  The source code for this contract has not been verified. Without verification, you can't see the actual code or interact with the contract's functions directly.
                </p>
                <p className="text-gray-400 mb-6">
                  If you're the contract owner or developer, please verify the contract below to enable full functionality.
                </p>
              </div>
              
              <ContractVerificationForm 
                addressData={addressData} 
                onVerificationSuccess={handleVerificationSuccess}
                onVerificationError={handleVerificationError}
              />
            </div>
          ) : (
            // If contract is verified, show contract details and interaction tabs
            <div>
              {/* Contract Tabs */}
              <div className="border-b border-gray-700 mb-6 overflow-x-auto">
                <div className="flex space-x-4 min-w-max">
                  <button
                    className={`px-4 py-2 border-b-2 ${
                      contractSubTab === 'code' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setContractSubTab('code')}
                  >
                    <FaCode className="inline mr-2" />
                    Contract
                  </button>
                  <button
                    className={`px-4 py-2 border-b-2 ${
                      contractSubTab === 'read' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setContractSubTab('read')}
                  >
                    <FaFileContract className="inline mr-2" />
                    Read
                  </button>
                  <button
                    className={`px-4 py-2 border-b-2 ${
                      contractSubTab === 'write' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setContractSubTab('write')}
                  >
                    <FaPen className="inline mr-2" />
                    Write
                  </button>
                </div>
              </div>
              
              {/* Contract Code Tab */}
              {contractSubTab === 'code' && (
                <ContractCodeTab 
                  contractSourceCode={contractSourceCode}
                  contractAbi={contractAbi}
                  copiedText={copiedText}
                  onCopyToClipboard={copyToClipboard}
                />
              )}
              
              {/* Read Functions Tab */}
              {contractSubTab === 'read' && (
                <ContractInteractionTab 
                  addressData={addressData}
                  contractAbi={contractAbi}
                  mode="read"
                  isVerified={isVerified}
                />
              )}
              
              {/* Write Functions Tab */}
              {contractSubTab === 'write' && (
                <ContractInteractionTab 
                  addressData={addressData}
                  contractAbi={contractAbi}
                  mode="write"
                  isVerified={isVerified}
                />
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ContractTab;
