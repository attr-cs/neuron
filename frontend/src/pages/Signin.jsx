import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useRecoilState, useSetRecoilState } from "recoil"
import axios from 'axios'
import debounce from 'lodash.debounce'
import { jwtDecode } from 'jwt-decode'
import { GoogleLogin } from '@react-oauth/google'
import { authState, userBasicInfoState, userProfileState, userSocialState, userContentState } from "../store/atoms/index"
import fetchUserData from "../utils/fetchUserData"
import { motion, AnimatePresence } from "framer-motion"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, User, Mail, Lock, Brain, ArrowRight, UserPlus, LogIn, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

import NeuralNetwork from "../assets/neural_network_actual.png"
import BrainWaves from "../assets/neural_network_actual.png"


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
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
        onClick={togglePasswordVisibility}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5 text-gray-400" />
        ) : (
          <Eye className="h-5 w-5 text-gray-400" />
        )}
        <span className="sr-only">Toggle password visibility</span>
      </Button>
    </div>
  )
  

function Signin() {
    const navigate = useNavigate()
    const setAuth = useSetRecoilState(authState)
    const setBasicInfo = useSetRecoilState(userBasicInfoState)
    const setProfile = useSetRecoilState(userProfileState)
    const setSocial = useSetRecoilState(userSocialState)
    const setContent = useSetRecoilState(userContentState)
    
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    
    const [formData, setFormData] = useState({
      username: "",
      password: ""
    })
    const [error, setError] = useState("")
  
    function handleChange(e) {
      const { name, value } = e.target
      setFormData({ ...formData, [name]: value })
    }
  
    function togglePasswordVisibility() {
      setShowPassword(!showPassword)
    }
  
    const handleSubmit = async (e) => {
      e.preventDefault()
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

          // Store in localStorage
          localStorage.setItem("token", token)
          localStorage.setItem("userId", userId)
          localStorage.setItem("username", username)

          // Fetch and set user data
          const userData = await fetchUserData(username, token)
          
          // Update all atoms with user data
          setBasicInfo({
            username: userData.username,
            firstname: userData.firstname,
            lastname: userData.lastname,
            profileImageUrl: userData.profileImageUrl,
            isVerified: userData.isVerified,
            isAdmin: userData.isAdmin,
            isOAuthUser: userData.isOAuthUser
          })

          setProfile({
            bio: userData.bio,
            location: userData.location,
            websiteUrl: userData.websiteUrl,
            birthdate: userData.birthdate,
            gender: userData.gender
          })

          setSocial({
            followers: userData.followers,
            following: userData.following,
            isOnline: userData.isOnline
          })

          setContent({
            posts: userData.posts,
            recentActivity: userData.recentActivity
          })

          navigate("/dashboard")
        }
      } catch (err) {
        setError(err.response?.data?.message || "Invalid credentials")
      } finally {
        setIsSubmitting(false)
      }
    }
  
    const onSignInSuccess = async (tokenResponse) => {
      const { email, given_name, family_name, picture } = jwtDecode(JSON.stringify(tokenResponse))
  
      const user = {
        email: email,
        firstname: given_name,
        lastname: family_name,
        profileImageUrl: picture
      }
      
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/google-auth`, user)
      
        const { token, userId, username } = response.data
        setAuth({ isAuthenticated: true, token: token, userId: userId, username: username })
        localStorage.setItem("token", token)
        localStorage.setItem("userId", userId)
        localStorage.setItem("username", username)
        
  
        const userData = await fetchUserData(username, token)
        setBasicInfo({
          username: userData.username,
          firstname: userData.firstname,
          lastname: userData.lastname,
          profileImageUrl: userData.profileImageUrl,
          isVerified: userData.isVerified,
          isAdmin: userData.isAdmin,
          isOAuthUser: userData.isOAuthUser
        })
        navigate('/dashboard')
        setProfile({
          bio: userData.bio,
          location: userData.location,
          websiteUrl: userData.websiteUrl,
          birthdate: userData.birthdate,
          gender: userData.gender
        })
        setSocial({
          followers: userData.followers,
          following: userData.following,
          isOnline: userData.isOnline
        })
        setContent({
          posts: userData.posts,
          recentActivity: userData.recentActivity
        })
        
      } catch (err) {
        console.log(err)
      }
    }
  
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
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
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-purple-600 hover:bg-purple-700"
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
                <Link to="/request-reset" className="text-sm text-indigo-600 hover:underline">
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
                <GoogleLogin
                  onSuccess={onSignInSuccess}
                  onError={(err) => console.log("Failed Signin: ", err)}
                  size="large"
                />
              </motion.div>
              <p className="text-sm text-center">
                Not registered yet?{" "}
                <Link to="/signup" className="text-indigo-600 hover:underline">
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