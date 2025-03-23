import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';
import { HashLoader } from 'react-spinners';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ScrollToTop } from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoutes from './components/ProtectedRoutes';
import PublicRoute from './components/PublicRoute';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import Settings from './pages/Settings';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Home from './pages/Home';
import DirectMessage from "./components/DirectMessage";
import NotFound from '@/pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import CreatePassword from './pages/CreatePassword';
import RequestReset from './pages/RequestReset';
import EmailSent from './components/EmailSent';
import ResetPassword from './pages/ResetPassword';
import AdminRoute from './components/routes/AdminRoute';
import NotificationsPage from './pages/NotificationsPage';
import BannedInterface from './pages/BannedInterface';
import PostPage from './pages/PostPage';

// Atoms
import {
  authState,
  userBasicInfoState,
  themeState
} from './store/atoms';

// Pages
// import WIPBanner from './components/WIPBanner';

// import FeaturesPage from './pages/Features';

// Utils
import fetchUserData from './utils/fetchUserData';

function App() {
  const theme = useRecoilValue(themeState);
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useRecoilState(authState);
  const location = useLocation();
  const setBasicInfo = useSetRecoilState(userBasicInfoState);
  const [isBanned, setIsBanned] = useState(false);

  
  const noNavbarPages = ['/signin', '/signup', '/create-password', '/reset-password', '/email-sent', '/banned'];
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
          
          if (userData.isBanned) {
              // Log out the banned user
              localStorage.clear();
              setAuth({
                isAuthenticated: false,
                token: null,
                userId: null,
                username: null,
                isAdmin: false,
              });
              setBasicInfo({
                firstname: null,
                lastname: null,
                username: null,
                profileImage: null,
                isAdmin: false,
                isOnline: false,
              });
              
              setIsBanned(true);
              
              return;
          }

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

  if (isBanned) {
    return <BannedInterface />;
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#242424' 
      }}>
        <div className="sm:scale-100 scale-75">
          <HashLoader color="#fff" size={60} />
        </div>
      </div>
    );
  } 

  return (
    <>
      <div className={theme}>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div className="flex flex-col min-h-screen">
              {!shouldHideNavbar && <Navbar />}
              {/* <WIPBanner /> */}
              <main className="flex-grow">
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/signin" element={<PublicRoute><Signin /></PublicRoute>} />
                  <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoutes><Dashboard /></ProtectedRoutes>} />
                  <Route path="/profile/:username" element={<ProtectedRoutes><ProfilePage /></ProtectedRoutes>} />
                  <Route path="/users" element={<ProtectedRoutes><UsersPage /></ProtectedRoutes>} />
                  <Route path="/messages/:username" element={<ProtectedRoutes><DirectMessage /></ProtectedRoutes>} />
                  <Route path="/banned" element={<BannedInterface />} />
                  <Route path="/create-password" element={<ProtectedRoutes><CreatePassword /></ProtectedRoutes>} />
                  <Route path="/settings" element={<Settings />} />
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
                  <Route 
                    path="/notifications" 
                    element={
                      <ProtectedRoutes>
                        <NotificationsPage />
                      </ProtectedRoutes>
                    } 
                  />
                  <Route 
                    path="/post/:postId" 
                    element={
                      <ProtectedRoutes>
                        <PostPage />
                      </ProtectedRoutes>
                    } 
                  />
                  <Route path='*' element={<NotFound />} />
                </Routes>
              </main>
              
            </div>
          </GoogleOAuthProvider>
        </div>
      </div>
    </>
  );
}

export default App;



