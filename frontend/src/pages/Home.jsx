"use client"

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import { useRecoilValue } from 'recoil'
import { MessageCircle, Users, BarChart2, ImageIcon, Zap, Globe, Shield, Sparkles, ChevronDown, Download, Play } from 'lucide-react'
import { themeState } from '../store/atoms'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const HomePage = () => {
  const controls = useAnimation()
  const statsRef = useRef(null)
  const [activeTab, setActiveTab] = useState("connect")
  const theme = useRecoilValue(themeState)
  const navigate = useNavigate()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPlayButton, setShowPlayButton] = useState(true)

  const features = [
    { icon: <MessageCircle className="w-8 h-8" />, title: 'Direct Messaging', description: 'Connect instantly with friends and family' },
    { icon: <Users className="w-8 h-8" />, title: 'Group Chats', description: 'Create and manage group conversations effortlessly' },
    { icon: <BarChart2 className="w-8 h-8" />, title: 'Polls & Surveys', description: 'Gather opinions with interactive polls and surveys' },
    { icon: <ImageIcon className="w-8 h-8" />, title: 'Media Sharing', description: 'Share photos and videos seamlessly with your network' },
    { icon: <Zap className="w-8 h-8" />, title: 'Instant Updates', description: 'Stay informed with real-time notifications' },
    { icon: <Globe className="w-8 h-8" />, title: 'Global Reach', description: 'Connect with users worldwide and expand your horizons' },
    { icon: <Shield className="w-8 h-8" />, title: 'Privacy Controls', description: 'Robust tools to manage your data and privacy settings' },
    { icon: <Sparkles className="w-8 h-8" />, title: 'Smart Filters', description: 'Enhance your content with AI-powered filters and effects' },
  ]

  const stats = [
    { value: '10M+', label: 'Active Users' },
    { value: '5B+', label: 'Messages Sent' },
    { value: '200+', label: 'Countries Reached' },
    { value: '50M+', label: 'Photos Shared' },
    { value: '1B+', label: 'Video Calls' },
    { value: '100M+', label: 'Groups Created' },
  ]

  const tabContent = [
    { id: "connect", title: 'Connect', content: 'Build meaningful relationships with friends, family, and like-minded individuals from around the globe.' },
    { id: "share", title: 'Share', content: 'Express yourself through photos, videos, and stories. Share your moments, big and small, with your Neuron network.' },
    { id: "discover", title: 'Discover', content: 'Explore new ideas, trending topics, and exciting communities tailored to your interests and passions.' },
  ]

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start('visible')
        }
      },
      { threshold: 0.1 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => observer.disconnect()
  }, [controls])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      }
      setDeferredPrompt(null)
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <motion.div
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src="https://picsum.photos/seed/op/1280/720"
          alt="Neuron Banner"
          className="absolute w-full h-full object-cover"
        />
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black' : 'bg-white'} bg-opacity-70`} />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            className={`text-5xl md:text-7xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            variants={itemVariants}
          >
            Welcome to <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">NΞURON</span>
          </motion.h1>
          <motion.p
            className={`text-xl md:text-2xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            variants={itemVariants}
          >
            Connect, Share, Evolve
          </motion.p>
          <motion.div className="space-x-4" variants={itemVariants}>
            <Button
              onClick={() => navigate("/signup")}
              size="lg"
              className="rounded-full"
            >
              Join Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              Learn More
            </Button>
          </motion.div>
        </div>

        <div className="absolute bottom-10 w-full flex flex-col items-center space-y-4">
          {deferredPrompt && (
            <motion.div
              variants={itemVariants}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleInstall}
                size="lg"
                className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out backdrop-blur-sm"
              >
                <Download className="w-5 h-5 mr-2 animate-bounce" />
                <span className="text-sm md:text-base">Install Neuron</span>
              </Button>
            </motion.div>
          )}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-24">
        {/* Features Section */}
        <motion.div variants={containerVariants}>
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Discover Our Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.05 }}>
                <Card>
                  <CardHeader>
                    <div className={`text-blue-500 mb-4 flex justify-center`}>{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Tabs Section */}
        <motion.div variants={containerVariants}>
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Experience Neuron</h2>
          <Tabs defaultValue="connect" className="w-full max-w-2xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              {tabContent.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>{tab.title}</TabsTrigger>
              ))}
            </TabsList>
            {tabContent.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <Card>
                  <CardContent className="mt-6">
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                      {tab.content}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* Video Section */}
        <motion.div variants={containerVariants}>
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            See Neuron in Action
          </h2>
          <div className="relative aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <img
              src="https://picsum.photos/seed/op/1280/720"
              alt="Neuron Demo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button size="lg" className="rounded-full">
                <Play className="w-6 h-6 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          variants={containerVariants}
          className="mb-24"
        >
          <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-500'} text-white py-16`}>
            <CardContent>
              <h2 className="text-4xl font-bold mb-12 text-center">Neuron by the Numbers</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                  <motion.div key={index} className="text-center" variants={itemVariants}>
                    <div className="text-4xl font-bold mb-2">{stat.value}</div>
                    <p>{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={containerVariants} className="text-center mb-24">
          <h2 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ready to Get Started?</h2>
          <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Join millions of users and experience the future of social networking.</p>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <Button
              onClick={() => navigate("/signup")}
              size="lg"
              className="rounded-full"
            >
              Sign Up Now
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default HomePage

