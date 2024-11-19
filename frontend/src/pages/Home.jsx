import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useRecoilState } from 'recoil';
import { MessageCircle, Users, BarChart2, Image as ImageIcon, Zap, Globe, Shield, Sparkles, ChevronDown, Play } from 'lucide-react';
import { themeState } from '../store/atoms'; 

const HomePage = () => {
  const controls = useAnimation();
  const statsRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [theme, setTheme] = useRecoilState(themeState);
  const navigate = useNavigate();

  const features = [
    { icon: <MessageCircle className="w-12 h-12" />, title: 'Direct Messaging', description: 'Connect instantly with friends and family' },
    { icon: <Users className="w-12 h-12" />, title: 'Group Chats', description: 'Create and manage group conversations effortlessly' },
    { icon: <BarChart2 className="w-12 h-12" />, title: 'Polls & Surveys', description: 'Gather opinions with interactive polls and surveys' },
    { icon: <ImageIcon className="w-12 h-12" />, title: 'Media Sharing', description: 'Share photos and videos seamlessly with your network' },
    { icon: <Zap className="w-12 h-12" />, title: 'Instant Updates', description: 'Stay informed with real-time notifications' },
    { icon: <Globe className="w-12 h-12" />, title: 'Global Reach', description: 'Connect with users worldwide and expand your horizons' },
    { icon: <Shield className="w-12 h-12" />, title: 'Privacy Controls', description: 'Robust tools to manage your data and privacy settings' },
    { icon: <Sparkles className="w-12 h-12" />, title: 'Smart Filters', description: 'Enhance your content with AI-powered filters and effects' },
  ];

  const stats = [
    { value: '10M+', label: 'Active Users' },
    { value: '5B+', label: 'Messages Sent' },
    { value: '200+', label: 'Countries Reached' },
    { value: '50M+', label: 'Photos Shared' },
    { value: '1B+', label: 'Video Calls' },
    { value: '100M+', label: 'Groups Created' },
  ];

  const tabContent = [
    { title: 'Connect', content: 'Build meaningful relationships with friends, family, and like-minded individuals from around the globe.' },
    { title: 'Share', content: 'Express yourself through photos, videos, and stories. Share your moments, big and small, with your Neuron network.' },
    { title: 'Discover', content: 'Explore new ideas, trending topics, and exciting communities tailored to your interests and passions.' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start('visible');
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [controls]);


  const [showPlayButton, setShowPlayButton] = useState(true);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          preload="auto"
          className="absolute w-full h-full object-cover"
          // poster="https://picsum.photos/seed/op/1280/720"
        > 
          <source src="https://apivideo-demo.s3.amazonaws.com/hello.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black' : 'bg-white'} bg-opacity-70`} />
        <div className="relative z-10 text-center px-4">
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
            <button onClick={()=>navigate("/signup")} className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105`}>
              Join Now
            </button>
            <button className={`${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} ${theme === 'dark' ? 'text-white' : 'text-gray-800'} font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
              Learn More
            </button>
          </motion.div>
        </div>
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Features Section */}
        <motion.div variants={containerVariants} className="mb-24">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Discover Our Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg text-center`}
              >
                <div className={`text-blue-500 mb-4 flex justify-center`}>{feature.icon}</div>
                <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Tabs Section */}
        <motion.div variants={containerVariants} className="mb-24">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Experience Neuron</h2>
          <div className="flex justify-center mb-8">
            {tabContent.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 mx-2 rounded-full transition-colors ${
                  activeTab === index
                    ? `${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
                    : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg max-w-2xl mx-auto`}
          >
            {tabContent[activeTab].content}
          </motion.div>
        </motion.div>

{/* Video Section */}
<motion.div variants={containerVariants} className="mb-24">
  <h2
    className={`text-4xl font-bold mb-12 text-center ${
      theme === 'dark' ? 'text-white' : 'text-gray-900'
    }`}
  >
    See Neuron in Action
  </h2>
  <div className="relative aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
    <video
      id="neuronVideo"
      className="w-full h-full object-cover"
      poster="https://picsum.photos/seed/animation/1280/720" // High-quality sample thumbnail
      controls={false}
      preload="auto"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      onPlay={() => setShowPlayButton(false)} // Hide play button on play
      onEnded={() => setShowPlayButton(true)} // Show play button on end
    >
      <source
        src="https://dhruvbhardwaj.publit.io/file/1851190-uhd-3840-2160-25fps-1.mp4" // High-quality sample video
        type="video/mp4"
      />
      Your browser does not support the video tag.
    </video>
    {showPlayButton && (
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={() => {
            const video = document.getElementById('neuronVideo');
            video.play();
          }}
          className={`w-20 h-20 flex items-center justify-center rounded-full ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors`}
        >
          <Play className="w-8 h-8 text-white" />
        </button>
      </div>
    )}
  </div>
</motion.div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          variants={containerVariants}
          className={`mb-24 ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-500'} text-white py-16 rounded-xl`}
        >
          <h2 className="text-4xl font-bold mb-12 text-center">Neuron by the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div key={index} className="text-center" variants={itemVariants}>
                <div className="text-4xl font-bold mb-2 ">{stat.value}</div>
                <p>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={containerVariants} className="text-center mb-24">
          <h2 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ready to Get Started?</h2>
          <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Join millions of users and experience the future of social networking.</p>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            onClick={()=>navigate("/signup")}
            className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform`}
          >
            Sign Up Now
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;