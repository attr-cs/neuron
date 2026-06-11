import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white dark:bg-black font-sans">
      <div className="max-w-md w-full mx-auto text-center space-y-10 relative">
        
        {/* Subtle, premium, non-sci-fi background ambient shape */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px]">
            <div className="absolute inset-0 rounded-full bg-zinc-100 dark:bg-zinc-900/20 blur-[100px]" />
          </div>
        </div>

        {/* Minimal Content */}
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-8xl sm:text-9xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none select-none">
              404
            </h1>
          </motion.div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="space-y-3 px-4"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Page Not Found
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed max-w-sm mx-auto font-medium">
              The page you are looking for does not exist or has been shifted.
            </p>
          </motion.div>

          {/* Action Blocks (Native Touch Optimized Feel) */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 pt-4"
          >
            <Button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto min-w-[140px] bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-black dark:hover:bg-zinc-100 text-white font-semibold h-11 rounded-xl transition-all shadow-md"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto min-w-[140px] h-11 rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </motion.div>
        </div>

        {/* Structural Gradient Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent mt-8"
        />
      </div>
    </div>
  );
};

export default NotFound;