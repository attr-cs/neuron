import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';
import { authState, userBasicInfoState } from "../store/atoms/index";
import fetchUserData from "../utils/fetchUserData";
import uploadImage from "../utils/uploadImage";
import { motion, AnimatePresence } from "framer-motion";
import BannedInterface from './BannedInterface';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Eye, EyeOff, User, Lock, Brain, LogIn, Loader2 } from 'lucide-react';

import BrainWaves from "../assets/neural_network_actual.png";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import defaultAvatar from '../utils/defaultAvatar';
import { Toaster } from "@/components/ui/toaster";

const InputWithIcon = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Input 
      {...props} 
      className="pl-10 pr-4 h-11 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 focus-visible:ring-zinc-200 dark:focus-visible:ring-zinc-800 rounded-xl font-medium text-sm transition-all" 
    />
    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 h-4.5 w-4.5" />
  </div>
);

const PasswordInput = ({ showPassword, togglePasswordVisibility, ...props }) => (
  <div className="relative">
    <Input 
      {...props} 
      type={showPassword ? "text" : "password"} 
      className="pl-10 pr-10 h-11 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 focus-visible:ring-zinc-200 dark:focus-visible:ring-zinc-800 rounded-xl font-medium text-sm transition-all" 
    />
    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 h-4.5 w-4.5" />
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-450 transition-colors"
      onClick={togglePasswordVisibility}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={showPassword ? "hide" : "show"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.12 }}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  </div>
);

function Signin() {
  const navigate = useNavigate();
  const setAuth = useSetRecoilState(authState);
  const setBasicInfo = useSetRecoilState(userBasicInfoState);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");

  const { toast } = useToast();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/signin`, 
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        const { token, userId, username, isBanned } = response.data;
        if (isBanned) {
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
          navigate("/banned");
          return;
        }

        setAuth({ 
          isAuthenticated: true, 
          token, 
          userId, 
          username 
        });

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", token);
        storage.setItem("userId", userId);
        storage.setItem("username", username);

        const userData = await fetchUserData(username, token);
      
        setBasicInfo({
          firstname: userData.firstname,
          lastname: userData.lastname,
          username: userData.username,
          profileImage: userData.profileImage || {
            imageId: "",
            url: defaultAvatar,
            thumbUrl: defaultAvatar,
            displayUrl: defaultAvatar
          },
          isAdmin: userData.isAdmin || false,
          isOnline: userData.isOnline || false
        });

        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid credentials";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignInSuccess = async (tokenResponse) => {
    setIsGoogleLoading(true);
    setError("");
    
    try {
      const decoded = jwtDecode(tokenResponse.credential);
      const { email, given_name, family_name, picture } = decoded;
  
      let profileImage = null;
      if (picture) {
        try {
          const uploadedImage = await uploadImage(picture);
          profileImage = {
            imageId: uploadedImage.imageId || "",
            url: uploadedImage.url || picture,
            thumbUrl: uploadedImage.thumbUrl || picture,
            displayUrl: uploadedImage.displayUrl || picture
          };
        } catch (error) {
          console.error('Failed to upload profile image:', error);
        }
      }
      
      const user = {
        email,
        firstname: given_name,
        lastname: family_name,
        profileImage
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/google-auth`, 
        user
      );

      const { token, userId, username, isBanned } = response.data;
      if (isBanned) {
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
        
        navigate("/banned");
        return;
      }
      
      setAuth({ 
        isAuthenticated: true, 
        token, 
        userId, 
        username 
      });

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);
          
      const userData = await fetchUserData(username, token);
      if (userData.isBanned) {
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

      setBasicInfo({
        firstname: userData.firstname,
        lastname: userData.lastname,
        username: userData.username,
        profileImage: userData.profileImage || {
          imageId: "",
          url: defaultAvatar,
          thumbUrl: defaultAvatar,
          displayUrl: defaultAvatar
        },
        isAdmin: userData.isAdmin || false,
        isOnline: userData.isOnline || false
      });
          
      toast({
        title: "Success",
        description: "Successfully signed in with Google",
      });
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Authentication failed";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username/Email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  if (isBanned) {
    return <BannedInterface />;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Toaster />
      
      {/* Left Column Manifesto Panel (Strictly Human-Curated Minimal Editorial Style) */}
      <div className="hidden md:flex lg:w-1/2 bg-zinc-950 relative overflow-hidden items-center justify-center p-12 select-none border-r border-zinc-900">
        
        {/* Soft, clean, ambient lighting that enhances typography without distracting */}
        <div className="absolute top-1/3 left-1/4 w-[40vw] h-[40vw] bg-zinc-800/10 rounded-full blur-[140px] pointer-events-none" />
        
        {/* Crisp static asset rendering under dark, elegant overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.06] grayscale contrast-125 mix-blend-luminosity">
          <img
            src={BrainWaves}
            alt="Structural neural lines"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <Brain className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black tracking-widest text-white font-mono">NΞURON</span>
          </motion.div>

          <div className="space-y-4 pt-4">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight"
            >
              The social synapse built on intent.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed"
            >
              Exchange knowledge, synchronize connections, and experience chronological discussions in an ecosystem completely clear of ad injection or telemetry manipulation.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Right Column Entrance Form Block */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-900 rounded-[32px] p-2 sm:p-4 shadow-sm">
          
          <CardHeader className="space-y-2 pb-6">
            <div className="flex md:hidden items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white flex items-center justify-center">
                <Brain className="w-4 h-4 text-white dark:text-black" />
              </div>
              <span className="text-base font-black tracking-widest text-zinc-950 dark:text-white font-mono">NΞURON</span>
            </div>
            
            <CardTitle className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-sm font-medium text-zinc-400 dark:text-zinc-500">
              Enter your credentials below to access your workspace
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Username or Email</Label>
                <InputWithIcon
                  icon={User}
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username or email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Password</Label>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  showPassword={showPassword}
                  togglePasswordVisibility={togglePasswordVisibility}
                />
              </div>

              {/* Touch optimized checkbox region (native feel) */}
              <div className="flex items-center space-x-2.5 py-1.5">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  className="rounded-md h-5 w-5 border-zinc-300 dark:border-zinc-800 text-zinc-950"
                />
                <label
                  htmlFor="remember"
                  className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400 cursor-pointer select-none"
                >
                  Remember my session
                </label>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold h-11 rounded-xl transition-all shadow-md active:scale-[0.99] mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-xs font-semibold text-red-500 text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="text-center pt-1.5">
              <Link 
                to="/request-reset" 
                className="text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </CardContent>

          <Separator className="my-2 bg-zinc-150 dark:bg-zinc-900" />

          <CardFooter className="flex flex-col space-y-5 pt-3">
            <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Or continue with</div>
            
            <div className="flex justify-center w-full min-h-[44px] items-center">
              {isGoogleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
              ) : (
                <GoogleLogin
                  onSuccess={onSignInSuccess}
                  onError={(err) => {
                    console.error("Failed Signin:", err);
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "Google sign in failed",
                    });
                  }}
                  size="large"
                  shape="circle"
                  theme={document.body.classList.contains('dark') ? "filled_black" : "outline"}
                />
              )}
            </div>

            <p className="text-xs sm:text-sm text-center text-zinc-500 dark:text-zinc-400 font-medium">
              Not registered yet?{" "}
              <Link to="/signup" className="font-bold text-zinc-950 dark:text-white hover:underline transition-colors ml-1">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Signin;