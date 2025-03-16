import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';

import { HashLoader } from 'react-spinners';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { io } from 'socket.io-client';

// Atoms
import {
  authState,
  userBasicInfoState,
  themeState
} from './store/atoms';



// Components
import ProtectedRoutes from './components/ProtectedRoutes';
import PublicRoute from './components/PublicRoute';
import EmailSent from './components/EmailSent';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './components/routes/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
// import WIPBanner from './components/WIPBanner';

// Pages
import CreatePassword from './pages/CreatePassword';
import RequestReset from './pages/RequestReset';
import Notification from './pages/Notifications';
// import PricingPage from './pages/Pricing';
// import ContactPage from './pages/Contact'
// import FAQPage from './pages/FAQ';
// import AboutPage from './pages/About';

// import FeaturesPage from './pages/Features';
import ResetPassword from './pages/ResetPassword';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import Settings from './pages/Settings';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Home from './pages/Home';
import DirectMessage from "./components/DirectMessage";
import NotFound from '@/pages/NotFound';

// Utils
import fetchUserData from './utils/fetchUserData';

function App() {
  const theme = useRecoilValue(themeState);
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useRecoilState(authState);
  const location = useLocation();
  const setBasicInfo = useSetRecoilState(userBasicInfoState);

  
  const noNavbarPages = ['/signin', '/signup', '/create-password', '/reset-password', '/email-sent'];
  const noFooterPages = ['/dashboard', '/users', '/settings', '/signin', '/signup', '/create-password', '/reset-password', '/email-sent'];
  
  
  // Check if current path matches any pattern in pagesWithNavbar
  const shouldHideNavbar = noNavbarPages.includes(location.pathname) || location.pathname.startsWith('/messages/');
  const shouldHideFooter = noFooterPages.includes(location.pathname) || location.pathname.startsWith('/messages/');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    const initializeApp = async () => {
      if (token && userId) {
        setAuth({
          isAuthenticated: true,
          token,
          userId,
          username
        });

        try {
          const userData = await fetchUserData(username, token);
          if (userData) {
            setBasicInfo({
              firstname: userData.firstname,
              lastname: userData.lastname,
              username: userData.username,
              profileImage: userData.profileImage,
              isAdmin: userData.isAdmin,
              isOnline: userData.isOnline
            });
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
      setLoading(false);
    };

    initializeApp();
  }, [setAuth, setBasicInfo]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#242424' }}>
        <HashLoader color="#fff" size={80} />
      </div>
    );
  } 

  return (
    <>
      <div className={theme}>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div className="flex flex-col min-h-screen">
             { !shouldHideNavbar && <Navbar />}
              {/* <WIPBanner /> */}
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/signin" element={<PublicRoute><Signin /></PublicRoute>} />
                  <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoutes><Dashboard /></ProtectedRoutes>} />
                  <Route path="/profile/:username" element={<ProtectedRoutes><ProfilePage /></ProtectedRoutes>} />
                  <Route path="/users" element={<ProtectedRoutes><UsersPage /></ProtectedRoutes>} />
                  <Route path="/messages/:username" element={<ProtectedRoutes><DirectMessage /></ProtectedRoutes>} />
                  <Route path="/create-password" element={<ProtectedRoutes><CreatePassword /></ProtectedRoutes>} />
                  <Route path="/settings" element={<ProtectedRoutes><Settings /></ProtectedRoutes>} />
                  <Route path="/request-reset" element={<RequestReset />} />
                  <Route path="/email-sent" element={<EmailSent />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route 
                    path="/admin" 
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } 
                  />
                  <Route path='*' element={<NotFound />} />
                </Routes>

              </main>
              { !shouldHideFooter && <Footer />}
            </div>
          </GoogleOAuthProvider>
        </div>
      </div>
    </>
  );
}

export default App;
