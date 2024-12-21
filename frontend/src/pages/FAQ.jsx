import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { Plus, Minus, MessageCircle, Search, ChevronDown } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { themeState } from '../store/atoms';

const FAQPage = () => {
  const theme = useRecoilValue(themeState);
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragY, setDragY] = useState(0);
  const containerRef = useRef(null);

  const faqs = [
    {
      question: "What is Neuron?",
      answer: "Neuron is a cutting-edge communication platform designed for modern teams and individuals, offering real-time messaging, group chats, and seamless collaboration tools.",
      category: "general"
    },
    {
      question: "Is my data secure on Neuron?",
      answer: "Yes, we implement end-to-end encryption and follow industry-best security practices to ensure your data remains private and secure.",
      category: "security"
    },
    {
      question: "Can I use Neuron on multiple devices?",
      answer: "Absolutely! Neuron syncs seamlessly across all your devices - desktop, mobile, and web browsers.",
      category: "usage"
    },
    {
      question: "What makes Neuron different from other platforms?",
      answer: "Neuron combines intuitive design with powerful features like AI-assisted communication, advanced analytics, and customizable workflows.",
      category: "general"
    },
    {
      question: "Is there a limit to file sharing?",
      answer: "Free users can share files up to 100MB, while premium users enjoy unlimited file sharing capabilities.",
      category: "features"
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes, we provide 24/7 customer support through chat, email, and priority phone support for premium users.",
      category: "support"
    },
    {
      question: "Can I integrate Neuron with other tools?",
      answer: "Neuron offers extensive API support and native integrations with popular tools like Slack, GitHub, and Jira.",
      category: "features"
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "You have 30 days to export your data after cancellation. After that, data is securely deleted from our servers.",
      category: "security"
    },
    {
      question: "Are there any hidden fees?",
      answer: "No hidden fees! Our pricing is transparent and all features are clearly listed in each plan.",
      category: "billing"
    },
    {
      question: "Can I try Neuron before buying?",
      answer: "Yes! We offer a 14-day free trial of our premium features with no credit card required.",
      category: "billing"
    }
  ];

  const bind = useGesture({
    onDrag: ({ movement: [_, y], velocity: [__, vy], down, args: [index] }) => {
      if (down) {
        setDragY(y);
        // Add velocity-based threshold for better feel
        if (Math.abs(y) > 50 || Math.abs(vy) > 0.5) {
          setActiveIndex(index === activeIndex ? null : index);
          setDragY(0);
        }
      } else {
        setDragY(0);
      }
    }
  }, {
    drag: {
      bounds: { top: -50, bottom: 50 },
      rubberband: true,
      filterTaps: true
    }
  });

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}
    >
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-7xl mx-auto py-12 px-4 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-8 inline-block p-4 bg-blue-500/10 rounded-full"
          >
            <MessageCircle className="w-12 h-12 text-blue-500" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            How can we help?
          </h1>
          
          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-full text-lg
                  ${theme === 'dark' ? 'bg-gray-800/50 text-white' : 'bg-white/50 text-gray-900'}
                  border border-gray-200 dark:border-gray-700
                  focus:ring-2 focus:ring-blue-500 outline-none
                  backdrop-blur-sm transition-all duration-300`}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 pb-24" ref={containerRef}>
        <AnimatePresence>
          <motion.div layout className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                {...bind(index)}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                style={{ y: activeIndex === index ? dragY : 0 }}
                className={`rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} 
                  backdrop-blur-sm shadow-lg overflow-hidden cursor-pointer
                  border border-transparent hover:border-blue-500/20 transition-all duration-300`}
              >
                <motion.div
                  className="p-6"
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                >
                  <div className="flex justify-between items-center gap-4">
                    <h3 className="text-xl font-semibold">{faq.question}</h3>
                    <motion.div
                      animate={{ 
                        rotate: activeIndex === index ? 180 : 0,
                        scale: activeIndex === index ? 1.1 : 1
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-blue-500" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="mt-4 text-gray-600 dark:text-gray-400"
                      >
                        {faq.answer}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mt-4 text-sm text-blue-500"
                        >
                          Category: {faq.category}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FAQPage; 