import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { Users, Rocket, Heart, Globe, Award, Coffee } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { themeState } from '../store/atoms';

const AboutPage = () => {
  const theme = useRecoilValue(themeState);
  const [activeSection, setActiveSection] = useState(null);
  const containerRef = useRef(null);

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      image: "/team/alex.jpg",
      bio: "Visionary leader with 10+ years in tech",
    },
    // Add more team members...
  ];

  const milestones = [
    {
      year: "2020",
      title: "The Beginning",
      description: "Founded with a vision to revolutionize communication"
    },
    {
      year: "2021",
      title: "Rapid Growth",
      description: "Reached 1 million active users"
    },
    {
      year: "2022",
      title: "Global Expansion",
      description: "Launched in 50+ countries"
    },
    {
      year: "2023",
      title: "Innovation Award",
      description: "Recognized as industry leader in AI communication"
    }
  ];

  const bind = useGesture({
    onHover: ({ active, args: [index] }) => {
      setActiveSection(active ? index : null);
    },
    onDrag: ({ movement: [x], velocity: [vx], down, args: [index] }) => {
      const element = document.getElementById(`section-${index}`);
      if (element) {
        if (down) {
          element.style.transform = `translateX(${x}px) rotate(${x * 0.1}deg)`;
        } else {
          element.style.transform = 'translateX(0px) rotate(0deg)';
          element.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        }
      }
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-7xl mx-auto py-24 px-4 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            Our Story
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
            Building the future of communication, one message at a time
          </p>
        </motion.div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <Heart />, title: "User-First", description: "Everything we do starts with our users" },
            { icon: <Rocket />, title: "Innovation", description: "Pushing boundaries in communication tech" },
            { icon: <Globe />, title: "Global Impact", description: "Connecting people worldwide" }
          ].map((value, index) => (
            <motion.div
              key={index}
              {...bind(index)}
              id={`section-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} 
                backdrop-blur-sm shadow-lg cursor-pointer
                border border-transparent hover:border-blue-500/20 transition-all duration-300`}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 mb-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"
              >
                {value.icon}
              </motion.div>
              <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-8"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center"
              >
                <span className="text-2xl font-bold text-blue-500">{milestone.year}</span>
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{milestone.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{milestone.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AboutPage; 