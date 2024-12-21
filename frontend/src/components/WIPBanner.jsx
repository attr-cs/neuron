import { motion, AnimatePresence } from 'framer-motion';
import { Construction, X } from 'lucide-react';
import { useState } from 'react';
import { useDrag } from '@use-gesture/react';

const WIPBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [dragX, setDragX] = useState(0);

  const bindDrag = useDrag(({ movement: [x], velocity: [vx], last }) => {
    if (last) {
      if (Math.abs(vx) > 0.5 || Math.abs(x) > 100) {
        setIsVisible(false);
      } else {
        setDragX(0);
      }
    } else {
      setDragX(x);
    }
  });

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ 
            y: 1000,
            rotate: 20,
            opacity: 0,
            transition: { 
              type: "spring",
              stiffness: 30,
              damping: 5,
              duration: 1.5
            }
          }}
          style={{ x: dragX }}
          {...bindDrag()}
          className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg touch-pan-x"
        >
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 0.9, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <Construction className="h-5 w-5 text-indigo-200" />
                </motion.div>
                <p className="text-sm font-medium">
                  <span className="md:hidden">Beta Version</span>
                  <span className="hidden md:inline">
                    Welcome to the beta version! We're actively improving the experience.
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1.5 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WIPBanner; 