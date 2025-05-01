import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatEth } from '../../../utils/formatters';
import { 
  FaExchangeAlt, 
  FaFileContract, 
  FaCoins, 
  FaInfoCircle,
  FaCode,
  FaImage
} from 'react-icons/fa';
import apiService from '../../../services/api';

/**
 * Component for displaying transaction type information
 */
const TransactionTypeInfo = ({ transaction, receipt, hasTokenTransfers, tokenInfo }) => {
  const [contractName, setContractName] = useState(null);
  const [isLoadingContractInfo, setIsLoadingContractInfo] = useState(false);
  const [paymentSplits, setPaymentSplits] = useState([]);
  
  // Fetch contract name if this is a contract interaction
  useEffect(() => {
    const fetchContractInfo = async () => {
      if (transaction.to && (transaction.data !== '0x' || hasTokenTransfers)) {
        try {
          setIsLoadingContractInfo(true);
          
          // Try to get contract name using name() method
          const nameResponse = await apiService.callContractMethod(transaction.to, '0x06fdde03');
          if (nameResponse) {
            setContractName(nameResponse);
          }
          
          // Check for payment splits in logs
          if (receipt?.logs) {
            const transferLogs = receipt.logs.filter(log => 
              log.topics?.[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
            );
            
            // If there are multiple transfer logs with different recipients, it might be a payment split
            if (transferLogs.length > 1) {
              const splits = [];
              
              for (const log of transferLogs) {
                // Get token contract address
                const tokenAddress = log.address;
                
                // Get recipient from topics
                let recipient = '';
                if (log.topics?.length >= 3) {
                  recipient = '0x' + log.topics[2].substring(26);
                }
                
                // Get amount from data
                let amount = '';
                let formattedAmount = '';
                if (log.data && log.data !== '0x') {
                  try {
                    const amountHex = log.data;
                    const amountBigInt = BigInt(amountHex);
                    amount = amountBigInt.toString();
                    
                    // Get token info
                    let symbol = 'TOKEN';
                    let decimals = 18;
                    
                    try {
                      // Try to get token symbol and decimals
                      const symbolResponse = await apiService.callContractMethod(tokenAddress, '0x95d89b41'); // symbol()
                      const decimalsResponse = await apiService.callContractMethod(tokenAddress, '0x313ce567'); // decimals()
                      
                      if (symbolResponse) {
                        symbol = symbolResponse;
                      }
                      
                      if (decimalsResponse) {
                        decimals = parseInt(decimalsResponse);
                      }
                    } catch (error) {
                      console.error('Error fetching token details:', error);
                    }
                    
                    // Format amount based on token decimals
                    formattedAmount = (Number(amount) / Math.pow(10, decimals)).toString();
                    
                    splits.push({
                      recipient,
                      amount: formattedAmount,
                      symbol,
                      tokenAddress
                    });
                  } catch (error) {
                    console.error('Error parsing token amount:', error);
                  }
                }
              }
              
              setPaymentSplits(splits);
            }
          }
          
          setIsLoadingContractInfo(false);
        } catch (error) {
          console.error('Error fetching contract info:', error);
          setIsLoadingContractInfo(false);
        }
      }
    };
    
    fetchContractInfo();
  }, [transaction, receipt, hasTokenTransfers]);
  
  // Determine transaction type
  let txType = 'Unknown';
  let txTypeIcon = <FaInfoCircle className="text-gray-400" />;
  let txTypeColor = 'text-gray-400';
  let txTypeDescription = '';
  
  // Check for contract creation
  if (!transaction.to && receipt?.contractAddress) {
    txType = 'Contract Creation';
    txTypeIcon = <FaFileContract className="text-accent-purple" />;
    txTypeColor = 'text-accent-purple';
    txTypeDescription = (
      <div>
        <p>
          Created contract at{' '}
          <Link to={`/address/${receipt.contractAddress}`} className="text-primary hover:underline">
            {receipt.contractAddress}
          </Link>
        </p>
        {contractName && (
          <p className="mt-1">
            <span className="text-gray-400">Contract Name:</span> {contractName}
          </p>
        )}
      </div>
    );
  }
  // Check for NFT transfer (ERC-721 or ERC-1155)
  else if (
    receipt?.logs?.some(log => 
      // ERC-721 Transfer event
      (log.topics?.[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && log.topics?.length === 4) ||
      // ERC-1155 TransferSingle event
      log.topics?.[0] === '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62' ||
      // ERC-1155 TransferBatch event
      log.topics?.[0] === '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb'
    )
  ) {
    txType = 'NFT Transfer';
    txTypeIcon = <FaImage className="text-accent-purple" />;
    txTypeColor = 'text-accent-purple';
    
    // Find the NFT transfer log
    const nftTransferLog = receipt.logs.find(log => 
      // ERC-721 Transfer event
      (log.topics?.[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && log.topics?.length === 4) ||
      // ERC-1155 TransferSingle event
      log.topics?.[0] === '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62' ||
      // ERC-1155 TransferBatch event
      log.topics?.[0] === '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb'
    );
    
    if (nftTransferLog) {
      // Get NFT contract address
      const nftAddress = nftTransferLog.address;
      
      // For ERC-721 Transfer
      if (nftTransferLog.topics?.[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && nftTransferLog.topics?.length === 4) {
        const from = '0x' + nftTransferLog.topics[1].substring(26);
        const to = '0x' + nftTransferLog.topics[2].substring(26);
        const tokenId = BigInt('0x' + nftTransferLog.topics[3].substring(2)).toString();
        
        txTypeDescription = (
          <div>
            <p>
              Transferred NFT with ID <strong>{tokenId}</strong> from{' '}
              <Link to={`/address/${from}`} className="text-primary hover:underline">
                {from.substring(0, 8)}...
              </Link>{' '}
              to{' '}
              <Link to={`/address/${to}`} className="text-primary hover:underline">
                {to.substring(0, 8)}...
              </Link>
            </p>
            <p className="mt-1">
              <span className="text-gray-400">NFT Contract:</span>{' '}
              <Link to={`/address/${nftAddress}`} className="text-primary hover:underline">
                {nftAddress.substring(0, 8)}...
              </Link>
              {contractName && <span className="ml-1">({contractName})</span>}
            </p>
          </div>
        );
      }
      // For ERC-1155 TransferSingle
      else if (nftTransferLog.topics?.[0] === '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62') {
        txTypeDescription = (
          <div>
            <p>
              Transferred ERC-1155 NFT from{' '}
              <Link to={`/address/${transaction.from}`} className="text-primary hover:underline">
                {transaction.from.substring(0, 8)}...
              </Link>{' '}
              to{' '}
              <Link to={`/address/${transaction.to}`} className="text-primary hover:underline">
                {transaction.to.substring(0, 8)}...
              </Link>
            </p>
            <p className="mt-1">
              <span className="text-gray-400">NFT Contract:</span>{' '}
              <Link to={`/address/${nftAddress}`} className="text-primary hover:underline">
                {nftAddress.substring(0, 8)}...
              </Link>
              {contractName && <span className="ml-1">({contractName})</span>}
            </p>
          </div>
        );
      }
      // For ERC-1155 TransferBatch
      else {
        txTypeDescription = (
          <div>
            <p>
              Batch transferred ERC-1155 NFTs from{' '}
              <Link to={`/address/${transaction.from}`} className="text-primary hover:underline">
                {transaction.from.substring(0, 8)}...
              </Link>{' '}
              to{' '}
              <Link to={`/address/${transaction.to}`} className="text-primary hover:underline">
                {transaction.to.substring(0, 8)}...
              </Link>
            </p>
            <p className="mt-1">
              <span className="text-gray-400">NFT Contract:</span>{' '}
              <Link to={`/address/${nftAddress}`} className="text-primary hover:underline">
                {nftAddress.substring(0, 8)}...
              </Link>
              {contractName && <span className="ml-1">({contractName})</span>}
            </p>
          </div>
        );
      }
    } else {
      txTypeDescription = 'Transferred NFT';
    }
  }
  // Check for token transfer (ERC-20)
  else if (
    (transaction.tokenTransfers && transaction.tokenTransfers.length > 0) ||
    (receipt?.logs?.some(log => 
      log.topics?.[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && log.topics?.length === 3
    ))
  ) {
    // Use tokenTransfers from the API if available
    if (transaction.tokenTransfers && transaction.tokenTransfers.length > 0) {
      const transfer = transaction.tokenTransfers[0];
      txType = `${transfer.symbol} Transfer`;
      txTypeIcon = <FaCoins className="text-accent-teal" />;
      txTypeColor = 'text-accent-teal';
      
      txTypeDescription = (
        <div>
          <p>
            Transferred <strong>{transfer.amount} {transfer.symbol}</strong> from{' '}
            <Link to={`/address/${transfer.from}`} className="text-primary hover:underline">
              {transfer.from.substring(0, 8)}...
            </Link>{' '}
            to{' '}
            <Link to={`/address/${transfer.to}`} className="text-primary hover:underline">
              {transfer.to.substring(0, 8)}...
            </Link>
          </p>
          <p className="mt-1">
            <span className="text-gray-400">Token Contract:</span>{' '}
            <Link to={`/address/${transfer.tokenAddress}`} className="text-primary hover:underline">
              {transfer.tokenAddress.substring(0, 8)}...
            </Link>
            {transfer.name && <span className="ml-1">({transfer.name})</span>}
          </p>
        </div>
      );
    }
    // Try to decode token transfer details from logs
    else if (receipt?.logs?.length > 0) {
      const transferLog = receipt.logs.find(log => 
        log.topics?.[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && log.topics?.length === 3
      );
      
      if (transferLog) {
        // Get token contract address
        const tokenAddress = transferLog.address;
        
        // Get sender and recipient from topics
        const from = '0x' + transferLog.topics[1].substring(26);
        const to = '0x' + transferLog.topics[2].substring(26);
        
        // Get amount from data
        let amount = '';
        let formattedAmount = '';
        if (transferLog.data && transferLog.data !== '0x') {
          try {
            const amountHex = transferLog.data;
            const amountBigInt = BigInt(amountHex);
            amount = amountBigInt.toString();
            
            // Format amount based on token decimals (assuming 18 decimals for most tokens)
            const decimals = tokenInfo?.decimals || 18;
            formattedAmount = (Number(amount) / Math.pow(10, decimals)).toLocaleString();
          } catch (error) {
            console.error('Error parsing token amount:', error);
          }
        }
        
        // Use token info if available
        const tokenSymbol = tokenInfo?.symbol || 'Token';
        const tokenName = tokenInfo?.name || '';
        
        txType = `${tokenSymbol} Transfer`;
        txTypeIcon = <FaCoins className="text-accent-teal" />;
        txTypeColor = 'text-accent-teal';
        
        txTypeDescription = (
          <div>
            <p>
              Transferred {formattedAmount ? <strong>{formattedAmount} {tokenSymbol}</strong> : 'tokens'} from{' '}
              <Link to={`/address/${from}`} className="text-primary hover:underline">
                {from.substring(0, 8)}...
              </Link>{' '}
              to{' '}
              <Link to={`/address/${to}`} className="text-primary hover:underline">
                {to.substring(0, 8)}...
              </Link>
            </p>
            <p className="mt-1">
              <span className="text-gray-400">Token Contract:</span>{' '}
              <Link to={`/address/${tokenAddress}`} className="text-primary hover:underline">
                {tokenAddress.substring(0, 8)}...
              </Link>
              {tokenName && <span className="ml-1">({tokenName})</span>}
            </p>
          </div>
        );
      } else {
        txType = 'Token Transfer';
        txTypeIcon = <FaCoins className="text-accent-teal" />;
        txTypeColor = 'text-accent-teal';
        txTypeDescription = 'Interacted with token contract';
      }
    }
  }
  // Check for contract interaction
  else if (transaction.to && (transaction.data !== '0x' && transaction.data !== undefined)) {
    txType = 'Contract Interaction';
    txTypeIcon = <FaCode className="text-accent-teal" />;
    txTypeColor = 'text-accent-teal';
    
    // Get method signature (first 4 bytes of data)
    const methodSignature = transaction.data.substring(0, 10);
    
    txTypeDescription = (
      <div>
        <p>
          Interacted with contract at{' '}
          <Link to={`/address/${transaction.to}`} className="text-primary hover:underline">
            {transaction.to}
          </Link>
        </p>
        {contractName && (
          <p className="mt-1">
            <span className="text-gray-400">Contract Name:</span> {contractName}
          </p>
        )}
        <p className="mt-1">
          <span className="text-gray-400">Method:</span> {methodSignature}
        </p>
        
        {/* Show payment splits if any */}
        {paymentSplits.length > 0 && (
          <div className="mt-2">
            <p className="text-gray-400">Payment Splits:</p>
            <ul className="mt-1 space-y-1">
              {paymentSplits.map((split, index) => (
                <li key={index} className="flex items-center text-sm">
                  <span className="text-accent-teal mr-1">{split.amount} {split.symbol}</span>
                  <span className="text-gray-400 mx-1">to</span>
                  <Link to={`/address/${split.recipient}`} className="text-primary hover:underline">
                    {split.recipient.substring(0, 8)}...
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  // Regular STO transfer
  else if (transaction.to && transaction.value) {
    txType = 'STO Transfer';
    txTypeIcon = <FaExchangeAlt className="text-primary" />;
    txTypeColor = 'text-primary';
    
    // Format STO value
    let stoValue = '0';
    try {
      if (typeof transaction.value === 'number') {
        stoValue = formatEth(transaction.value, { includeSymbol: false });
      } else if (transaction.value?.hex) {
        const valueInWei = BigInt(transaction.value.hex);
        const valueInEth = Number(valueInWei) / 1e18;
        stoValue = valueInEth.toLocaleString(undefined, { maximumFractionDigits: 6 });
      } else if (typeof transaction.value === 'string' && transaction.value.startsWith('0x')) {
        const valueInWei = BigInt(transaction.value);
        const valueInEth = Number(valueInWei) / 1e18;
        stoValue = valueInEth.toLocaleString(undefined, { maximumFractionDigits: 6 });
      } else {
        stoValue = formatEth(transaction.value, { includeSymbol: false });
      }
    } catch (error) {
      console.error('Error formatting STO value:', error);
    }
    
    const usdValue = (parseFloat(stoValue.replace(/,/g, '')) * 0.10).toFixed(2);
    
    txTypeDescription = (
      <div>
        <p>
          Transferred <strong>{stoValue} STO</strong> (${usdValue}) from{' '}
          <Link to={`/address/${transaction.from}`} className="text-primary hover:underline">
            {transaction.from.substring(0, 8)}...
          </Link>{' '}
          to{' '}
          <Link to={`/address/${transaction.to}`} className="text-primary hover:underline">
            {transaction.to.substring(0, 8)}...
          </Link>
        </p>
      </div>
    );
  }
  // Fallback for any other transaction type
  else {
    txType = 'Unknown Transaction';
    txTypeIcon = <FaInfoCircle className="text-gray-400" />;
    txTypeColor = 'text-gray-400';
    txTypeDescription = 'This transaction type could not be determined';
  }
  
  return (
    <div className="bg-dark-200 p-4 rounded-lg mb-6">
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-lg bg-dark-100 flex items-center justify-center mr-3 mt-1">
          {txTypeIcon}
        </div>
        <div className="flex-1">
          <h3 className={`font-medium ${txTypeColor}`}>{txType}</h3>
          <div className="text-sm text-gray-400 mt-1">{txTypeDescription}</div>
          
          {isLoadingContractInfo && (
            <div className="mt-2 text-xs text-gray-500">Loading contract details...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionTypeInfo;
