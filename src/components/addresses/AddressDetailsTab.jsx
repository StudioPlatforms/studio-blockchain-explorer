import React from 'react';
import NftHoldingsTab from './NftHoldingsTab';
import ContractTab from '../contracts/ContractTab';

const AddressDetailsTab = ({ addressData, nfts, activeTab }) => {
  return (
    <>
      {/* NFTs Tab */}
      {activeTab === 'nfts' && <NftHoldingsTab nfts={nfts} />}
      
      {/* Contract Tab */}
      {activeTab === 'contract' && addressData.type === 'contract' && (
        <ContractTab addressData={addressData} />
      )}
    </>
  );
};

export default AddressDetailsTab;
