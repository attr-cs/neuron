import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { authState, userBasicInfoState, themeState } from '../store/atoms';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import defaultImage from "../assets/default_profile_avatar.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [auth, setAuth] = useRecoilState(authState);
  const userBasicInfo = useRecoilValue(userBasicInfoState);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme] = useRecoilState(themeState);

  const handleLogOut = () => {
    setAuth({ isAuthenticated: false, token: null, userId: null, username: null });
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/signin");
  };

  const navItems = auth.isAuthenticated ? [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Users', path: '/users' },
  ] : [
    { label: 'Sign In', path: '/signin' },
    { label: 'Sign Up', path: '/signup' },
  ];

  const menuVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "-100%" }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
            >
              <Brain className="w-6 h-6 text-primary" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600"
            >
              NΞURON
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <Link
                  to={item.path}
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}

            {auth.isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="outline-none"
                  >
                    <Avatar className="w-8 h-8 transition-transform">
                      <AvatarImage src={userBasicInfo?.profileImageUrl || defaultImage} />
                      <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate(`/profile/${auth.username}`)}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogOut} className="text-red-500">
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="md:hidden"
          >
            <div className="px-4 pt-2 pb-3 space-y-1 bg-background/80 backdrop-blur-lg">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              {auth.isAuthenticated && (
                <>
                  <Link
                    to={`/profile/${auth.username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
