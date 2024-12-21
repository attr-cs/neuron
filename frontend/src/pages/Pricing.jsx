import { motion } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { Check, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { themeState } from '../store/atoms';

const PricingPage = () => {
  const theme = useRecoilValue(themeState);
  const [activeCard, setActiveCard] = useState(null);
  
  const plans = [
    {
      name: "Free",
      price: "0",
      features: ["Basic messaging", "Limited storage", "Standard support"],
      recommended: false
    },
    {
      name: "Pro",
      price: "9.99",
      features: ["Unlimited messaging", "50GB storage", "Priority support", "Advanced features"],
      recommended: true
    },
    {
      name: "Enterprise",
      price: "29.99",
      features: ["Custom solutions", "Unlimited storage", "24/7 support", "API access", "Admin tools"],
      recommended: false
    }
  ];

  const bind = useGesture({
    onHover: ({ active, args: [index] }) => {
      setActiveCard(active ? index : null);
    },
    onDrag: ({ movement: [x], down, args: [index] }) => {
      if (!down && Math.abs(x) > 100) {
        // Handle card swipe
      }
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} py-20 px-4`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Flexible plans for every need
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              {...bind(index)}
              whileHover={{ scale: 1.05, y: -10 }}
              animate={activeCard === index ? { scale: 1.05, y: -10 } : { scale: 1, y: 0 }}
              className={`relative p-6 rounded-2xl shadow-xl backdrop-blur-sm 
                ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'}
                ${plan.recommended ? 'border-2 border-blue-500' : 'border border-gray-200'}
              `}
            >
              {plan.recommended && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                >
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Recommended
                  </span>
                </motion.div>
              )}

              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center"
                  >
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    {feature}
                  </motion.li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-lg font-medium
                  ${plan.recommended 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'}
                `}
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PricingPage; 