import React from 'react';
import { motion } from 'framer-motion';
import { useRecoilState } from 'recoil';
import { Facebook, Twitter, Instagram, Linkedin, ArrowUp } from 'lucide-react';
import { themeState } from '../store/atoms'; // Assume this hook exists to get the current theme

const Footer = () => {
    const [theme, setTheme] = useRecoilState(themeState);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'} py-12`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Neuron</h3>
            <p className="mb-4">Connect, Share, Evolve</p>
            <div className="flex space-x-4">
              <motion.a href="#" whileHover={{ scale: 1.2 }} className={`${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}>
                <Facebook />
              </motion.a>
              <motion.a href="#" whileHover={{ scale: 1.2 }} className={`${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}>
                <Twitter />
              </motion.a>
              <motion.a href="#" whileHover={{ scale: 1.2 }} className={`${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}>
                <Instagram />
              </motion.a>
              <motion.a href="#" whileHover={{ scale: 1.2 }} className={`${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}>
                <Linkedin />
              </motion.a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className={`${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>Features</a></li>
              <li><a href="#" className={`${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>Pricing</a></li>
              <li><a href="#" className={`${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className={`${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>About Us</a></li>
              <li><a href="#" className={`${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>Careers</a></li>
              <li><a href="#" className={`${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className={`${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>Privacy Policy</a></li>
              <li><a href="#" className={`${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>Terms of Service</a></li>
              <li><a href="#" className={`${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap justify-between items-center pt-8 border-t border-gray-700">
          <p>&copy; 2024 Neuron. All rights reserved.</p>
          <div className="space-x-4">
            <a href="#" className={`${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>Privacy Policy</a>
            <a href="#" className={`${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>Terms of Service</a>
          </div>
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.1 }}
            className={`${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} text-gray-600 rounded-full p-2 transition duration-300`}
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;