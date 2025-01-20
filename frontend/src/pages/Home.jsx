import { Suspense, useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { MessageCircle, Users, BarChart2, Image as ImageIcon, Zap, Globe, Shield, Sparkles, ChevronDown, Download } from 'lucide-react';
import { themeState } from '../store/atoms';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const FeatureCard = ({ feature, theme, variants }) => {
  return (
    <motion.div
      variants={variants}
      whileHover={{ scale: 1.05 }}
      className="p-6 rounded-xl bg-card shadow-lg transition-shadow hover:shadow-xl"
    >
      <div className="text-primary mb-4 flex justify-center">
        {feature.icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </motion.div>
  );
};

const StatsCard = ({ stat, theme, variants }) => {
  return (
    <motion.div 
      variants={variants}
      whileHover={{ scale: 1.05 }}
      className="text-center p-6 rounded-xl bg-card shadow-lg transition-shadow hover:shadow-xl"
    >
      <div className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
        {stat.value}
      </div>
      <p className="text-muted-foreground">{stat.label}</p>
    </motion.div>
  );
};

const HomePage = () => {
  const controls = useAnimation();
  const statsRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useRecoilValue(themeState);
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Memoize static data
  const features = useMemo(() => [
    { icon: <MessageCircle className="w-12 h-12" />, title: 'Direct Messaging', description: 'Connect instantly with friends and family' },
    { icon: <Users className="w-12 h-12" />, title: 'Group Chats', description: 'Create and manage group conversations effortlessly' },
    { icon: <BarChart2 className="w-12 h-12" />, title: 'Polls & Surveys', description: 'Gather opinions with interactive polls and surveys' },
    { icon: <ImageIcon className="w-12 h-12" />, title: 'Media Sharing', description: 'Share photos and videos seamlessly with your network' },
    { icon: <Zap className="w-12 h-12" />, title: 'Instant Updates', description: 'Stay informed with real-time notifications' },
    { icon: <Globe className="w-12 h-12" />, title: 'Global Reach', description: 'Connect with users worldwide and expand your horizons' },
    { icon: <Shield className="w-12 h-12" />, title: 'Privacy Controls', description: 'Robust tools to manage your data and privacy settings' },
    { icon: <Sparkles className="w-12 h-12" />, title: 'Smart Filters', description: 'Enhance your content with AI-powered filters and effects' },
  ], []);

  const stats = useMemo(() => [
    { value: '10M+', label: 'Active Users' },
    { value: '5B+', label: 'Messages Sent' },
    { value: '200+', label: 'Countries Reached' },
    { value: '50M+', label: 'Photos Shared' },
    { value: '1B+', label: 'Video Calls' },
    { value: '100M+', label: 'Groups Created' },
  ], []);

  const tabContent = useMemo(() => [
    { title: 'Connect', content: 'Build meaningful relationships with friends, family, and like-minded individuals from around the globe.' },
    { title: 'Share', content: 'Express yourself through photos, videos, and stories. Share your moments, big and small, with your Neuron network.' },
    { title: 'Discover', content: 'Explore new ideas, trending topics, and exciting communities tailored to your interests and passions.' },
  ], []);

  useEffect(() => {
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start('visible');
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [controls]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}>
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse" />
        )}
        <img
          src="https://picsum.photos/seed/op/1280/720"
          alt="Neuron Banner"
          className={`absolute w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
          loading="eager"
        />

        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        
        <motion.div 
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6"
            variants={itemVariants}
          >
            Welcome to <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">NΞURON</span>
          </motion.h1>
          
          <motion.p
            className="text-lg sm:text-xl md:text-2xl mb-8 text-muted-foreground"
            variants={itemVariants}
          >
            Connect, Share, Evolve
          </motion.p>

          <motion.div className="flex flex-wrap justify-center gap-4" variants={itemVariants}>
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="font-semibold"
            >
              Join Now
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="font-semibold"
            >
              Learn More
            </Button>

            {deferredPrompt && (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleInstall}
                className="rounded-full"
              >
                <Download className="w-5 h-5" />
              </Button>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-24"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
            Discover Our Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Suspense fallback={<FeaturesSkeleton count={8} />}>
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  feature={feature}
                  theme={theme}
                  variants={itemVariants}
                />
              ))}
            </Suspense>
          </div>
        </motion.div>

        {/* Interactive Tabs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-24"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
            Experience Neuron
          </h2>
          
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabContent.map((tab, index) => (
              <Button
                key={index}
                variant={activeTab === index ? "default" : "secondary"}
                onClick={() => setActiveTab(index)}
                className="rounded-full"
              >
                {tab.title}
              </Button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center max-w-2xl mx-auto"
            >
              <p className="text-lg text-muted-foreground">
                {tabContent[activeTab].content}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          <Suspense fallback={<StatsSkeleton count={6} />}>
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                stat={stat}
                theme={theme}
                variants={itemVariants}
              />
            ))}
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
};

const FeaturesSkeleton = ({ count }) => (
  <>
    {Array(count).fill(0).map((_, i) => (
      <div key={i} className="p-6 rounded-xl bg-card">
        <Skeleton className="h-12 w-12 rounded-full mb-4 mx-auto" />
        <Skeleton className="h-6 w-3/4 mb-2 mx-auto" />
        <Skeleton className="h-4 w-full mx-auto" />
      </div>
    ))}
  </>
);

const StatsSkeleton = ({ count }) => (
  <>
    {Array(count).fill(0).map((_, i) => (
      <div key={i} className="text-center">
        <Skeleton className="h-8 w-20 mb-2 mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
    ))}
  </>
);

export default HomePage;
