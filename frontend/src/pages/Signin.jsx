import  { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {  useSetRecoilState } from "recoil"
import axios from 'axios'
// import debounce from 'lodash.debounce'
import { jwtDecode } from 'jwt-decode'
import { GoogleLogin } from '@react-oauth/google'
import { authState, userBasicInfoState } from "../store/atoms/index"
import fetchUserData from "../utils/fetchUserData"
import uploadImage from "../utils/uploadImage"
import { motion, AnimatePresence } from "framer-motion"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { Eye, EyeOff, User,  Lock, Brain,   LogIn,  Loader2 } from 'lucide-react'


import BrainWaves from "../assets/neural_network_actual.png"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import defaultAvatar from '../utils/defaultAvatar'
import { Toaster } from "@/components/ui/toaster"

const InputWithIcon = ({ icon: Icon, ...props }) => (
    <div className="relative">
      <Input {...props} className="pl-10 pr-4 py-2" />
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
    </div>
  )
  
  const PasswordInput = ({ showPassword, togglePasswordVisibility, ...props }) => (
    <div className="relative">
      <Input {...props} type={showPassword ? "text" : "password"} className="pl-10 pr-10 py-2" />
      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={showPassword ? "hide" : "show"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5 text-gray-400" />
        ) : (
          <Eye className="h-5 w-5 text-gray-400" />
        )}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </div>
  )
  

function Signin() {
    const navigate = useNavigate()
    const setAuth = useSetRecoilState(authState)
    const setBasicInfo = useSetRecoilState(userBasicInfoState)
    
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    
    const [formData, setFormData] = useState({
      username: "",
      password: ""
    })
    const [error, setError] = useState("")
  
    const { toast } = useToast()
  
    function handleChange(e) {
      const { name, value } = e.target
      setFormData({ ...formData, [name]: value })
    }
  
    function togglePasswordVisibility() {
      setShowPassword(!showPassword)
    }
  
    const handleSubmit = async (e) => {
      e.preventDefault()
      if (!validateForm()) return

      setIsSubmitting(true)
      setError("")

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/user/signin`, 
          formData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (response.status === 200) {
          const { token, userId, username } = response.data

          // Set auth state
          setAuth({ 
            isAuthenticated: true, 
            token, 
            userId, 
            username 
          })

          // Store in localStorage/sessionStorage based on remember me
          const storage = rememberMe ? localStorage : sessionStorage
          storage.setItem("token", token)
          storage.setItem("userId", userId)
          storage.setItem("username", username)

          // Fetch and set user data
          const userData = await fetchUserData(username, token)
          
          // Ensure we're setting all required fields from userBasicInfoState
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
          })

          toast({
            title: "Success",
            description: "Successfully signed in!",
          })
          navigate("/dashboard")
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Invalid credentials"
        setError(errorMessage)
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  
    const onSignInSuccess = async (tokenResponse) => {
      setIsGoogleLoading(true)
      setError("")
      
      try {
        const decoded = jwtDecode(tokenResponse.credential)
        const { email, given_name, family_name, picture } = decoded
    
        // Upload profile image to ImgBB first
        let profileImage = null
        if (picture) {
          try {
            const uploadedImage = await uploadImage(picture)
            profileImage = {
              imageId: uploadedImage.imageId || "",
              url: uploadedImage.url || picture,
              thumbUrl: uploadedImage.thumbUrl || picture,
              displayUrl: uploadedImage.displayUrl || picture
            }
          } catch (error) {
            console.error('Failed to upload profile image:', error)
          }
        }
        
        const user = {
          email,
          firstname: given_name,
          lastname: family_name,
          profileImage
        }
        
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/user/google-auth`, 
          user
        )

          const { token, userId, username } = response.data
        
        setAuth({ 
          isAuthenticated: true, 
          token, 
          userId, 
          username 
        })

            localStorage.setItem("token", token)
            localStorage.setItem("userId", userId)
            localStorage.setItem("username", username)
            
        const userData = await fetchUserData(username, token)
      
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
        })
            
        toast({
          title: "Success",
          description: "Successfully signed in with Google",
        })
        navigate('/dashboard')
        } catch (err) {
        const errorMessage = err.response?.data?.message || "Authentication failed"
        setError(errorMessage)
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        })
      } finally {
        setIsGoogleLoading(false)
      }
    }
  
    const validateForm = () => {
      if (!formData.username.trim()) {
        setError("Username/Email is required")
        return false
      }
      if (!formData.password) {
        setError("Password is required")
        return false
      }
      return true
      }
  
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <Toaster />
        <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${BrainWaves})` }}>
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col justify-center p-8 text-white"
          >
            <h1 className="text-5xl font-bold mb-2">Welcome Back to <span className="text-yellow-400">NΞURON</span></h1>
            <p className="text-xl">Your gateway to neural connections and knowledge</p>
          </motion.div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
                <Brain className="w-6 h-6 mr-2 text-indigo-500" />
                Log In to NΞURON
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username/Email</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 text-sm text-red-600 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="mt-4 text-center">
                <Link 
                  to="/request-reset" 
                  className="text-sm text-indigo-600 hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </CardContent>
            <Separator className="my-4" />
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-gray-500 text-center">Or continue with</div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex justify-center w-full"
              >
                {isGoogleLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  </div>
                ) : (
                <GoogleLogin
                  onSuccess={onSignInSuccess}
                    onError={(err) => {
                      console.error("Failed Signin:", err)
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Google sign in failed",
                      })
                    }}
                  size="large"
                />
                )}
              </motion.div>
              <p className="text-sm text-center">
                Not registered yet?{" "}
                <Link to="/signup" className="text-indigo-600 hover:underline transition-colors">
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  
  }

export default Signin
