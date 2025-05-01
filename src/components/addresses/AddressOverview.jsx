import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatEth, formatTokenValue } from '../../utils/formatters';
import { formatUsdValue } from '../../utils/tokenPrices';
import { useTokenPrices } from '../../context/TokenPriceContext';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import TokenLogo from '../common/TokenLogo';

const AddressOverview = ({ addressData, transactions, tokens, nfts }) => {
  // Check if this is a token contract
  const isTokenContract = addressData.type === 'contract' && addressData.contractType === 'ERC20';
  
  // Get token info if this is a token contract
  const tokenInfo = isTokenContract ? (addressData.tokenInfo || (tokens.length > 0 ? tokens[0] : null)) : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card mb-8"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        {isTokenContract && tokenInfo ? (
          <>
            <div className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center mr-2">
              <TokenLogo 
                token={{
                  address: addressData.address,
                  symbol: tokenInfo.symbol,
                  name: tokenInfo.name
                }} 
                size="md" 
              />
            </div>
            {`${tokenInfo.name} (${tokenInfo.symbol})`}
          </>
        ) : (
          'Overview'
        )}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400 flex items-center">
              <img src="/studio-logo.png" alt="STO" className="w-5 h-5 mr-2" />
              STO Balance:
            </span>
            <span className="font-mono">{formatEth(addressData.balance)}</span>
          </div>
          
          {isTokenContract && tokenInfo && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Total Supply:</span>
                <span className="font-mono">
                  {formatTokenValue(tokenInfo.totalSupply || tokenInfo.rawBalance || tokenInfo.balance, tokenInfo.decimals)} {tokenInfo.symbol}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Decimals:</span>
                <span className="font-mono">{tokenInfo.decimals || 'N/A'}</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Transactions:</span>
            <span className="font-mono">{transactions.length > 0 ? transactions.length : 'N/A'}</span>
          </div>
          
          {/* Always show token holdings dropdown for all addresses */}
          <TokenHoldingsDropdown tokens={tokens} />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Type:</span>
            <span className="font-mono capitalize">{addressData.type}</span>
          </div>
          
          {addressData.type === 'contract' && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Contract Type:</span>
                <span className="font-mono">{addressData.contractType || 'Unknown'}</span>
              </div>
              
              {/* Show owner address for all contract types */}
              {addressData.ownerAddress && (
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Owner:</span>
                  <Link to={`/address/${addressData.ownerAddress}`} className="font-mono text-primary hover:underline text-xs truncate max-w-[200px]">
                    {addressData.ownerAddress}
                  </Link>
                </div>
              )}
              
              {/* Show creator address if different from owner */}
              {addressData.creatorAddress && addressData.creatorAddress !== addressData.ownerAddress && (
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Creator:</span>
                  <Link to={`/address/${addressData.creatorAddress}`} className="font-mono text-primary hover:underline text-xs truncate max-w-[200px]">
                    {addressData.creatorAddress}
                  </Link>
                </div>
              )}
              
              {/* Only show NFTs Owned if there are NFTs or if it's an NFT contract */}
              {(nfts.length > 0 || addressData.contractType === 'ERC721' || addressData.contractType === 'ERC1155') && (
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">NFTs Owned:</span>
                  <span className="font-mono">{nfts.length}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Token Holdings Dropdown Component
const TokenHoldingsDropdown = ({ tokens }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { calculateValue, calculateTotalValue, getPrice } = useTokenPrices();
  
  // Sort tokens by balance (highest first)
  const sortedTokens = [...tokens].sort((a, b) => {
    const balanceA = parseFloat(a.rawBalance || a.balance);
    const balanceB = parseFloat(b.rawBalance || b.balance);
    return balanceB - balanceA;
  });
  
  // Calculate total token value
  const totalTokenValue = calculateTotalValue(tokens);
  const formattedTotalValue = formatUsdValue(totalTokenValue);
  
  return (
    <div className="mt-4">
      <div className="flex justify-between py-2 border-b border-gray-800">
        <span className="text-gray-400">Token Holdings:</span>
        <div className="flex items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <span className="font-mono">{formattedTotalValue} ({tokens.length} Tokens)</span>
          <span className="ml-2">
            {isOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
          </span>
        </div>
      </div>
      
      {/* Dropdown container */}
      {isOpen && (
        <div className="mt-2 border border-gray-700 rounded-lg overflow-hidden shadow-lg bg-dark-300">
          {/* Search box */}
          <div className="p-2 border-b border-gray-700 bg-dark-200">
            <input 
              type="text" 
              placeholder="Search for Token Name" 
              className="w-full p-2 bg-dark-100 border border-gray-600 rounded text-sm"
            />
          </div>
          
          {/* Token list */}
          <div className="max-h-80 overflow-y-auto bg-dark-300">
            {sortedTokens.map((token, index) => (
              <Link key={index} to={`/address/${token.contractAddress}`} className="block">
                <div className="flex justify-between items-center p-3 hover:bg-dark-200 border-b border-gray-700">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center mr-2">
                      <TokenLogo 
                        token={{
                          address: token.contractAddress,
                          symbol: token.symbol,
                          name: token.name
                        }} 
                        size="md" 
                      />
                    </div>
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-xs text-gray-400">{formatTokenValue(token.rawBalance || token.balance, token.decimals)} {token.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">
                      {formatUsdValue(calculateValue(token.rawBalance || token.balance, token.decimals || 18, token.symbol))}
                    </div>
                    <div className="text-xs text-gray-400">@{formatUsdValue(getPrice(token.symbol), false)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* View all holdings button */}
          <div className="p-2 text-center border-t border-gray-700 bg-dark-200">
            <button className="text-primary text-sm hover:underline">
              View All Holdings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressOverview;
