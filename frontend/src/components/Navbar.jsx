import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { authState, userBasicInfoState, themeState, notificationUnreadCountState } from '../store/atoms';
import { Home, User, Users, LogOut, UserPlus, LogIn, Menu, Brain, Settings, Bell, BookOpen, Moon, Sun, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import NotificationDropdown from './NotificationDropdown';
import defaultAvatar from '../utils/defaultAvatar';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [auth, setAuth] = useRecoilState(authState);
  const userBasicInfo = useRecoilValue(userBasicInfoState);
  const [theme, setTheme] = useRecoilState(themeState);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useRecoilValue(notificationUnreadCountState);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  function handleLogOut() {
    setAuth({ isAuthenticated: false, token: null, userId: null, username: null });
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/home');
  }

  function toggleTheme() {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
        <Link
          to={to}
          className={`flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg transition-colors duration-200 ${
            isActive 
              ? 'text-zinc-950 dark:text-white bg-zinc-100 dark:bg-zinc-900' 
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-950'
          }`}
        >
          <Icon className="w-4 h-4" />
          {children}
        </Link>
      </motion.div>
    );
  };

  const MobileNavLink = ({ to, icon: Icon, children, onClick }) => {
    const isActive = location.pathname === to;
    return (
      <SheetClose asChild>
        <Link
          to={to}
          className={`flex items-center gap-3 p-3 text-base font-semibold rounded-xl transition-all ${
            isActive
              ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950'
          }`}
          onClick={onClick}
        >
          <Icon className="w-5 h-5" />
          {children}
        </Link>
      </SheetClose>
    );
  };

  return (
    <TooltipProvider>
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-900/50 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo area */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.4 }}
                  className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-white flex items-center justify-center"
                >
                  <Brain className="w-5 h-5 text-white dark:text-black" />
                </motion.div>
                <span className="text-lg font-black tracking-widest text-zinc-950 dark:text-white font-mono">
                  NΞURON
                </span>
              </Link>
            </div>
            
            {/* Nav links (Desktop) */}
            <nav className="hidden md:flex items-center space-x-2">
              <NavLink to="/" icon={Home}>Home</NavLink>
              {auth.isAuthenticated ? (
                <>
                  <NavLink to="/dashboard" icon={User}>Dashboard</NavLink>
                  <NavLink to="/users" icon={Users}>Users</NavLink>
                  {userBasicInfo.isAdmin && (
                    <NavLink to="/admin" icon={Shield}>
                      Admin
                    </NavLink>
                  )}
                  <NavLink to="/notifications" icon={Bell}>Notifications</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/signup" icon={UserPlus}>Register</NavLink>
                  <NavLink to="/signin" icon={LogIn}>Login</NavLink>
                </>
              )}
            </nav>

            {/* Utility / User Control area */}
            <div className="flex items-center space-x-3">
              {auth.isAuthenticated && (
                <NotificationDropdown />
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden md:flex text-zinc-600 dark:text-zinc-400">
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
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full overflow-hidden p-0">
                      <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                        <AvatarImage src={userBasicInfo.profileImage?.thumbUrl || defaultAvatar} alt="Profile" referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-xs font-bold">
                          {userBasicInfo.firstname?.[0]}
                          {userBasicInfo.lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-1 rounded-2xl p-2 bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900/50" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{userBasicInfo.firstname} {userBasicInfo.lastname}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">@{auth.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-900" />
                    <DropdownMenuGroup className="space-y-0.5">
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to={`/profile/${auth.username}`} className="flex items-center p-2 text-zinc-700 dark:text-zinc-300">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/dashboard" className="flex items-center p-2 text-zinc-700 dark:text-zinc-300">
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/settings" className="flex items-center p-2 text-zinc-700 dark:text-zinc-300">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      {userBasicInfo.isAdmin && (
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                          <Link to="/admin" className="flex items-center p-2 text-zinc-700 dark:text-zinc-300">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/notifications" className="flex items-center justify-between p-2 text-zinc-700 dark:text-zinc-300">
                          <span className="flex items-center">
                            <Bell className="mr-2 h-4 w-4" />
                            <span>Notifications</span>
                          </span>
                          <Badge variant="secondary" className="ml-auto bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-full">{unreadCount}</Badge>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-900" />
                    <DropdownMenuItem onClick={handleLogOut} className="rounded-xl cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 p-2">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile menu trigger */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-950">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l border-zinc-200/50 dark:border-zinc-900/50 bg-white dark:bg-zinc-950">
                  <SheetHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-900">
                    <SheetTitle className="text-left text-lg font-black tracking-widest text-zinc-950 dark:text-white font-mono">NΞURON MENU</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 flex flex-col space-y-2">
                    <MobileNavLink to="/" icon={Home}>Home</MobileNavLink>
                    {auth.isAuthenticated ? (
                      <>
                        <MobileNavLink to="/dashboard" icon={User}>Dashboard</MobileNavLink>
                        <MobileNavLink to="/users" icon={Users}>Users</MobileNavLink>
                        <MobileNavLink to={`/profile/${auth.username}`} icon={User}>Profile</MobileNavLink>
                        <MobileNavLink to="/settings" icon={Settings}>Settings</MobileNavLink>
                        <MobileNavLink to="/notifications" icon={Bell}>
                          Notifications
                          <Badge variant="secondary" className="ml-auto bg-zinc-100 dark:bg-zinc-900">{unreadCount}</Badge>
                        </MobileNavLink>
                        {userBasicInfo.isAdmin && (
                          <MobileNavLink to="/admin" icon={Shield}>Admin</MobileNavLink>
                        )}
                        <SheetClose asChild>
                          <Button variant="destructive" onClick={handleLogOut} className="w-full justify-start rounded-xl mt-4">
                            <LogOut className="mr-2 h-4 w-4" />
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
                    <div className="flex items-center justify-between p-3 border-t border-zinc-100 dark:border-zinc-900 mt-4">
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Dark Mode</span>
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