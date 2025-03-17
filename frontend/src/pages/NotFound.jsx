import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-auto text-center space-y-8 relative"
      >
        {/* Abstract Shape */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-transparent blur-3xl" />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* 404 Number */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="relative"
          >
            <h1 className="text-8xl sm:text-9xl font-bold bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
              404
            </h1>
          </motion.div>

          {/* Messages */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2 px-4"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4"
          >
            <Button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto min-w-[140px] bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto min-w-[140px] border-foreground/20 hover:bg-foreground/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </motion.div>
        </div>

        {/* Bottom Decorative Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="h-[1px] w-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent mt-8"
        />
      </motion.div>
    </div>
  );
};

export default NotFound; 
