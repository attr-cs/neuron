import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';

import { HashLoader } from 'react-spinners';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';
import { io } from 'socket.io-client';

// Atoms
import {
  authState,
  userBasicInfoState,
  userProfileState,
  userSocialState,
  userContentState,
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

// Pages
import CreatePassword from './pages/CreatePassword';
import RequestReset from './pages/RequestReset';
import ResetPassword from './pages/ResetPassword';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import Settings from './pages/Settings';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Home from './pages/Home';
import DirectMessage from "./pages/DirectMessage";
import NotFound from '@/pages/NotFound';

// Utils
import fetchUserData from './utils/fetchUserData';

function App() {
  const location = useLocation();
  const theme = useRecoilValue(themeState);
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useRecoilState(authState);
  const setBasicInfo = useSetRecoilState(userBasicInfoState);
  const setProfile = useSetRecoilState(userProfileState);
  const setSocial = useSetRecoilState(userSocialState);
  const setContent = useSetRecoilState(userContentState);

  // Pages where footer should be hidden
  // Pages where header/navbar should be hidden
  const noHeaderPages = ['/signin', '/signup', '/request-reset', '/create-password', '/reset-password', '/email-sent'];
  const shouldHideHeader = noHeaderPages.includes(location.pathname)||
  location.pathname.startsWith('/messages');
  const noFooterPages = ['/signin', '/signup', '/request-reset', '/create-password', '/reset-password', '/email-sent'];
  const shouldHideFooter =
  noFooterPages.includes(location.pathname) ||
  location.pathname.startsWith('/messages');


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
          // Fetch and set user data
          const userData = await fetchUserData(username, token);
          if (userData) {
            setBasicInfo({
              username: userData.username,
              firstname: userData.firstname,
              lastname: userData.lastname,
              profileImageUrl: userData.profileImageUrl,
              isVerified: userData.isVerified,
              isAdmin: userData.isAdmin,
              isOAuthUser: userData.isOAuthUser
            });

            setProfile({
              bio: userData.bio,
              location: userData.location,
              websiteUrl: userData.websiteUrl,
              birthdate: userData.birthdate,
              gender: userData.gender
            });

            setSocial({
              followers: userData.followers,
              following: userData.following,
              isOnline: userData.isOnline
            });

            setContent({
              posts: userData.posts,
              recentActivity: userData.recentActivity
            });
          }

        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
      setLoading(false);
    };

    initializeApp();
  }, [setAuth, setBasicInfo, setProfile, setSocial, setContent]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      const socket = io(import.meta.env.VITE_BACKEND_URL.replace('/api', ''), {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        withCredentials: true
      });

      socket.on('connect', () => {
        socket.emit('user_connected', auth.userId);
      });

      return () => {
        
        socket.disconnect();
      };
    }
  }, [auth.isAuthenticated, auth.userId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#242424' }}>
        <HashLoader color="#fff" size={80} />
      </div>
    );
  } 

  return (
    <div className={theme}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <div className="flex flex-col min-h-screen">
            {!shouldHideHeader && <Navbar />}

            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />


                {/* Public Routes */}
                <Route path="/signin" element={<PublicRoute><Signin /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoutes><Dashboard /></ProtectedRoutes>} />
                <Route path="/profile/:username" element={<ProtectedRoutes><ProfilePage /></ProtectedRoutes>} />
                <Route path="/users" element={<ProtectedRoutes><UsersPage /></ProtectedRoutes>} />
                <Route path="/create-password" element={<ProtectedRoutes><CreatePassword /></ProtectedRoutes>} />
                <Route path="/settings" element={<ProtectedRoutes><Settings /></ProtectedRoutes>} />
                <Route path="/messages/:username" element={<ProtectedRoutes><DirectMessage /></ProtectedRoutes>} />



                <Route path="/request-reset" element={<RequestReset />} />
                <Route path="/email-sent" element={<EmailSent />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
                
                {/* Redirects Unknown paths to home */}
                <Route path='*' element={<NotFound />} />
              </Routes>

            </main>
            {!shouldHideFooter && <Footer />}
          </div>
        </GoogleOAuthProvider>
      </div>
    </div>
  );
}

export default App;
