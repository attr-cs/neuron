import { Routes, Route, useLocation} from 'react-router-dom'
import './App.css'
import { HashLoader } from 'react-spinners'
import { GoogleOAuthProvider } from '@react-oauth/google';

// importing pages
import ProtectedRoutes from './components/ProtectedRoutes';
import PublicRoute from './components/PublicRoute';
import CreatePassword from './pages/CreatePassword';
import RequestReset from './pages/RequestReset';
import ProfilePage from './pages/ProfilePage'
import Dashboard from './pages/Dashboard';
import  ResetPassword from './pages/ResetPassword'
import UsersPage from './pages/UsersPage'
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Home from './pages/Home';

// importing components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EmailSent from "./components/EmailSent"
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { authState, userState } from './store/atoms';
import fetchUserData from './utils/fetchUserData';

function App() {

  const location = useLocation();
  const pathsWithNoNavbar = ['/signup', '/create-password', '/request-reset', '/email-sent', '/reset-password'];
const pathsWithNoFooter = ['/signup', '/signin', '/create-password', '/request-reset', '/email-sent', '/reset-password'];

const shouldHideNavbar = pathsWithNoNavbar.some(path => location.pathname.includes(path));
const shouldHideFooter = pathsWithNoFooter.some(path => location.pathname.includes(path));

  const [loading, setLoading] = useState(true)

  const [ ,setAuth] = useRecoilState(authState);
  const [ ,setUser] = useRecoilState(userState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    const fetchUser = async () => {
      if (token && userId) {
        setAuth({ isAuthenticated: true, token: token, userId: userId, username: username });
        try {
          const userData = await fetchUserData(username, token);
          setUser({ user: userData });
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
      setLoading(false);
    };

    fetchUser(); 

  }, [setAuth, setUser]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#242424' }}>
        <HashLoader color="#fff" size={80} />
      </div>
    );
  } 
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  return (
    <div className="app-container">
    <GoogleOAuthProvider clientId={clientId}>
      <div>
      {!shouldHideNavbar && <Navbar />}
        
      <Routes>
        <Route path="/" element={<Home/>} />

        {/* Public Routes */}
        <Route path="/signin" element={<PublicRoute><Signin/></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup/></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoutes><Dashboard/></ProtectedRoutes>} />
        <Route path="/profile/:username" element={<ProtectedRoutes><ProfilePage/></ProtectedRoutes>} />
        <Route path="/users" element={<ProtectedRoutes><UsersPage/></ProtectedRoutes>} />
        <Route path="/create-password" element={<ProtectedRoutes><CreatePassword/></ProtectedRoutes>} />
        



        <Route path="/request-reset" element={<RequestReset/>} />
        <Route path="/email-sent" element={<EmailSent/>} />
        <Route path="/reset-password/:token" element={<ResetPassword/>} />


        {/* Redirects Unknown paths to home */}
        <Route path='*' element={<Home/>}/>
      </Routes>
      {!shouldHideFooter && <Footer />}

        
        </div>    
        </GoogleOAuthProvider>
    </div>
  )
}

export default App
