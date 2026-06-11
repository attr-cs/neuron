import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import axios from 'axios';
import debounce from 'lodash.debounce';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';
import { authState, userBasicInfoState } from "../store/atoms/index";
import fetchUserData from "../utils/fetchUserData";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, User, Mail, Lock, Brain, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

import NeuralNetwork from "../assets/neural_network_actual.png";
import uploadImage from "../utils/uploadImage";
import defaultAvatar from '../utils/defaultAvatar';

const InputWithIcon = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Input 
      {...props} 
      className="pl-10 pr-4 h-11 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 focus-visible:ring-zinc-200 dark:focus-visible:ring-zinc-800 rounded-xl font-medium text-sm transition-all shadow-sm" 
    />
    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 h-4.5 w-4.5" />
  </div>
);

const PasswordInput = ({ showPassword, togglePasswordVisibility, ...props }) => (
  <div className="relative">
    <Input 
      {...props} 
      type={showPassword ? "text" : "password"} 
      className="pl-10 pr-10 h-11 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 focus-visible:ring-zinc-200 dark:focus-visible:ring-zinc-800 rounded-xl font-medium text-sm transition-all shadow-sm" 
    />
    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 h-4.5 w-4.5" />
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
      onClick={togglePasswordVisibility}
    >
      {showPassword ? (
        <EyeOff className="h-4.5 w-4.5" />
      ) : (
        <Eye className="h-4.5 w-4.5" />
      )}
      <span className="sr-only">Toggle password visibility</span>
    </Button>
  </div>
);

const FormStep = ({ title, fields, formData, handleChange, showPassword, togglePasswordVisibility, usernameError }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900 mb-2">
      <h3 className="text-sm font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">{title}</h3>
    </div>
    {fields.map((field) => (
      <div key={field} className="space-y-1.5">
        <Label htmlFor={field} className="text-xs font-bold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider">
          {field === 'firstname' ? 'First Name' : field === 'lastname' ? 'Last Name' : field}
        </Label>
        {field === 'password' ? (
          <PasswordInput
            id={field}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            placeholder={`Create a strong ${field}`}
            required
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
          />
        ) : (
          <InputWithIcon
            icon={field === 'email' ? Mail : User}
            id={field}
            name={field}
            type={field === 'email' ? 'email' : 'text'}
            value={formData[field]}
            onChange={handleChange}
            placeholder={`Enter your ${field}`}
            required
          />
        )}
        {field === 'username' && usernameError && (
          <p className="text-xs font-semibold text-red-500 mt-1">{usernameError}</p>
        )}
      </div>
    ))}
  </div>
);

function Signup() {
  const navigate = useNavigate();
  const setAuth = useSetRecoilState(authState);
  const setBasicInfo = useSetRecoilState(userBasicInfoState);
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < formSteps.length - 1) {
      nextStep();
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/signup`, 
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

        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("username", username);

        const userData = await fetchUserData(username, token);
        
        setBasicInfo({
          username: userData.username,
          firstname: userData.firstname,
          lastname: userData.lastname,
          profileImage: userData.profileImage || {
            imageId: "",
            url: defaultAvatar,
            thumbUrl: defaultAvatar,
            displayUrl: defaultAvatar
          },
          isAdmin: userData.isAdmin,
          isOnline: userData.isOnline
        });

        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  const usernameCheck = debounce(async (value) => {
    if (value.length > 0) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/check-username`, { username: value });
        if (response.data.exists) {
          setUsernameError("This Username is already taken!");
        } else {
          setUsernameError("");
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      setUsernameError("");
    }
  }, 300);

  useEffect(() => {
    if (formData.username) usernameCheck(formData.username);
  }, [formData.username]);

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  const onSignUpSuccess = async (tokenResponse) => {
    setIsGoogleLoading(true);
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
      
      setBasicInfo({
        username: userData.username,
        firstname: userData.firstname,
        lastname: userData.lastname,
        profileImage: userData.profileImage || {
          imageId: "",
          url: defaultAvatar,
          thumbUrl: defaultAvatar,
          displayUrl: defaultAvatar
        },
        isOnline: userData.isOnline,
        isAdmin: userData.isAdmin,
      });
  
      toast({
        title: "Success",
        description: "Successfully signed up with Google",
      });
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Google auth error:', err);
      setError(err.response?.data?.message || "Authentication failed");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to sign up with Google",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const formSteps = [
    { fields: ['firstname', 'lastname'], title: 'Personal Info' },
    { fields: ['email', 'username'], title: 'Account Details' },
    { fields: ['password'], title: 'Security' },
  ];

  const nextStep = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = () => {
    const currentFields = formSteps[currentStep].fields;
    const isValid = currentFields.every(field => formData[field]?.trim());
    setIsFormValid(isValid);
    return isValid;
  };

  useEffect(() => {
    validateStep();
  }, [formData, currentStep]);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Toaster />
      
      {/* Left Column Manifesto Panel (Strictly Human-Curated Minimal Editorial Style) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 relative overflow-hidden items-center justify-center p-12 select-none border-r border-zinc-900">
        
        {/* Soft, clean, ambient lighting */}
        <div className="absolute top-1/3 left-1/4 w-[40vw] h-[40vw] bg-zinc-850/10 rounded-full blur-[140px] pointer-events-none" />
        
        {/* Crisp static asset rendering under dark, elegant overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.06] grayscale contrast-125 mix-blend-luminosity">
          <img
            src={NeuralNetwork}
            alt="Neural connectivity visual grid"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <Brain className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black tracking-widest text-white font-mono">NΞURON</span>
          </div>

          <div className="space-y-4 pt-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight">
              Create your sovereign synapse workspace.
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed">
              Step into an unmanipulated, highly optimized social feed. Designed for authentic exchange, zero tracking telemetry, and native performance integrations.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column Entrance Form Block */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-900 rounded-[32px] p-2 sm:p-4 shadow-sm">
          
          <CardHeader className="space-y-2 pb-6">
            <div className="flex lg:hidden items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white flex items-center justify-center">
                <Brain className="w-4 h-4 text-white dark:text-black" />
              </div>
              <span className="text-base font-black tracking-widest text-zinc-950 dark:text-white font-mono">NΞURON</span>
            </div>
            
            <CardTitle className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight text-center flex items-center justify-center gap-2">
              Welcome to NΞURON
            </CardTitle>
            <CardDescription className="text-center text-sm font-medium text-zinc-400 dark:text-zinc-500">
              Create your account in a few simple steps
            </CardDescription>

            {/* Stepped progress indicators */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {formSteps.map((_, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-350",
                    idx === currentStep 
                      ? "w-8 bg-zinc-900 dark:bg-white" 
                      : idx < currentStep 
                        ? "w-2 bg-zinc-400 dark:bg-zinc-700" 
                        : "w-2 bg-zinc-200 dark:bg-zinc-900"
                  )}
                />
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <FormStep
                    {...formSteps[currentStep]}
                    formData={formData}
                    handleChange={handleChange}
                    showPassword={showPassword}
                    togglePasswordVisibility={togglePasswordVisibility}
                    usernameError={usernameError}
                  />
                </motion.div>
              </AnimatePresence>

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

              <div className="flex gap-3 pt-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="w-full border-zinc-200 dark:border-zinc-800 rounded-xl h-11 text-xs font-bold font-mono tracking-widest uppercase hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={!isFormValid || isSubmitting} 
                  className="w-full bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold h-11 rounded-xl transition-all shadow-md active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                      Creating...
                    </>
                  ) : currentStep === formSteps.length - 1 ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4.5 w-4.5" />
                      <span>Create</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <Separator className="my-2 bg-zinc-150 dark:bg-zinc-900" />

          <CardFooter className="flex flex-col space-y-4 pt-3 p-4 sm:p-6">
            <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Or continue with</div>
            
            <div className="flex justify-center w-full min-h-[44px] items-center">
              {isGoogleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
              ) : (
                <GoogleLogin
                  onSuccess={onSignUpSuccess}
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
              Already have an account?{" "}
              <Link to="/signin" className="font-bold text-zinc-950 dark:text-white hover:underline transition-colors ml-1">
                Log in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Signup;