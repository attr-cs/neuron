import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { themeState } from "@/store/atoms";
import { Home, ArrowLeft, Search, Compass, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useRecoilValue(themeState);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

    

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const glitchAnimation = {
    initial: { x: 0, opacity: 1 },
    animate: {
      x: [-2, 2, -2, 0],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 0.4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  const suggestions = [
    { icon: Home, text: "Return Home", action: () => navigate("/"), description: "Back to the main page" },
    { icon: Search, text: "Find Users", action: () => navigate("/users"), description: "Discover new connections" },
    { icon: Compass, text: "Explore", action: () => navigate("/explore"), description: "Browse trending content" }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-background/50">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-black/[0.02]" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-3xl" />
      
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={glitchAnimation} className="mb-8">
          <span className="text-8xl sm:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/50 select-none">
            404
          </span>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-3xl sm:text-4xl font-bold mb-4 text-foreground"
        >
          Page Not Found
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-lg sm:text-xl mb-12 text-muted-foreground max-w-xl mx-auto"
        >
          The page you're looking for seems to have wandered off into the digital void.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
        >
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Button
                variant="outline"
                onClick={suggestion.action}
                className="w-full h-full flex flex-col items-center gap-3 p-6 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
              >
                <suggestion.icon className="h-6 w-6 text-primary" />
                <div>
                  <div className="font-semibold text-foreground">{suggestion.text}</div>
                  <div className="text-xs text-muted-foreground mt-1">{suggestion.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="group text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Go Back
            <ChevronRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound; 