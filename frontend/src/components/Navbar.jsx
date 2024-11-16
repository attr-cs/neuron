import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { authState, userState } from "../store/atoms";
import { useState } from "react";
import { HiHome, HiUser, HiUsers, HiLogout, HiUserAdd, HiLogin } from "react-icons/hi";
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Menu, MenuItem, Drawer, List, ListItem, IconButton, ListItemText, ListItemIcon, styled, ListItemButton } from "@mui/material";


import defaultImage from "../assets/default_profile_avatar.png"

function Navbar() {

    const navigate = useNavigate();
    const [auth, setAuth] = useRecoilState(authState);
    const [user, setUser] = useRecoilState(userState);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    function handleLogOut() {
        setAuth({ isAuthenticated: false, token: null, userId: null, username: null });
        setUser({ user: null });
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        navigate("/signin");
    }

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setIsOpen(open);
    };

    const ListItemCustom = styled(ListItem)({
        borderRadius:"3px",
        marginBottom: "2px",
    })
    
    return (
        <header className="bg-gradient-to-r bg-white text-black shadow-sm  p-4 flex items-center justify-between relative">
            <div className="flex justify-between items-center gap-5">
            <IconButton sx={{color:"black"}} onClick={toggleDrawer(true)}>
                {isOpen?<MenuOpenIcon/>:<MenuIcon/>}
            </IconButton>
            <Link to="/" className="text-2xl flex items-center justify-between gap-2 font-bold relative tracking-wide">
                
                    {/* <img src={MainLogo} alt="neuron_site_logo" className="w-10 m-0 p-0 h-10 rounded-full" /> */}
                        <div className="w-5 m-0 p-0 h-5 bg-blue-400 rounded-full"></div>
                <span>N<span className="text-blue-400">Ξ</span>URON</span>
            </Link>
            </div>

            <nav className="space-x-6 flex items-center">
                
                <Link to="/" className="text-lg flex items-center gap-2 hover:text-slate-600 transition">
                    <HiHome className="w-5 h-5" />
                    Home
                </Link>

                

                {auth.isAuthenticated ? (
                    <>
                        
                        <Link to="/dashboard" className="text-lg flex items-center gap-2 hover:text-slate-600 transition">
                            <DashboardIcon className="w-5 h-5" />
                            Dashboard
                        </Link>
                        

                        <div className="relative">
                            <button onClick={handleMenuClick}
                                className="flex items-center gap-2 hover:text-slate-600 transition"
                            >
                                <img
                                    referrerPolicy="no-referrer"
                                    src={user.user?.profileImageUrl || defaultImage}
                                    alt="profile_image"
                                    className="w-8 h-8 rounded-full"
                                />

                            </button>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            
                            >
                                <MenuItem onClick={handleClose} sx={{width:"200px"}}>
                                    
                                    <Link to={`/profile/${auth.username}`} className="flex items-center gap-2">
                                        <HiUser className="w-5 h-5" /> Profile
                                    </Link>
                                    
                                </MenuItem>
                                <MenuItem onClick={handleClose}>
                                    
                                    <Link to="/users" className="flex items-center gap-2">
                                        <HiUsers className="w-5 h-5" /> Users
                                    </Link>
                                    
                                </MenuItem>
                                <MenuItem 
                                    sx={{
                                        backgroundColor:'white',
                                        color:'red',
                                        fontWeight:"bold",
                                        "&:hover":{
                                            backgroundColor:"red",
                                            color:'white'
                                        },
                                    }} 
                                    onClick={handleLogOut} className="flex font-bold items-center gap-2">
                                    
                                    <HiLogout className="w-5 h-5" /> Logout
                                    
                                </MenuItem>
                            </Menu>
                        </div>
                    </>
                ) : (
                    <>
                        
                        <Link to="/signup" className="flex items-center gap-2 hover:text-slate-600 transition">
                            <HiUserAdd className="w-5 h-5" /> Register
                        </Link>
                        
                        
                        <Link to="/signin" className="flex items-center gap-2 hover:text-slate-600 transition">
                            <HiLogin className="w-5 h-5" /> Login
                        </Link>
                        
                    </>
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
            </nav>
        </header>
    );
}

export default Navbar;
