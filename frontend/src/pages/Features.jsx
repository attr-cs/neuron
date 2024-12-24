import { motion, useAnimation, transform } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { useRef, useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { themeState } from '../store/atoms';
import { MessageCircle, Users, BarChart2, Image as ImageIcon, Zap, Globe, Shield, Sparkles, Phone } from 'lucide-react';


const FeaturesPage = () => {
  const theme = useRecoilValue(themeState);
  const [activeFeature, setActiveFeature] = useState(null);
  const controls = useAnimation();
  const featuresRef = useRef(null);

  const features = [
    {
      icon: <MessageCircle className="w-12 h-12" />,
      title: 'Direct Messaging',
      description: 'Connect instantly with friends and family',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: 'Group Chats',
      description: 'Create and manage group conversations effortlessly',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <BarChart2 className="w-12 h-12" />,
      title: 'Analytics',
      description: 'Track your conversations and engagement',
      color: 'from-green-500 to-lime-500'
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: 'Customization',
      description: 'Tailor your experience with themes and customizations',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: 'Security',
      description: 'Your data is safe and secure with our advanced encryption',
      color: 'from-red-500 to-rose-500'
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: 'Global Reach',
      description: 'Connect with people from all over the world',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: <Phone className="w-12 h-12" />,
      title: 'Calls',
      description: 'Make voice and video calls to your friends and family',
      color: 'from-green-500 to-lime-500'
    }
    // ... other features similar to Home.jsx lines 21-30
  ];

  const bind = useGesture(
    {
      onHover: ({ active, args: [index] }) => {
        setActiveFeature(active ? index : null);
      },
      onDrag: ({ movement: [x, y], velocity: [vx, vy], down, args: [index] }) => {
        const card = document.getElementById(`feature-${index}`);
        if (!card) return;

        // Calculate rotation based on velocity for smoother movement
        const rotation = transform(vx, [-2, 2], [-15, 15]);
        
        // Use transform3d for better performance
        if (down) {
          card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
          card.style.transition = 'none';
        } else {
          card.style.transform = 'translate3d(0px, 0px, 0) rotate(0deg)';
          card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        }
      }
    },
    {
      drag: {
        bounds: { left: -100, right: 100, top: -50, bottom: 50 },
        rubberband: true,
        filterTaps: true,
        preventDefault: true
      }
    }
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            Powerful Features
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
            Discover all the innovative tools and capabilities that make our platform unique
          </p>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              id={`feature-${index}`}
              key={index}
              {...bind(index)}
              initial={{ opacity: 0, y: 50 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: activeFeature === index ? 1.05 : 1
              }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 30
              }}
              className={`relative p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} 
                shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer
                transform will-change-transform`}
              style={{ 
                touchAction: 'none',
                userSelect: 'none'
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} 
                opacity-0 hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              
              <motion.div
                animate={{
                  rotate: activeFeature === index ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-6"
              >
                <div className={`p-3 rounded-full bg-gradient-to-r ${feature.color} text-white`}>
                  {feature.icon}
                </div>
              </motion.div>

              <h3 className="text-xl font-bold mb-4 text-center">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">{feature.description}</p>

              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: activeFeature === index ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ 
                  backgroundImage: `linear-gradient(to right, ${feature.color})`,
                  transformOrigin: 'left'
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturesPage; 