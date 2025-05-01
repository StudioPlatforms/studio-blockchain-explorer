import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Context Providers
import { TokenPriceProvider } from './context/TokenPriceContext';

// Pages
import HomePage from './pages/HomePage';
import BlocksPage from './pages/BlocksPage';
import BlockDetailsPage from './pages/BlockDetailsPage';
import TransactionsPage from './pages/TransactionsPage';
import TransactionDetailsPage from './pages/TransactionDetailsPage';
import AddressPage from './pages/AddressPage';
import TokensPage from './pages/TokensPage';
import TokenDetailsPage from './pages/TokenDetailsPage';
import NftsPage from './pages/NftsPage';
import NftDetailsPage from './pages/NftDetailsPage';
import AIDashboardPage from './pages/AIDashboardPage';
import AITestPage from './pages/AITestPage';
import SearchPage from './pages/SearchPage';
import ContractVerificationPage from './pages/ContractVerificationPage';
import ContractDetailsPage from './pages/ContractDetailsPage';
import TokenAdminPage from './pages/TokenAdminPage';

// Custom redirect components that explicitly extract parameters from the URL
const TransactionRedirect = () => {
  const { hash } = useParams();
  return <Navigate to={`/transactions/${hash}`} replace />;
};

const BlockRedirect = () => {
  const { blockNumber } = useParams();
  return <Navigate to={`/blocks/${blockNumber}`} replace />;
};

const AddressRedirect = () => {
  const { address } = useParams();
  return <Navigate to={`/address/${address}`} replace />;
};

const TokenRedirect = () => {
  const { address } = useParams();
  return <Navigate to={`/tokens/${address}`} replace />;
};

const ContractRedirect = () => {
  const { address } = useParams();
  return <Navigate to={`/contracts/${address}`} replace />;
};

const NftRedirect = () => {
  const { address, tokenId } = useParams();
  return <Navigate to={`/nfts/${address}/${tokenId}`} replace />;
};

function App() {
  return (
    <TokenPriceProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-dark-200 text-white">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/blocks" element={<BlocksPage />} />
              <Route path="/blocks/:blockNumber" element={<BlockDetailsPage />} />
              {/* Block redirects for wallet compatibility - using custom redirect components */}
              <Route path="/block/:blockNumber" element={<BlockRedirect />} />
              <Route path="/b/:blockNumber" element={<BlockRedirect />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/transactions/:hash" element={<TransactionDetailsPage />} />
              {/* Redirects for MetaMask and other wallet compatibility - using custom redirect components */}
              <Route path="/tx/:hash" element={<TransactionRedirect />} />
              <Route path="/transaction/:hash" element={<TransactionRedirect />} />
              <Route path="/address/:address" element={<AddressPage />} />
              {/* Address redirects for wallet compatibility - using custom redirect components */}
              <Route path="/a/:address" element={<AddressRedirect />} />
              <Route path="/accounts/:address" element={<AddressRedirect />} />
              <Route path="/tokens" element={<TokensPage />} />
              <Route path="/tokens/:address" element={<TokenDetailsPage />} />
              {/* Token redirects for wallet compatibility - using custom redirect components */}
              <Route path="/token/:address" element={<TokenRedirect />} />
              <Route path="/t/:address" element={<TokenRedirect />} />
              <Route path="/nfts" element={<NftsPage />} />
              <Route path="/nfts/:address/:tokenId" element={<NftDetailsPage />} />
              {/* NFT redirect for wallet compatibility - using custom redirect components */}
              <Route path="/nft/:address/:tokenId" element={<NftRedirect />} />
              <Route path="/ai-dashboard" element={<AIDashboardPage />} />
              <Route path="/ai-test" element={<AITestPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/verify-contract" element={<ContractVerificationPage />} />
              <Route path="/contracts/:address" element={<ContractDetailsPage />} />
              {/* Contract redirects for wallet compatibility - using custom redirect components */}
              <Route path="/contract/:address" element={<ContractRedirect />} />
              <Route path="/c/:address" element={<ContractRedirect />} />
              <Route path="/token-admin" element={<TokenAdminPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </TokenPriceProvider>
  );
}

export default App;
