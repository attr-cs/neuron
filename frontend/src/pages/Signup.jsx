import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useRecoilState, useSetRecoilState } from "recoil"
import axios from 'axios'
import debounce from 'lodash.debounce'
import { jwtDecode } from 'jwt-decode'
import { GoogleLogin } from '@react-oauth/google'
import { authState, userState } from "../store/atoms/index"
import fetchUserData from "../utils/fetchUserData"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, User, Mail, Lock, Brain, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

import NeuralNetwork from "../assets/neural_network_actual.png"

const InputWithIcon = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Input {...props} className="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500" />
    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
  </div>
)

const PasswordInput = ({ showPassword, togglePasswordVisibility, ...props }) => (
  <div className="relative">
    <Input {...props} type={showPassword ? "text" : "password"} className="pl-10 pr-10 py-2 bg-white/50 backdrop-blur-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500" />
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

const FormStep = ({ title, fields, formData, handleChange, showPassword, togglePasswordVisibility, usernameError }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {fields.map((field) => (
      <div key={field} className="space-y-2">
        <Label htmlFor={field} className="text-sm font-medium text-gray-700">
          {field.charAt(0).toUpperCase() + field.slice(1)}
        </Label>
        {field === 'password' ? (
          <PasswordInput
            id={field}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            placeholder={`Enter your ${field}`}
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
          <p className="text-sm text-red-600 mt-1">{usernameError}</p>
        )}
      </div>
    ))}
  </div>
)

function Signup() {
  const navigate = useNavigate()
  const setUser = useSetRecoilState(userState)
  const [, setAuth] = useRecoilState(authState)
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    username: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [isFormValid, setIsFormValid] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (currentStep < formSteps.length - 1) {
      nextStep()
      return
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/signup`, formData)
      if (response.status === 200) {
        const { token, userId, username } = response.data
        setAuth({ isAuthenticated: true, token: token, userId: userId, username: username })
        localStorage.setItem("token", token)
        localStorage.setItem("userId", userId)
        localStorage.setItem("username", username)
        const userData = await fetchUserData(username, token)
        setUser({ user: userData })
        navigate("/dashboard")
      }
    } catch (err) {
      setError("Error: " + err)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const usernameCheck = debounce(async (value) => {
    if (value.length > 0) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/check-username`, { username: value })
        if (response.data.exists) {
          setUsernameError("This Username is already taken!")
        } else {
          setUsernameError("")
        }
      } catch (err) {
        console.log(err)
      }
    } else {
      setUsernameError("")
    }
  }, 300)

  useEffect(() => {
    if (formData.username) usernameCheck(formData.username)
  }, [formData.username])

  function togglePasswordVisibility() {
    setShowPassword(!showPassword)
  }

  const onSignUpSuccess = async (tokenResponse) => {
    const decoded = jwtDecode(JSON.stringify(tokenResponse))
    const { email, given_name, family_name, picture } = decoded

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
      navigate('/dashboard')
      const userData = await fetchUserData(username, token)
      setUser({ user: userData })
    } catch (err) {
      console.log(err)
    }
  }

  const formSteps = [
    { fields: ['firstname', 'lastname'], title: 'Personal Info' },
    { fields: ['email', 'username'], title: 'Account Details' },
    { fields: ['password'], title: 'Security' },
  ]

  const nextStep = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  useEffect(() => {
    const currentFields = formSteps[currentStep].fields
    const isStepValid = currentFields.every(field => formData[field].trim() !== '')
    setIsFormValid(isStepValid && !usernameError)
  }, [formData, currentStep, usernameError])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${NeuralNetwork})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col justify-center p-8 text-white"
        >
          <h1 className="text-5xl font-bold mb-2">Join the <span className="text-purple-400">N</span>eural Network</h1>
          <p className="text-xl">Connect, Learn, and Grow with NΞURON</p>
        </motion.div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
              <Brain className="w-6 h-6 mr-2" />
              Welcome to NΞURON
            </CardTitle>
            <CardDescription className="text-center text-purple-100">Create your account in a few simple steps</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
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
              <div className="flex justify-between mt-6">
                {currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={prevStep} className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={!isFormValid} 
                  className={`ml-auto flex items-center ${currentStep === formSteps.length - 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {currentStep === formSteps.length - 1 ? (
                    <>Sign Up <CheckCircle className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
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
          </CardContent>
          <Separator className="my-4" />
          <CardFooter className="flex flex-col space-y-4 p-6">
            <div className="text-sm text-gray-500 text-center">Or continue with</div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex justify-center w-full"
            >
              <GoogleLogin
                onSuccess={onSignUpSuccess}
                onError={(err) => console.log("Failed Signup: ", err)}
                size="large"
              />
            </motion.div>
            <p className="text-sm text-center">
              Already have an account?{" "}
              <Link to="/signin" className="text-purple-600 hover:underline font-medium">
                Log in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Signup