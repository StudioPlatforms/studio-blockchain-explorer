import React from 'react';
import { motion } from 'framer-motion';

const NftHoldingsTab = ({ nfts }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card mb-8"
    >
      <h2 className="text-xl font-semibold mb-4">NFT Holdings</h2>
      
      {nfts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft, index) => (
            <div key={index} className="bg-dark-200 rounded-lg overflow-hidden">
              <div className="aspect-square bg-dark-100 flex items-center justify-center">
                {nft.image ? (
                  <img 
                    src={nft.image} 
                    alt={nft.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-500 text-center p-4">No Image</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate">{nft.name}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {nft.collection} #{nft.tokenId}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          No NFTs found for this address
        </div>
      )}
    </motion.div>
  );
};

export default NftHoldingsTab;
