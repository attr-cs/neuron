import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { authState, userBasicInfoState, themeState } from "../store/atoms";
import { Home, User, Users, LogOut, UserPlus, LogIn, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { HiHome, HiUser, HiUsers, HiLogout } from "react-icons/hi";


import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


import defaultImage from "../assets/default_profile_avatar.png" 
import neuronLightLogo from "../assets/logo_circle_light.png"
import neuronDarkLogo from "../assets/logo_circle_dark.png"

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [auth, setAuth] = useRecoilState(authState);
  const userBasicInfo = useRecoilValue(userBasicInfoState);
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

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsOpen(open);
  };




  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  function handleLogOut() {
    setAuth({ isAuthenticated: false, token: null, userId: null, username: null });
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
    <DialogClose asChild>
      <Link
        to={to}
        className="flex items-center gap-2 p-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        onClick={onClick}
      >
        <Icon className="w-5 h-5" />
        {children}
      </Link>
    </DialogClose>
  );

  return (
    <TooltipProvider>
      <header className="bg-background/60 backdrop-blur-md border-b border-border/40 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center mr-2"
                >
                  {/* <img src={neuronDarkLogo} alt="Neuron logo" /> */}
                  <Brain className="w-6 h-6 text-black dark:text-white" />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-black dark:from-white dark:to-white"
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
                        <AvatarImage src={userBasicInfo.profileImageUrl || defaultImage} alt="Profile" referrerPolicy="no-referrer" />
                        <AvatarFallback>
                          {userBasicInfo.firstname?.[0]}
                          {userBasicInfo.lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userBasicInfo.firstname} {userBasicInfo.lastname}</p>
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

<Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)}
                    slotProps={{
                        backdrop:{
                            sx: {
                                backdropFilter: "blur(10px)",
                                backgroundColor: "rgba(0,0,0,0.2)"
                            },
                        },

                    }}
                    
                >
                    <div className="px-4 py-6 min-w-24 flex flex-col gap-4"> 

                    <div>
                    <IconButton onClick={toggleDrawer(false)}>
                        {isOpen?<MenuOpenIcon/>:<MenuIcon/>}
                    </IconButton>
                    </div>

                    {auth.isAuthenticated?(<>
                        <div className="flex flex-col items-center gap-2">
                        <img
                            referrerPolicy="no-referrer"
                            src={user.user?.profileImageUrl || defaultImage}
                            alt="profile_image"
                            className="w-20 h-20 rounded-full shadow-gray-700 shadow-sm"
                        />
                        <p className="font-bold text-xl">{user.user?.firstname} {user.user?.lastname}</p>
                        <p className="italic text-sm">{user.user?.username}</p>
                    </div>
                    <List sx={{ width: "250px" }} onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
                    
                        <ListItemCustom disablePadding>
                            <ListItemButton component={Link} to="/">
                            <ListItemIcon><HiHome size={22}/></ListItemIcon>
                            <ListItemText primary="Home" />
                            </ListItemButton>
                        </ListItemCustom>
                        <ListItemCustom disablePadding>
                            <ListItemButton component={Link} to={`/profile/${auth.username}`}>
                            <ListItemIcon><HiUser size={22}/></ListItemIcon>
                            <ListItemText primary="Profile" />
                            </ListItemButton>
                        </ListItemCustom>
                        
                        <ListItemCustom disablePadding>
                            <ListItemButton component={Link} to={`/dashboard`}>
                            <ListItemIcon><DashboardIcon size={22}/></ListItemIcon>
                            <ListItemText primary="DashBoard" />
                            </ListItemButton>
                        </ListItemCustom>
                        <ListItemCustom disablePadding>
                            <ListItemButton component={Link} to={`/Users`}>
                            <ListItemIcon><HiUsers size={22}/></ListItemIcon>
                            <ListItemText primary="Users" />
                            </ListItemButton>
                        </ListItemCustom>
                        <ListItemCustom  disablePadding>
                            <ListItemButton sx={{
                                        color:"red",
                                        borderRadius:"4px",
                                        ".MuiListItemIcon-root":{

                                            
                                            color:'red',
                                     
                                        },
                                        "&:hover":{
                                            backgroundColor:"red",
                                            color:'white'
                                        },
                                        "&:hover .MuiListItemIcon-root":{
                                            
                                            color:'white'
                                        }
                                    }} onClick={handleLogOut}>
                            <ListItemIcon><HiLogout size={22}/></ListItemIcon>
                            <ListItemText primary="Logout" />
                            </ListItemButton>
                        </ListItemCustom>
                        
                    </List>
                    </>):(<>
                            <div className="flex flex-col items-center gap-2">
                        
                                <img
                                    referrerPolicy="no-referrer"
                                    src={defaultImage}
                                    alt="profile_image"
                                    className="w-20 h-20 rounded-full shadow-gray-700 shadow-sm"
                                />
                        
                                <p className="font-bold text-xl">Anonymous</p>
                            </div>
                    <List sx={{ width: "250px" }} onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
                    
                        <ListItemCustom disablePadding>
                            <ListItemButton component={Link} to="/signup">
                            <ListItemIcon><HiUserAdd size={22}/></ListItemIcon>
                            <ListItemText primary="Register" />
                            </ListItemButton>
                        </ListItemCustom>
                        <ListItemCustom disablePadding>
                            <ListItemButton component={Link} to={`/signin`}>
                            <ListItemIcon><HiLogin size={22}/></ListItemIcon>
                            <ListItemText primary="Login" />
                            </ListItemButton>
                            
                        </ListItemCustom>
                        
                       
                        
                    </List>


                    </>)}
                    </div>

                </Drawer>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
