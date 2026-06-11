import { Suspense, useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { 
  MessageCircle, Users, BarChart2, Image as ImageIcon, Zap, Globe, Shield, Sparkles, 
  ChevronDown, Download, Brain, ArrowRight, Video, Lock, Heart, CheckCircle, Flame, 
  ExternalLink, Layers, ArrowUpRight
} from 'lucide-react';
import { themeState } from '../store/atoms';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP ScrollTrigger safely on the client side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Inline Word Scrubbing component using Framer Motion (or GSAP context safely)
const ScrubbingParagraph = ({ text }) => {
  const words = text.split(' ');
  return (
    <p className="text-xl sm:text-2xl md:text-3xl leading-relaxed text-zinc-400 dark:text-zinc-500 max-w-4xl mx-auto text-center font-normal px-4">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.15 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: '-20%' }}
          transition={{ duration: 0.4, delay: i * 0.02 }}
          className="inline-block mr-1 text-zinc-900 dark:text-zinc-100 font-medium"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
};

const HomePage = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const scrollTrackerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useRecoilValue(themeState);
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // High-fidelity testimonials matching real target user pain points
  const testimonials = useMemo(() => [
    {
      quote: "Finally, a platform that doesn't treat my attention span as a product. The chronological feed lets me connect deep, not broad.",
      author: "Sarah Jenkins",
      role: "Graduate Researcher, MIT",
      avatarSeed: "sarah"
    },
    {
      quote: "Built-in end-to-end video calls with WebRTC are seamless. We shifted our design team syncs directly here without external link friction.",
      author: "Marcus Chen",
      role: "Lead UI Architect",
      avatarSeed: "marcus"
    },
    {
      quote: "The interface is pure and distraction-free. No algorithms trying to maximize outrage. Just raw human synergy.",
      author: "Elena Rostova",
      role: "Creative Director",
      avatarSeed: "elena"
    }
  ], []);

  const tabContent = useMemo(() => [
    { 
      title: 'Real-time Exchange', 
      content: 'Experience low-latency messaging, typing states, and status synchronization powered by Socket.io. No manual refreshing, no latency gaps.',
      metric: '0.04s message latency'
    },
    { 
      title: 'Peer Video Stream', 
      content: 'Instantly launch secure, direct video conferences directly from inside your threads. Direct peer connection guarantees video call clarity without surveillance risks.',
      metric: 'WebRTC Direct connection'
    },
    { 
      title: 'Sovereign Feeds', 
      content: 'A purely chronological timeline. You own your visual space. No background trackers, no system manipulation, and complete privacy controls.',
      metric: 'Chronological sorting'
    },
  ], []);

  useEffect(() => {
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  // GSAP ScrollTrigger Animations
  useEffect(() => {
    let ctx = gsap.context(() => {
      // Fade out background on scroll
      gsap.to('.hero-bg-media', {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        scale: 1.1,
        opacity: 0.15,
        filter: 'blur(10px)'
      });

      // Subtle scale-up trigger for cards
      gsap.fromTo('.bento-item', 
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.bento-container',
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('App successfully installed');
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <main ref={containerRef} className="overflow-x-hidden w-full max-w-full bg-zinc-50 dark:bg-black transition-colors duration-300">
      
      {/* Floating Header Space Block / Nav handled by layout but layout alignment */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-zinc-100/50 dark:from-black/50 to-transparent pointer-events-none z-10" />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[95vh] min-h-[700px] flex items-center justify-center overflow-hidden border-b border-zinc-200/40 dark:border-zinc-900/40">
        
        {/* Subtle radial glows for premium depth */}
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Cinematic Backdrop with dark radial wash */}
        <div className="absolute inset-0 z-0">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-200/20 to-zinc-100/40 dark:from-zinc-900/20 dark:to-black animate-pulse" />
          )}
          <img
            src="https://picsum.photos/seed/neuron-grid/1920/1080"
            alt="Synapse Network Visualization"
            className="hero-bg-media absolute w-full h-full object-cover opacity-[0.22] dark:opacity-[0.14] grayscale mix-blend-luminosity contrast-125 transition-all duration-700"
            onLoad={() => setIsImageLoaded(true)}
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/60 to-transparent dark:from-black dark:via-black/70 dark:to-transparent" />
        </div>

        {/* Wide Layout Hero Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md mb-8 shadow-sm"
          >
            
            <span className="text-xs font-semibold tracking-wider text-zinc-800 dark:text-zinc-200 uppercase">
              Chat Privately, Encrypted P2P Messaging
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[1.05] mb-8"
          >
            Where intellect <span className="inline-block w-20 sm:w-28 h-8 sm:h-12 rounded-full align-middle bg-cover bg-center mx-2 border border-zinc-300 dark:border-zinc-700 shadow-inner scale-105" style={{backgroundImage: 'url("https://picsum.photos/seed/neuron-synapse/400/200")'}}></span> meets social.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mb-12 font-normal leading-relaxed tracking-tight"
          >
            A lightweight, algorithm-free alternative designed for authentic communication. Chronological timelines, built-in calls, and sovereign data.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center items-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-base"
            >
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const element = document.getElementById('discover-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 h-14 px-8 rounded-full font-semibold transition-colors duration-300 text-base bg-transparent"
            >
              Learn More
            </Button>

            {deferredPrompt && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleInstall}
                className="rounded-full h-14 w-14 border-zinc-300 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-transparent text-zinc-700 dark:text-zinc-300"
              >
                <Download className="w-5 h-5" />
              </Button>
            )}
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          onClick={() => {
            const element = document.getElementById('discover-section');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <ChevronDown className="w-6 h-6 text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-white transition-colors" />
        </motion.div>
      </section>

      {/* Infinite Horizontal Marquee */}
      <div className="relative border-y border-zinc-200/50 dark:border-zinc-900/50 py-10 bg-white dark:bg-zinc-950 overflow-hidden select-none">
        <div className="flex w-max gap-16 animate-[marquee_40s_linear_infinite]">
          {Array(4).fill([
            { text: 'ALGORITHM-FREE TIMELINE', icon: <Layers className="w-4 h-4" /> },
            { text: 'WEBRTC AUDIO/VIDEO', icon: <Video className="w-4 h-4" /> },
            { text: 'ZERO SYSTEM ADS', icon: <Shield className="w-4 h-4" /> },
            { text: 'END-TO-END ENCRYPTED CHATS', icon: <Lock className="w-4 h-4" /> },
            { text: 'OPEN SOURCE HERITAGE', icon: <Brain className="w-4 h-4" /> },
          ]).flat().map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-zinc-400 dark:text-zinc-700">{item.icon}</span>
              <span className="text-xs sm:text-sm font-black tracking-widest text-zinc-500 dark:text-zinc-400">
                {item.text}
              </span>
              <span className="text-zinc-300 dark:text-zinc-800 font-light">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrubbing Text Desire Reveal */}
      <section className="py-32 md:py-48 px-6 bg-zinc-100/40 dark:bg-zinc-950/20">
        <ScrubbingParagraph text="Neuron is crafted for those who realize that cognitive sovereignty matters. We traded commercial algorithmic noise for user agency, fast rendering, peer-to-peer visual architecture, and instant messaging systems. Your intellect. Your timeline. Fully connected." />
      </section>

      {/* Bento Grid Features Section (Interest) */}
      <section id="discover-section" className="py-32 md:py-48 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-20">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white max-w-2xl">
            Engineered for seamless digital dialogue.
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg max-w-xl font-normal">
            No bloated trackers. Simple, robust Web3-grade responsiveness built on the modern stack.
          </p>
        </div>

        {/* Mathematically Dense Bento Grid (no empty spots) */}
        <div className="bento-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 grid-flow-dense">
          
          {/* Card 1: Direct Messaging - col-span-2, row-span-2 */}
          <div className="bento-item lg:col-span-2 lg:row-span-2 group relative rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div>
              <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 text-zinc-900 dark:text-white transition-transform group-hover:scale-110 duration-500">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
                Encrypted Private Chat
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-md">
                Fast socket connection guarantees secure instant messages. Direct Web socket configuration with custom read receipts and typing animations.
              </p>
            </div>

            {/* Simulated Live Interface */}
            <div className="mt-8 border border-zinc-200/40 dark:border-zinc-800/40 rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-zinc-500 font-mono">active_node_sync</span>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-zinc-200/40 dark:bg-zinc-900/60 rounded-xl text-xs max-w-[85%] self-start text-zinc-800 dark:text-zinc-300">
                  Hey, do you have the link to the WebRTC video channel?
                </div>
                <div className="p-3 bg-blue-600 text-white rounded-xl text-xs max-w-[85%] self-end ml-auto">
                  Yes! Hit the call node icon on the top banner. Latency is sub 40ms.
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-600 pt-1 font-mono">
                <Zap className="w-3 h-3 text-amber-500" /> typing response...
              </div>
            </div>
          </div>

          {/* Card 2: Video/Audio Call Grid - col-span-2, row-span-1 */}
          <div className="bento-item lg:col-span-2 lg:row-span-1 group relative rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-900 dark:text-white transition-transform group-hover:scale-110 duration-500">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
                  Direct WebRTC Call Grid
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-sm">
                  Peer-to-peer calling framework directly inside the client workspace. Skip external invites entirely.
                </p>
              </div>

              {/* Grid Preview Simulation */}
              <div className="flex gap-2">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700">
                  <img src="https://picsum.photos/seed/face1/120/120" className="w-full h-full object-cover grayscale" alt="Participant" />
                  <span className="absolute bottom-1 left-1.5 text-[8px] font-mono text-white bg-black/65 px-1 py-0.5 rounded">Me</span>
                </div>
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700">
                  <img src="https://picsum.photos/seed/face2/120/120" className="w-full h-full object-cover" alt="Participant" />
                  <span className="absolute bottom-1 left-1.5 text-[8px] font-mono text-white bg-black/65 px-1 py-0.5 rounded">Alex</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: No Algorithm - col-span-1, row-span-1 */}
          <div className="bento-item lg:col-span-1 lg:row-span-1 group rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 text-zinc-900 dark:text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                Zero Algorithm
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                Strict chronological sequencing. No surveillance metrics pushing toxicity down your screen. Just raw updates.
              </p>
            </div>
          </div>

          {/* Card 4: No Data Selling - col-span-1, row-span-1 */}
          <div className="bento-item lg:col-span-1 lg:row-span-1 group rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 text-zinc-900 dark:text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                Sovereign Privacy
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                Your data is stored securely. No tracking pixels, no identity sales, and robust individual account controls.
              </p>
            </div>
          </div>

          {/* Card 5: Technology Infrastructure - col-span-2, row-span-1 */}
          <div className="bento-item lg:col-span-2 lg:row-span-1 group rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
                Pure MERN Stack & Socket Core
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-sm mb-4">
                Engineered with React, Node, Express, MongoDB, and Socket.io for immediate real-time event distribution.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">React.js</span>
              <span className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Socket.io</span>
              <span className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">WebRTC</span>
              <span className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Node.js</span>
              <span className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Tailwind CSS</span>
            </div>
          </div>

          {/* Card 6: Interactive Testimonials - col-span-2, row-span-1 */}
          <div className="bento-item lg:col-span-2 lg:row-span-1 group rounded-3xl bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 dark:border-zinc-900/60 p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 text-white">
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-3">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Trusted Connections</span>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed italic">
                "{testimonials[0].quote}"
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-zinc-800">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                <img src={`https://picsum.photos/seed/${testimonials[0].avatarSeed}/80/80`} alt={testimonials[0].author} className="w-full h-full object-cover" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-zinc-200">{testimonials[0].author}</h5>
                <p className="text-[10px] text-zinc-500">{testimonials[0].role}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Tabs Section (Desire / Deep Dive) */}
      <section className="py-32 md:py-48 px-6 bg-zinc-100/60 dark:bg-zinc-950/40 border-y border-zinc-200/50 dark:border-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
              Smarter interaction paradigms.
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg max-w-xl mx-auto">
              Select an interface layer to inspect the performance capabilities built directly into our design architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Nav Tabs Menu - Col 4 */}
            <div className="lg:col-span-5 space-y-3">
              {tabContent.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 border flex flex-col justify-between ${
                    activeTab === index
                      ? 'bg-white dark:bg-zinc-900 border-zinc-300/80 dark:border-zinc-800/80 shadow-md translate-x-1'
                      : 'bg-transparent border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-900/40 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`text-lg font-bold ${activeTab === index ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500'}`}>
                      {tab.title}
                    </span>
                    {activeTab === index && <ArrowRight className="w-4 h-4 text-blue-500" />}
                  </div>
                  <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                    {tab.metric}
                  </span>
                </button>
              ))}
            </div>

            {/* Right Interactive Window Screen - Col 7 */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex gap-1.5 mb-8">
                    <span className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <span className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <span className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
                    {tabContent[activeTab].title}
                  </h3>
                  
                  <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed mb-8">
                    {tabContent[activeTab].content}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 w-fit">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Verified System Parameter
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* Quantitative Section (Interactive Counters) */}
      <section className="py-32 md:py-48 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '10M+', label: 'Active Synapses' },
            { value: '5B+', label: 'Secure Packets' },
            { value: '200+', label: 'Nodes Worldwide' },
            { value: '100%', label: 'Sovereign Feeds' }
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <span className="block text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white mb-2 tracking-tighter transition-transform group-hover:scale-105 duration-300">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Extreme CTA / Action (Footer Entrance) */}
      <section className="relative py-32 md:py-48 px-6 border-t border-zinc-200/40 dark:border-zinc-900/40 overflow-hidden bg-white dark:bg-zinc-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <Brain className="w-16 h-16 text-zinc-900 dark:text-white mb-8" />
          
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
            Evolve your connection vector.
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 text-lg sm:text-xl max-w-2xl mb-12 font-normal leading-relaxed">
            Join thousands of professionals, students, and engineers who prioritize cognitive agency over visual pollution. No card payments, no hidden hooks.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold h-14 px-8 rounded-full shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Sign Up via Email / Google
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/signin")}
              className="border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 h-14 px-8 rounded-full font-semibold transition-colors duration-300 bg-transparent"
            >
              Access Current Account
            </Button>
          </div>
        </div>
      </section>

    </main>
  );
};

export default HomePage;