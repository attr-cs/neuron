import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { Send, Phone, MapPin, Mail, MessageSquare, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { themeState } from '../store/atoms';


const ContactPage = () => {
  const theme = useRecoilValue(themeState);
  const [activeSection, setActiveSection] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef(null);

  const contactMethods = [
    { 
      icon: <Phone className="w-6 h-6" />, 
      title: 'Call Us', 
      info: '+1 (555) 123-4567',
      subInfo: 'Monday-Friday, 9AM-6PM EST',
      color: 'from-emerald-400 to-teal-500' 
    },
    { 
      icon: <Mail className="w-6 h-6" />, 
      title: 'Email Us', 
      info: 'neuronspaceofficial@gmail.com',
      subInfo: 'We reply within 24 hours',
      color: 'from-violet-400 to-purple-500' 
    },
    { 
      icon: <MapPin className="w-6 h-6" />, 
      title: 'Visit Us', 
      info: '123 Innovation St, Tech City',
      subInfo: 'Open for appointments',
      color: 'from-rose-400 to-pink-500' 
    }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors({ submit: 'Failed to send message. Please try again.' });
    }
    setSending(false);
  };

  const bind = useGesture({
    onHover: ({ active, args: [index] }) => {
      setActiveSection(active ? index : null);
    },
    onDrag: ({ movement: [x], velocity: [vx], down, args: [index] }) => {
      const card = document.getElementById(`contact-${index}`);
      if (card) {
        const rotation = down ? (x / 10) * Math.min(Math.abs(vx), 2) : 0;
        card.style.transform = `translateX(${down ? x : 0}px) rotate(${rotation}deg)`;
        card.style.transition = down ? 'none' : 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      }
    }
  });

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
      {/* Hero Section with enhanced mobile responsiveness */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-7xl mx-auto py-12 md:py-24 px-4 text-center"
        >
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 1 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Let's Connect
            </span>
          </motion.h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
            We'd love to hear from you. Send us a message!
          </p>
        </motion.div>
      </div>

      {/* Contact Methods with improved mobile layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              id={`contact-${index}`}
              {...bind(index)}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 md:p-8 rounded-2xl backdrop-blur-md
                ${theme === 'dark' ? 'bg-white/10' : 'bg-white/90'}
                border border-transparent hover:border-indigo-500/20
                shadow-lg hover:shadow-xl transition-all duration-300
                cursor-pointer relative overflow-hidden group`}
              style={{ touchAction: 'none' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${method.color} opacity-0 
                group-hover:opacity-5 transition-opacity duration-300`} />
              
              <motion.div
                animate={{
                  rotate: activeSection === index ? [0, 5, -5, 0] : 0
                }}
                className="mb-6"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r ${method.color}
                  flex items-center justify-center text-white`}>
                  {method.icon}
                </div>
              </motion.div>
              
              <h3 className="text-xl md:text-2xl font-bold mb-2">{method.title}</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
                {method.info}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {method.subInfo}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enhanced Contact Form */}
      <div className="max-w-4xl mx-auto px-4 pb-16 md:pb-24">
        <motion.form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`p-6 md:p-8 rounded-2xl ${theme === 'dark' ? 'bg-white/10' : 'bg-white/90'}
            backdrop-blur-md shadow-xl border border-transparent hover:border-indigo-500/20`}
        >
          <div className="space-y-6">
            {['name', 'email', 'subject', 'message'].map((field, index) => (
              <motion.div
                key={field}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <label className="block text-sm font-medium mb-2 capitalize">
                  {field}
                  {field !== 'subject' && <span className="text-rose-500">*</span>}
                </label>
                {field === 'message' ? (
                  <textarea
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl
                      ${theme === 'dark' ? 'bg-white/20 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}
                      border ${errors[field] ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}
                      focus:ring-2 focus:ring-indigo-500 outline-none
                      transition-all duration-300`}
                    placeholder={`Enter your ${field}...`}
                  />
                ) : (
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl
                      ${theme === 'dark' ? 'bg-white/20 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}
                      border ${errors[field] ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}
                      focus:ring-2 focus:ring-indigo-500 outline-none
                      transition-all duration-300`}
                    placeholder={`Enter your ${field}...`}
                  />
                )}
                {errors[field] && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-rose-500 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors[field]}
                  </motion.p>
                )}
              </motion.div>
            ))}

            <motion.button
              type="submit"
              disabled={sending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                text-white font-medium flex items-center justify-center gap-2
                disabled:opacity-70 disabled:cursor-not-allowed
                transform transition-all duration-300`}
            >
              {sending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Send className="w-5 h-5" />
                </motion.div>
              ) : success ? (
                <>
                  Message Sent!
                  <Check className="w-5 h-5" />
                </>
              ) : (
                <>
                  Send Message
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default ContactPage; 