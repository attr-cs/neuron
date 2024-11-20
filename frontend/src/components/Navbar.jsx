import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { authState, userState, themeState } from '../store/atoms';
import { Home, User, Users, LogOut, UserPlus, LogIn, Menu, Search, Brain, Settings, Bell, BookOpen, Moon, Sun, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


import defaultImage from "../assets/default_profile_avatar.png" 
import neuronLightLogo from "../assets/logo_circle_light.png"
import neuronDarkLogo from "../assets/logo_circle_dark.png"

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [auth, setAuth] = useRecoilState(authState);
  const [user, setUser] = useRecoilState(userState);
  const [theme, setTheme] = useRecoilState(themeState);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  function handleLogOut() {
    setAuth({ isAuthenticated: false, token: null, userId: null, username: null });
    setUser({ user: null });
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/home');
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  }

  function toggleTheme() {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }

  const NavLink = ({ to, icon: Icon, children }) => (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link
        to={to}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Icon className="w-4 h-4" />
        {children}
      </Link>
    </motion.div>
  );

  const MobileNavLink = ({ to, icon: Icon, children, onClick }) => (
    <SheetClose asChild>
      <Link
        to={to}
        className="flex items-center gap-2 p-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        onClick={onClick}
      >
        <Icon className="w-5 h-5" />
        {children}
      </Link>
    </SheetClose>
  );

  return (
    <TooltipProvider>
      <header className="bg-white  dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2"
                >
                  {/* <img src={neuronDarkLogo} alt="Neuron logo" /> */}
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  NΞURON
                </motion.span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-4">
              <NavLink to="/" icon={Home}>Home</NavLink>
              {auth.isAuthenticated ? (
                <>
                  <NavLink to="/dashboard" icon={User}>Dashboard</NavLink>
                  <NavLink to="/users" icon={Users}>Users</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/signup" icon={UserPlus}>Register</NavLink>
                  <NavLink to="/signin" icon={LogIn}>Login</NavLink>
                </>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {auth.isAuthenticated && (
                <div className="relative">
                  <AnimatePresence>
                    {isSearchOpen && (
                      <motion.form
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        onSubmit={handleSearch}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden"
                      >
                        <Input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-64 pl-10 pr-4 py-2 bg-transparent border-none focus:outline-none focus:ring-0"
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2"
                        >
                          <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsSearchOpen(false)}
                          className="absolute right-7 top-1/2 transform -translate-y-1/2"
                        >
                          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="relative z-10"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden md:flex">
                    <motion.div
                      initial={false}
                      animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </motion.div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode</p>
                </TooltipContent>
              </Tooltip>

              {auth.isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user?.profileImageUrl || defaultImage} alt="Profile" referrerPolicy="no-referrer" />
                        <AvatarFallback>
                          {user.user?.firstname?.[0]}
                          {user.user?.lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.user?.firstname} {user.user?.lastname}</p>
                        <p className="text-xs leading-none text-muted-foreground">@{auth.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link to={`/profile/${auth.username}`} className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/notifications" className="flex items-center justify-between w-full">
                          <span className="flex items-center">
                            <Bell className="mr-2 h-4 w-4" />
                            <span>Notifications</span>
                          </span>
                          <Badge variant="secondary" className="ml-auto">5</Badge>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogOut} className="text-red-600 dark:text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-gray-500">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 flex flex-col space-y-4">
                    {auth.isAuthenticated && (
                      <form onSubmit={handleSearch} className="relative">
                        <Input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2"
                        >
                          <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </Button>
                      </form>
                    )}
                    <MobileNavLink to="/" icon={Home}>Home</MobileNavLink>
                    {auth.isAuthenticated ? (
                      <>
                        <MobileNavLink to="/dashboard" icon={User}>Dashboard</MobileNavLink>
                        <MobileNavLink to="/users" icon={Users}>Users</MobileNavLink>
                        <MobileNavLink to={`/profile/${auth.username}`} icon={User}>Profile</MobileNavLink>
                        <MobileNavLink to="/settings" icon={Settings}>Settings</MobileNavLink>
                        <MobileNavLink to="/notifications" icon={Bell}>
                          Notifications
                          <Badge variant="secondary" className="ml-auto">5</Badge>
                        </MobileNavLink>
                        <SheetClose asChild>
                          <Button variant="destructive" onClick={handleLogOut} className="w-full justify-start">
                            <LogOut className="mr-2 h-5 w-5" />
                            Log out
                          </Button>
                        </SheetClose>
                      </>
                    ) : (
                      <>
                        <MobileNavLink to="/signup" icon={UserPlus}>Register</MobileNavLink>
                        <MobileNavLink to="/signin" icon={LogIn}>Login</MobileNavLink>
                      </>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dark Mode</span>
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={toggleTheme}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
