import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiService from '../../services/api';

// Import utilities and constants
import { 
  fetchCompilerVersions, 
  suggestEVMVersion, 
  evmVersions, 
  licenses, 
  defaultFormData 
} from './ContractVerificationUtils';

// Import UI components
import {
  ErrorDisplay,
  SuccessDisplay,
  NetworkResponseDisplay,
  ContractNameInput,
  SourceCodeInput,
  CompilerVersionSelect,
  LicenseSelect,
  EVMVersionSelect,
  OptimizationSettings,
  ConstructorArgumentsInput,
  LibrariesInput,
  SubmitButton
} from './ContractVerificationFormUI';

const ContractVerificationForm = ({ addressData, onVerificationSuccess, onVerificationError }) => {
  // Form state
  const [formData, setFormData] = useState({...defaultFormData});
  const [libraryInputs, setLibraryInputs] = useState([{ name: '', address: '' }]);
  
  // UI state
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [errorLogs, setErrorLogs] = useState([]);
  const [showErrorLogs, setShowErrorLogs] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationLogs, setVerificationLogs] = useState([]);
  const [showVerificationLogs, setShowVerificationLogs] = useState(false);
  const [networkResponse, setNetworkResponse] = useState(null);
  const [showNetworkResponse, setShowNetworkResponse] = useState(false);
  
  // Compiler versions state
  const [compilerVersions, setCompilerVersions] = useState([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const [compilerVersionError, setCompilerVersionError] = useState(null);

  // Fetch compiler versions when component mounts
  useEffect(() => {
    const loadCompilerVersions = async () => {
      setIsLoadingVersions(true);
      try {
        const versions = await fetchCompilerVersions();
        setCompilerVersions(versions);
        
        // Set default compiler version to the newest one
        if (versions.length > 0) {
          setFormData(prev => ({
            ...prev,
            compilerVersion: versions[0].value
          }));
        }
      } catch (error) {
        console.error('Error loading compiler versions:', error);
        setCompilerVersionError('Failed to load compiler versions. Using fallback list.');
      } finally {
        setIsLoadingVersions(false);
      }
    };
    
    loadCompilerVersions();
  }, []);
  
  // Set contract address when it changes
  useEffect(() => {
    if (addressData && addressData.address) {
      console.log('Contract address for verification:', addressData.address);
      setFormData(prevData => ({
        ...prevData,
        address: addressData.address
      }));
    }
  }, [addressData]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // If compiler version changes, suggest appropriate EVM version
    if (name === 'compilerVersion') {
      setFormData(prevData => ({
        ...prevData,
        evmVersion: suggestEVMVersion(value)
      }));
    }
  };

  // Handle library input changes
  const handleLibraryChange = (index, field, value) => {
    const newLibraryInputs = [...libraryInputs];
    newLibraryInputs[index][field] = value;
    setLibraryInputs(newLibraryInputs);

    // Update libraries object in formData
    const libraries = {};
    newLibraryInputs.forEach((lib) => {
      if (lib.name && lib.address) {
        libraries[lib.name] = lib.address;
      }
    });
    setFormData({ ...formData, libraries });
  };

  // Add a new library input
  const addLibraryInput = () => {
    setLibraryInputs([...libraryInputs, { name: '', address: '' }]);
  };

  // Remove a library input
  const removeLibraryInput = (index) => {
    const newLibraryInputs = [...libraryInputs];
    newLibraryInputs.splice(index, 1);
    setLibraryInputs(newLibraryInputs);

    // Update libraries object in formData
    const libraries = {};
    newLibraryInputs.forEach((lib) => {
      if (lib.name && lib.address) {
        libraries[lib.name] = lib.address;
      }
    });
    setFormData({ ...formData, libraries });
  };

  // Handle form submission
  const handleVerify = async (e) => {
    e.preventDefault();
    
    // Log form data for debugging
    console.log('Form submission data:', formData);
    
    // Store current form state to prevent reset
    const currentFormData = { ...formData };
    
    // Reset state
    setIsVerifying(true);
    setError(null);
    setErrorLogs([]);
    setVerificationResult(null);
    setVerificationLogs([]);
    setNetworkResponse(null);

    try {
      // Validate address
      if (!formData.address) {
        throw new Error('Contract address is missing or invalid');
      }
      
      // Make a direct API call to verify the contract
      console.log('Sending verification request with data:', JSON.stringify(formData, null, 2));
      console.log('API Base URL:', apiService.getBaseUrl());

      // Try using the apiService method first
      try {
        console.log('Using apiService.verifyContract method');
        const result = await apiService.verifyContract(formData);
        console.log('Verification successful using apiService:', result);
        
        // Set verification result
        setVerificationResult(result);
        
        // Extract verification logs if available
        if (result.logs && Array.isArray(result.logs)) {
          setVerificationLogs(result.logs);
        } else if (result.compilationLogs) {
          // Try to parse compilation logs if they're a string
          try {
            const logs = typeof result.compilationLogs === 'string' 
              ? result.compilationLogs.split('\n').filter(log => log.trim() !== '')
              : [String(result.compilationLogs)];
            setVerificationLogs(logs);
          } catch (e) {
            setVerificationLogs([String(result.compilationLogs)]);
          }
        }
        
        // Show logs automatically if verification was successful
        setShowVerificationLogs(true);
        
        // Store verification status in localStorage
        localStorage.setItem(`contract-verified-${formData.address}`, 'true');
        
        // We don't store ABI and source code in localStorage anymore
        // Instead, we'll fetch them from the API when needed
        // This ensures we always have the latest data
        
        // Notify parent component of successful verification
        if (onVerificationSuccess) {
          onVerificationSuccess(result);
        }
        
        return;
      } catch (apiError) {
        console.error('Error using apiService.verifyContract:', apiError);
        console.log('Falling back to direct axios call');
        
        // If that fails, try a direct axios call
        const response = await axios.post(
          `${apiService.getBaseUrl()}/contracts/verify`,
          formData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Verification API response:', response);
        
        // Store the full network response for debugging
        setNetworkResponse({
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        });
        setShowNetworkResponse(true);
        
        // Check if the result contains verification logs
        if (response.data) {
          setVerificationResult(response.data);
          
          // Extract verification logs if available
          if (response.data.logs && Array.isArray(response.data.logs)) {
            setVerificationLogs(response.data.logs);
          } else if (response.data.compilationLogs) {
            // Try to parse compilation logs if they're a string
            try {
              const logs = typeof response.data.compilationLogs === 'string' 
                ? response.data.compilationLogs.split('\n').filter(log => log.trim() !== '')
                : [String(response.data.compilationLogs)];
              setVerificationLogs(logs);
            } catch (e) {
              setVerificationLogs([String(response.data.compilationLogs)]);
            }
          }
          
          // Show logs automatically if verification was successful
          setShowVerificationLogs(true);
          
          // Store verification status in localStorage
          localStorage.setItem(`contract-verified-${formData.address}`, 'true');
          
          // We don't store ABI and source code in localStorage anymore
          // Instead, we'll fetch them from the API when needed
          // This ensures we always have the latest data
          
          // Notify parent component of successful verification
          if (onVerificationSuccess) {
            onVerificationSuccess(response.data);
          }
        } else {
          // Handle empty result
          throw new Error('No response data from verification API');
        }
      }
    } catch (err) {
      console.error('Error verifying contract:', err);
      
      // Restore form state to prevent reset
      setFormData(currentFormData);
      
      // Set the main error message
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred during contract verification';
      setError(errorMessage);
      
      // Store the network response for debugging
      if (err.response) {
        setNetworkResponse({
          status: err.response.status,
          statusText: err.response.statusText,
          headers: err.response.headers,
          data: err.response.data
        });
        setShowNetworkResponse(true);
      }
      
      // Notify parent component of error
      if (onVerificationError) {
        onVerificationError(err);
      }
      
      // Extract detailed error logs
      if (err.response?.data) {
        const responseData = err.response.data;
        if (responseData.logs && Array.isArray(responseData.logs)) {
          setErrorLogs(responseData.logs);
        } else if (responseData.error) {
          setErrorLogs([responseData.error]);
        } else if (responseData.message) {
          setErrorLogs([responseData.message]);
        } else if (typeof responseData === 'string') {
          setErrorLogs([responseData]);
        } else {
          setErrorLogs([JSON.stringify(responseData)]);
        }
      } else if (err.data) {
        if (err.data.logs && Array.isArray(err.data.logs)) {
          setErrorLogs(err.data.logs);
        } else if (err.data.error) {
          setErrorLogs([err.data.error]);
        } else if (err.data.message) {
          setErrorLogs([err.data.message]);
        } else if (typeof err.data === 'string') {
          setErrorLogs([err.data]);
        } else {
          setErrorLogs([JSON.stringify(err.data)]);
        }
      } else {
        // If no structured error data, just use the error message
        setErrorLogs([err.message || 'Unknown error occurred']);
      }
      
      // Show error logs automatically
      setShowErrorLogs(true);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-dark-100 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Verify & Publish Contract Source Code</h3>
      <p className="text-gray-400 mb-6">
        Verify and publish your contract source code. Once verified, the contract's ABI and source code will be publicly available, and users will be able to interact with it directly through Studio Blockchain Explorer.
      </p>
      
      {/* Error message and logs */}
      <ErrorDisplay 
        error={error}
        errorLogs={errorLogs}
        showErrorLogs={showErrorLogs}
        setShowErrorLogs={setShowErrorLogs}
      />
      
      {/* Success message and logs */}
      <SuccessDisplay 
        verificationResult={verificationResult}
        verificationLogs={verificationLogs}
        showVerificationLogs={showVerificationLogs}
        setShowVerificationLogs={setShowVerificationLogs}
      />
      
      {/* Network Response (for debugging) */}
      <NetworkResponseDisplay 
        networkResponse={networkResponse}
        showNetworkResponse={showNetworkResponse}
        setShowNetworkResponse={setShowNetworkResponse}
      />
      
      <form onSubmit={handleVerify} className="space-y-6">
        {/* Contract Name */}
        <ContractNameInput formData={formData} handleChange={handleChange} />
        
        {/* Source Code */}
        <SourceCodeInput formData={formData} handleChange={handleChange} />
        
        {/* Two-column layout for desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Compiler Version */}
            <CompilerVersionSelect 
              formData={formData}
              handleChange={handleChange}
              compilerVersions={compilerVersions}
              isLoadingVersions={isLoadingVersions}
              compilerVersionError={compilerVersionError}
            />
            
            {/* License Type */}
            <LicenseSelect 
              formData={formData}
              handleChange={handleChange}
              licenses={licenses}
            />
          </div>
          
          {/* Right column */}
          <div className="space-y-6">
            {/* EVM Version */}
            <EVMVersionSelect 
              formData={formData}
              handleChange={handleChange}
              evmVersions={evmVersions}
            />
            
            {/* Optimization Settings */}
            <OptimizationSettings 
              formData={formData}
              handleChange={handleChange}
            />
          </div>
        </div>
        
        {/* Constructor Arguments */}
        <ConstructorArgumentsInput formData={formData} handleChange={handleChange} />
        
        {/* Libraries */}
        <LibrariesInput 
          libraryInputs={libraryInputs}
          handleLibraryChange={handleLibraryChange}
          addLibraryInput={addLibraryInput}
          removeLibraryInput={removeLibraryInput}
        />
        
        {/* Submit Button */}
        <SubmitButton isVerifying={isVerifying} />
      </form>
    </div>
  );
};

export default ContractVerificationForm;
