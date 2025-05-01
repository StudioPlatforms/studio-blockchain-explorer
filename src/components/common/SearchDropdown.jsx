import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api/config.js';
import { processApiData } from '../../services/api/utils.js';
import TokenLogo from './TokenLogo';

const SearchDropdown = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch token list on component mount
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching tokens for search dropdown');
        
        // Fetch tokens from the API
        const response = await api.get('/tokens');
        const data = processApiData(response.data);
        
        if (Array.isArray(data)) {
          console.log(`Fetched ${data.length} tokens for search dropdown`);
          setTokenList(data);
        } else {
          console.warn('Received invalid token data format:', data);
          setTokenList([]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching tokens for search dropdown:', error);
        setTokenList([]);
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, []);

  // Filter suggestions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);

    // Filter tokens based on search query
    const filterTokens = () => {
      const query = searchQuery.toLowerCase();
      const filtered = tokenList.filter(token => 
        (token.name && token.name.toLowerCase().includes(query)) || 
        (token.symbol && token.symbol.toLowerCase().includes(query)) ||
        (token.address && token.address.toLowerCase().includes(query))
      );
      
      setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
      setShowDropdown(filtered.length > 0);
      setIsLoading(false);
    };

    // Debounce search to avoid excessive filtering
    const debounceTimer = setTimeout(filterTokens, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, tokenList]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Close dropdown
    setShowDropdown(false);
    
    // Call onSearch callback
    if (onSearch) {
      onSearch(searchQuery);
    }

    // Navigate to search page
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    // Navigate to address page for tokens (since token pages are being removed)
    if (suggestion.address) {
      navigate(`/address/${suggestion.address}`);
    } else {
      // Otherwise, perform a regular search
      navigate(`/search?q=${encodeURIComponent(suggestion.name || suggestion)}`);
    }
    
    // Close dropdown and clear search
    setShowDropdown(false);
    setSearchQuery('');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    }
    // Arrow up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
    }
    // Enter
    else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[focusedIndex]);
    }
    // Escape
    else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Helper function to truncate address
  const truncateAddress = (address, length = 6) => {
    if (!address) return '';
    return `${address.substring(0, length)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by Block / Txn / Address / Token"
          className="w-full md:w-64 lg:w-80 px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowDropdown(searchQuery.trim().length > 0)}
          onKeyDown={handleKeyDown}
        />
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full bg-dark-100 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-3 text-center text-gray-400">
              <div className="inline-block w-4 h-4 border-2 border-gray-400 border-t-primary rounded-full animate-spin mr-2"></div>
              Loading...
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li 
                  key={suggestion.address || index}
                  className={`px-4 py-2 cursor-pointer hover:bg-dark-200 ${focusedIndex === index ? 'bg-dark-200' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center">
                    {suggestion.symbol && (
                      <TokenLogo token={suggestion} size="sm" className="mr-2 flex-shrink-0" />
                    )}
                    <div className="overflow-hidden">
                      <div className="font-medium text-white truncate">
                        {suggestion.name || suggestion}
                        {suggestion.symbol && <span className="ml-1 text-gray-400 text-sm">({suggestion.symbol})</span>}
                      </div>
                      {suggestion.address && (
                        <div className="text-xs text-gray-500 font-mono">
                          {truncateAddress(suggestion.address)}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-center text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
