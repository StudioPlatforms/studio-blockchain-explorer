import { useState, useEffect, createContext, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import studioLogo from '../../assets/studio-logo.png';
import apiService from '../../services/api.js';
import { formatGasPrice } from '../../utils/formatters.js';
import { FaGasPump } from 'react-icons/fa';
import SearchDropdown from '../common/SearchDropdown';

// Create a context to share the mobile menu state
const HeaderContext = createContext();

const Header = () => {
  // We no longer need the searchQuery state as it's managed by the SearchDropdown component
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [gasPrice, setGasPrice] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch gas price on component mount and set up interval for updates
  useEffect(() => {
    const fetchGasPrice = async () => {
      try {
        const stats = await apiService.getNetworkStats();
        setGasPrice(stats.gasPrice);
      } catch (error) {
        console.error('Error fetching gas price:', error);
      }
    };

    // Fetch immediately
    fetchGasPrice();

    // Set up interval to fetch every 30 seconds
    const interval = setInterval(fetchGasPrice, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (query) => {
    // This function will be called by the SearchDropdown component when a search is submitted
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <HeaderContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
      <header className="bg-dark-100 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link to="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                  <img src={studioLogo} alt="Studio Blockchain" className="h-10 w-10 mr-3" />
                  <div>
                    <h1 className="text-xl font-bold text-white">Studio Blockchain</h1>
                    <p className="text-xs text-gray-400">Explorer</p>
                  </div>
                </Link>
              </div>
              
              <button 
                className="md:hidden text-white focus:outline-none"
                onClick={toggleMobileMenu}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
            
            <div className={`mt-4 md:mt-0 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
              <div className="flex flex-col md:flex-row md:items-center">
                {/* Mobile Gas Price Display */}
                <div className="md:hidden flex items-center mb-4 text-sm">
                  <FaGasPump className="text-primary text-xs mr-1.5" />
                  <span className="text-gray-400">Gas: </span>
                  <span className="text-white font-medium">{formatGasPrice(gasPrice)}</span>
                </div>
                
                {/* Desktop Gas Price Display */}
                <div className="hidden md:flex items-center mr-4 text-xs">
                  <FaGasPump className="text-primary text-xs mr-1" />
                  <span className="text-gray-400">Gas: </span>
                  <span className="text-white font-medium">{formatGasPrice(gasPrice)}</span>
                </div>
                
                {/* Desktop Search Form with Dropdown */}
                <div className="hidden md:block relative mb-4 md:mb-0 md:mr-4">
                  <SearchDropdown onSearch={handleSearch} />
                </div>
                
                <nav className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                  <div className="flex flex-col md:flex-row md:space-x-4">
                    <NavLink to="/" active={location.pathname === '/'} setIsMobileMenuOpen={setIsMobileMenuOpen}>
                      Home
                    </NavLink>
                    <NavLink to="/blocks" active={location.pathname.startsWith('/blocks')} setIsMobileMenuOpen={setIsMobileMenuOpen}>
                      Blocks
                    </NavLink>
                    <NavLink to="/transactions" active={location.pathname.startsWith('/transactions')} setIsMobileMenuOpen={setIsMobileMenuOpen}>
                      Transactions
                    </NavLink>
                    <NavLink to="/nfts" active={location.pathname.startsWith('/nfts')} setIsMobileMenuOpen={setIsMobileMenuOpen}>
                      NFTs
                    </NavLink>
                    <NavLink to="/ai-dashboard" active={location.pathname.startsWith('/ai-dashboard')} highlight setIsMobileMenuOpen={setIsMobileMenuOpen}>
                      AI Dashboard
                    </NavLink>
                    
                    {/* dApp Button - Full Red - Added mb-2 for mobile spacing */}
                    <a 
                      href="https://app.studio-blockchain.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-1 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors duration-200 md:mb-0 mt-2 md:mt-0"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      dApp
                    </a>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>
    </HeaderContext.Provider>
  );
};

// Helper component for navigation links
const NavLink = ({ to, active, highlight, children, setIsMobileMenuOpen }) => {
  const handleClick = () => {
    // Close mobile menu when a link is clicked
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };
  
  return (
    <Link
      to={to}
      className={`
        px-3 py-1 rounded-md transition-colors duration-200
        ${active ? 'bg-primary bg-opacity-20 text-primary' : 'text-gray-300 hover:text-white'}
        ${highlight ? 'border border-primary' : ''}
      `}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export default Header;
