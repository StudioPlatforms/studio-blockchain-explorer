import { Link } from 'react-router-dom';
import studioLogo from '../../assets/studio-logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark-100 pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <img src={studioLogo} alt="Studio Blockchain" className="h-8 w-8 mr-2" />
              <div>
                <h3 className="text-lg font-semibold text-white">Studio Blockchain</h3>
                <p className="text-xs text-gray-400">Explorer</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              The first Ethereum fork with on-chain neural networks and priority system gas fees.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="https://github.com/StudioPlatforms" icon="github" />
              <SocialLink href="https://x.com/StudioPlatforms" icon="twitter" />
              <SocialLink href="https://t.me/official_3d_city" icon="telegram" />
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Explorer</h3>
            <ul className="space-y-2">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/blocks">Blocks</FooterLink>
              <FooterLink to="/transactions">Transactions</FooterLink>
              <FooterLink to="/nfts">NFTs</FooterLink>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <FooterLink to="/ai-dashboard">AI Dashboard</FooterLink>
              <FooterLink to="#">API Documentation</FooterLink>
              <FooterLink to="https://github.com/StudioPlatforms/Studio-Mainnet" external>Developer Resources</FooterLink>
              <li>
                <span className="text-gray-600 cursor-not-allowed text-sm">Developer Grants</span>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <FooterLink to="https://x.com/StudioPlatforms" external>Twitter</FooterLink>
              <FooterLink to="https://t.me/official_3d_city" external>Telegram</FooterLink>
              <FooterLink to="https://github.com/StudioPlatforms" external>GitHub</FooterLink>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} Studio Blockchain. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="text-gray-600 cursor-not-allowed text-sm">Terms of Service</span>
            <span className="text-gray-600 cursor-not-allowed text-sm">Privacy Policy</span>
            <a href="mailto:office@studio-blockchain.com" className="text-gray-500 hover:text-gray-300 text-sm">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper component for footer links
const FooterLink = ({ to, children, external }) => {
  if (external) {
    return (
      <li>
        <a 
          href={to} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm"
        >
          {children}
        </a>
      </li>
    );
  }
  
  return (
    <li>
      <Link to={to} className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">
        {children}
      </Link>
    </li>
  );
};

// Helper component for social media links
const SocialLink = ({ href, icon }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'github':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        );
      case 'telegram':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-gray-400 hover:text-primary transition-colors duration-200"
    >
      {getIcon(icon)}
    </a>
  );
};

export default Footer;
