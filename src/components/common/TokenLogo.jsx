import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * TokenLogo component for displaying token logos consistently throughout the application
 * 
 * @param {Object} props - Component props
 * @param {Object} props.token - Token object with address, symbol, and name properties
 * @param {string} props.size - Size of the logo (sm, md, lg)
 * @param {boolean} props.showSymbol - Whether to show the symbol next to the logo
 * @param {boolean} props.clickable - Whether the logo is clickable and navigates to the token page
 * @param {string} props.className - Additional CSS classes
 */
const TokenLogo = ({ 
  token, 
  size = 'md', 
  showSymbol = false, 
  clickable = false,
  className = '' 
}) => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();
  
  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };
  
  // Get token symbol (first 2 characters or fallback)
  const getSymbolDisplay = () => {
    if (!token) return 'T';
    if (token.symbol) return token.symbol.substring(0, 2).toUpperCase();
    if (token.name) return token.name.substring(0, 2).toUpperCase();
    return 'T';
  };
  
  // Try to load the token logo from the public directory
  useEffect(() => {
    if (!token || !token.address) {
      console.warn('TokenLogo: No token or token address provided', token);
      return;
    }
    
    // Reset state when token changes
    setLogoError(false);
    setLogoUrl(null);
    
    // Try to load the logo from the public directory
    const tokenAddress = token.address.toLowerCase();
    
    console.log(`TokenLogo: Attempting to load token logo for ${token.symbol || 'unknown'} (${tokenAddress})`);
    
    // Special cases for common tokens to prevent flickering
    if (token.symbol === '3DC' || tokenAddress === '0xfb0ae661d04f463b43ae36f9fd2a7ce95538b5a1') {
      console.log('TokenLogo: Using 3DC logo from /3dc-logo.png');
      setLogoUrl('/3dc-logo.png');
      return;
    }
    
    // Special case for USDT
    if (token.symbol === 'USDT' || tokenAddress === '0xdac17f958d2ee523a2206206994597c13d831ec7') {
      console.log('TokenLogo: Using USDT logo from /tether-usdt-logo.png');
      setLogoUrl('/tether-usdt-logo.png');
      return;
    }
    
    // Special case for USDC
    if (token.symbol === 'USDC' || tokenAddress === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') {
      console.log('TokenLogo: Using USDC logo from /usdc-logo.png');
      setLogoUrl('/usdc-logo.png');
      return;
    }
    
    // Use a static path without timestamp to allow browser caching
    const logoPath = `/token-logos/${tokenAddress}.png`;
    
    // Check if the logo exists
    fetch(logoPath, { cache: 'force-cache' }) // Use browser cache when available
      .then(response => {
        if (response.ok) {
          console.log(`Successfully loaded token logo for ${token.symbol || 'unknown'}`);
          setLogoUrl(logoPath);
        } else {
          console.warn(`Logo not found for ${token.symbol || 'unknown'} at ${logoPath}`);
          throw new Error('Logo not found');
        }
      })
      .catch((error) => {
        console.error(`Error loading token logo for ${token.symbol || 'unknown'}:`, error);
        // If the logo doesn't exist, try to load from token.logoUrl if available
        if (token.logoUrl) {
          console.log(`Trying alternative logo URL for ${token.symbol || 'unknown'}: ${token.logoUrl}`);
          setLogoUrl(token.logoUrl);
        } else {
          console.warn(`No alternative logo URL for ${token.symbol || 'unknown'}, using fallback`);
          setLogoError(true);
        }
      });
  }, [token]);
  
  // Handle click on the logo
  const handleClick = () => {
    if (clickable && token && token.address) {
      navigate(`/tokens/${token.address}`);
    }
  };
  
  // If no token, return a placeholder
  if (!token) {
    return (
      <div className={`rounded-full bg-gray-700 flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <span className="text-gray-400">?</span>
      </div>
    );
  }
  
  // Render the component
  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className={`rounded-full flex-shrink-0 flex items-center justify-center ${sizeClasses[size]} ${
          logoUrl ? '' : 'bg-primary bg-opacity-20'
        } ${clickable ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        {logoUrl && !logoError ? (
          <img 
            src={logoUrl} 
            alt={token.symbol || token.name || 'Token'} 
            className="w-full h-full rounded-full object-contain"
            onError={(e) => {
              console.error(`Error loading token logo: ${logoUrl}`, e);
              // Only set error if we're not using a special case logo
              if (!logoUrl.includes('/3dc-logo.png') && 
                  !logoUrl.includes('/tether-usdt-logo.png') && 
                  !logoUrl.includes('/usdc-logo.png')) {
                setLogoError(true);
              } else {
                // For special case logos, retry once with a different approach
                const retryUrl = logoUrl.includes('?retry') ? null : `${logoUrl}?retry=true`;
                if (retryUrl) {
                  console.log(`Retrying with: ${retryUrl}`);
                  setLogoUrl(retryUrl);
                } else {
                  setLogoError(true);
                }
              }
            }}
          />
        ) : (
          <span className="font-semibold text-primary">
            {getSymbolDisplay()}
          </span>
        )}
      </div>
      
      {showSymbol && token.symbol && (
        <span className="ml-2 font-medium">
          {token.symbol}
        </span>
      )}
    </div>
  );
};

export default TokenLogo;
