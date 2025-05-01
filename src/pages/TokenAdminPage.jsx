import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const TokenAdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Check if user is already authenticated (e.g., from localStorage)
  useEffect(() => {
    const authStatus = localStorage.getItem('tokenAdminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchTokens();
    }
  }, []);

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Check credentials (hardcoded for now, but could be moved to a server-side check)
    if (username === 'biks82' && password === 'Mitsubishi4g63ct9a') {
      setIsAuthenticated(true);
      localStorage.setItem('tokenAdminAuth', 'true');
      fetchTokens();
    } else {
      setError('Invalid username or password');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('tokenAdminAuth');
    setTokens([]);
    setSelectedToken(null);
  };

  // Fetch tokens from API
  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tokens from the API
      const response = await apiService.getTokens ? apiService.getTokens() : [];
      
      // If the API doesn't have a getTokens method, try to fetch from the /tokens endpoint directly
      if (!apiService.getTokens) {
        const baseUrl = apiService.getBaseUrl ? apiService.getBaseUrl() : 'https://mainnetindexer.studio-blockchain.com';
        const directResponse = await fetch(`${baseUrl}/tokens`);
        const data = await directResponse.json();
        setTokens(Array.isArray(data) ? data : []);
      } else {
        setTokens(Array.isArray(response) ? response : []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setError('Failed to fetch tokens. Please try again.');
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      
      // Check file size (max 200KB)
      if (file.size > 200 * 1024) {
        setError('File size should be less than 200KB');
        return;
      }
      
      setLogoFile(file);
      setError(null);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async () => {
    if (!selectedToken || !logoFile) {
      setError('Please select a token and a logo file');
      return;
    }
    
    try {
      setUploadStatus('uploading');
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('logo', logoFile);
      formData.append('tokenAddress', selectedToken.address);
      
      // In a real implementation, you would send this to your server
      // For now, we'll simulate a successful upload
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the token in the list with the new logo URL
      const updatedTokens = tokens.map(token => {
        if (token.address === selectedToken.address) {
          // Create a URL for the uploaded file
          const logoUrl = URL.createObjectURL(logoFile);
          return { ...token, logoUrl };
        }
        return token;
      });
      
      setTokens(updatedTokens);
      setUploadStatus('success');
      
      // Reset after successful upload
      setTimeout(() => {
        setUploadStatus(null);
        setLogoFile(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      setUploadStatus('error');
      setError('Failed to upload logo. Please try again.');
    }
  };

  // Filter tokens based on search query
  const filteredTokens = tokens.filter(token => {
    const query = searchQuery.toLowerCase();
    return (
      (token.name && token.name.toLowerCase().includes(query)) ||
      (token.symbol && token.symbol.toLowerCase().includes(query)) ||
      (token.address && token.address.toLowerCase().includes(query))
    );
  });

  // Check if a token is verified
  const isTokenVerified = (token) => {
    // In a real implementation, you would check if the token contract is verified
    // For now, we'll assume all tokens are verified
    return true;
  };

  // Render login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-100">
        <div className="w-full max-w-md p-8 bg-dark-200 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Token Admin Login</h1>
          
          {error && (
            <div className="bg-red-900 bg-opacity-20 text-red-300 p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Login
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              className="text-gray-400 hover:text-primary"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render admin panel if authenticated
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Token Admin Panel</h1>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token List */}
        <div className="lg:col-span-1 card p-6">
          <h2 className="text-xl font-semibold mb-4">ERC20 Tokens</h2>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search tokens..."
              className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="mb-4 flex justify-between items-center">
            <span className="text-gray-400">
              {filteredTokens.length} tokens found
            </span>
            <button
              className="text-primary hover:underline"
              onClick={fetchTokens}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-900 bg-opacity-20 text-red-300 p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[600px]">
              {filteredTokens.length > 0 ? (
                <ul className="space-y-2">
                  {filteredTokens.map((token) => (
                    <li
                      key={token.address}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedToken && selectedToken.address === token.address
                          ? 'bg-primary bg-opacity-20 border border-primary'
                          : 'bg-dark-200 hover:bg-dark-300'
                      }`}
                      onClick={() => setSelectedToken(token)}
                    >
                      <div className="flex items-center">
                        {token.logoUrl ? (
                          <img
                            src={token.logoUrl}
                            alt={token.symbol}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold text-primary">
                              {token.symbol ? token.symbol.substring(0, 2) : 'T'}
                            </span>
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <div className="font-medium text-white truncate">
                            {token.name || 'Unknown Token'}
                            {token.symbol && (
                              <span className="ml-1 text-gray-400 text-sm">
                                ({token.symbol})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-mono truncate">
                            {token.address}
                          </div>
                        </div>
                        {isTokenVerified(token) && (
                          <div className="ml-2 text-green-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No tokens found
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Token Details and Logo Upload */}
        <div className="lg:col-span-2 card p-6">
          {selectedToken ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Token Details
                {isTokenVerified(selectedToken) && (
                  <span className="ml-2 text-green-400 text-sm">
                    (Verified)
                  </span>
                )}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-dark-200 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-1">Name</h3>
                  <p className="font-medium">{selectedToken.name || 'Unknown'}</p>
                </div>
                
                <div className="bg-dark-200 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-1">Symbol</h3>
                  <p className="font-medium">{selectedToken.symbol || 'Unknown'}</p>
                </div>
                
                <div className="bg-dark-200 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-1">Address</h3>
                  <p className="font-mono text-sm truncate">{selectedToken.address}</p>
                </div>
                
                <div className="bg-dark-200 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-1">Decimals</h3>
                  <p className="font-medium">{selectedToken.decimals || '18'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Token Logo</h3>
                
                <div className="flex items-center mb-4">
                  {selectedToken.logoUrl ? (
                    <div className="mr-4">
                      <img
                        src={selectedToken.logoUrl}
                        alt={selectedToken.symbol}
                        className="w-16 h-16 rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
                      <span className="text-xl font-semibold text-primary">
                        {selectedToken.symbol ? selectedToken.symbol.substring(0, 2) : 'T'}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    {selectedToken.logoUrl ? (
                      <p className="text-green-400 mb-2">Logo uploaded</p>
                    ) : (
                      <p className="text-yellow-400 mb-2">No logo uploaded</p>
                    )}
                    
                    {isTokenVerified(selectedToken) ? (
                      <p className="text-sm text-gray-300">
                        You can upload a logo for this verified token
                      </p>
                    ) : (
                      <p className="text-sm text-red-400">
                        Cannot upload logo for unverified tokens
                      </p>
                    )}
                  </div>
                </div>
                
                {isTokenVerified(selectedToken) && (
                  <div className="bg-dark-200 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Upload New Logo</h4>
                    <p className="text-xs text-gray-400 mb-4">
                      Upload a square PNG or SVG image (max 200KB)
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4">
                      <input
                        type="file"
                        accept="image/png, image/svg+xml"
                        onChange={handleFileChange}
                        className="text-sm text-gray-400"
                      />
                      
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          logoFile
                            ? 'bg-primary text-white hover:bg-opacity-90'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={handleLogoUpload}
                        disabled={!logoFile || uploadStatus === 'uploading'}
                      >
                        {uploadStatus === 'uploading'
                          ? 'Uploading...'
                          : uploadStatus === 'success'
                          ? 'Uploaded!'
                          : 'Upload Logo'}
                      </button>
                    </div>
                    
                    {error && (
                      <div className="mt-2 text-red-400 text-sm">
                        {error}
                      </div>
                    )}
                    
                    {logoFile && (
                      <div className="mt-4 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-dark-300 flex items-center justify-center mr-2 overflow-hidden">
                          <img
                            src={URL.createObjectURL(logoFile)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-400">
                          {logoFile.name} ({Math.round(logoFile.size / 1024)} KB)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-16 h-16 rounded-full bg-dark-200 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-400 mb-2">
                Select a Token
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Select a token from the list to view details and upload a logo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenAdminPage;
