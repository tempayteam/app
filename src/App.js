import { useContext, useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAccount, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { ConnectWalletContext, CPGAddress, TokenContext, WalletAddressContext } from './constant/constant';
import AdminDashboard from './pages/adminPanel/admin-dashboard/AdminDashboard';
import AdminDispute from './pages/adminPanel/admin-dispute/AdminDispute';
import Home from './pages/dashboard/Home';
import Dispute from './pages/dispute/Dispute';
import ReportProblem from './pages/dispute/ReportProblem';
import SupportCenter from './pages/dispute/SupportCenter';
import GetPaid from './pages/getPaid/GetPaid';
import Header from './pages/header/Header';
import Navbar from './pages/header/Navbar';
import NotFound from './pages/notFound/NotFound';
import OnGoing from './pages/onGoing/OnGoing';
import Pay from './pages/pay/Pay';
import AccountRegistration from './pages/registration/AccountRegistration';
import { config } from './utils/wagmiConfig';
import { initialTokenList } from './constant/constant';
import 'react-loading-skeleton/dist/skeleton.css';
import 'react-tooltip/dist/react-tooltip.css';
import { readContractData } from './utils/contractInstance';
import { CPGABI } from './ABI/ABI';
const PrivateRoute = ({ children }) => {
  useEffect(() => {
    if (!localStorage.getItem("userData")) {
      localStorage.setItem("userData", JSON.stringify({ authenticated: true }));
    }
  }, []);

  return children;
};

const Layout = ({ children }) => {
  const { isAdmin, setIsAdmin, setAdminWalletAddress, adminWalletAddress } = useContext(WalletAddressContext);
  const [isInitialized, setIsInitialized] = useState(false);
  const { address: walletAddress } = useAccount();
  const loc = useLocation();

  useEffect(() => {
    document.title = 'TempPay';
  }, [loc.pathname]);

  const userRoutes = ['/', '/home', '/pay', '/get-paid', '/dispute', '/on-going', '/dispute/report-problem', '/dispute/support-center'];
  const adminRoutes = ['/', '/home', '/admin-dashboard', '/admin-dispute', '/pay', '/get-paid', '/dispute', '/on-going', '/dispute/report-problem', '/dispute/support-center'];

  const getAdminWalletAddress = async () => {
    try {
      const adminAddress = await readContractData(CPGAddress, CPGABI, 'admin', []);
      setAdminWalletAddress(adminAddress);
    } catch (error) {
      console.log(error.message);
    }
  };

  const checkIfAdmin = () => {
    if (walletAddress && adminWalletAddress) {
      setIsAdmin(walletAddress.toLowerCase() === adminWalletAddress.toLowerCase());
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    getAdminWalletAddress();
  }, [walletAddress]);

  useEffect(() => {
    checkIfAdmin();
  }, [adminWalletAddress, walletAddress]);

  useEffect(() => {
    setIsInitialized(true);
  }, [isAdmin, loc.pathname]);

  if (!isInitialized) return null;

  const allowedRoutes = isAdmin ? adminRoutes : userRoutes;

  // Check if current route is valid
  const isValidRoute = allowedRoutes.some(
    (route) => new RegExp(`^${route}(/)?$`).test(loc.pathname)
  );

  const hideNav = !isValidRoute;

  if (!isValidRoute) {
    return <NotFound />;
  }

  return (
    <>
      {!hideNav && <Navbar />}
      {!hideNav && <Header />}
      <div className={!hideNav ? 'lg:ml-[265px] lg:max-w-full' : ''}>
        <div className='lg:mx-auto'>{children}</div>
      </div>
    </>
  );
};

function App() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [adminWalletAddress, setAdminWalletAddress] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [matchedNetId, setMatchedNetId] = useState(true);
  const [tokenList, setTokenList] = useState(initialTokenList);
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectWalletContext.Provider value={{ connected, setConnected, matchedNetId, setMatchedNetId }}>
          <WalletAddressContext.Provider value={{ walletAddress, setWalletAddress, adminWalletAddress, setAdminWalletAddress, isAdmin, setIsAdmin }}>
            <TokenContext.Provider value={{ tokenList, setTokenList }}>
              <Router>
                <Layout>
                  <Routes>
                    <Route exact path='/' element={<Navigate to='/home' replace />} />
                    <Route exact path='/home' element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route exact path='/pay' element={<PrivateRoute><Pay /></PrivateRoute>} />
                    <Route exact path='/get-paid' element={<PrivateRoute><GetPaid /></PrivateRoute>} />
                    <Route exact path='/dispute' element={<PrivateRoute><Dispute /></PrivateRoute>} />
                    <Route exact path='/on-going' element={<PrivateRoute><OnGoing /></PrivateRoute>} />

                    {isAdmin && (
                      <>
                        <Route exact path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                        <Route exact path="/admin-dispute" element={<PrivateRoute><AdminDispute /></PrivateRoute>} />
                      </>
                    )}

                    <Route exact path='/create-account' element={<PrivateRoute><AccountRegistration /></PrivateRoute>} />
                    <Route exact path="/dispute/report-problem" element={<PrivateRoute><ReportProblem /></PrivateRoute>} />
                    <Route exact path="/dispute/support-center" element={<PrivateRoute><SupportCenter /></PrivateRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <ToastContainer theme="dark" position="bottom-right" />
                </Layout>
              </Router>
            </TokenContext.Provider>
          </WalletAddressContext.Provider>
        </ConnectWalletContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
