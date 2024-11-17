import defaultImage from '../assets/default_profile_avatar.png';
import { Link, Navigate, useParams } from 'react-router-dom';
import fetchUserData from '../utils/fetchUserData';
import { useRecoilValue } from 'recoil';
import { authState, userState } from '../store/atoms';
import { useEffect, useState } from 'react';
import { IconButton, Paper } from "@mui/material"
import ProfileInfo from '../components/ProfileInfo';
import Posts from '../components/Posts';
import EditProfile from '../components/EditProfile';
import {   MoreVert } from '@mui/icons-material';
import { Button } from '@/components/ui/button';
import { MessageSquare,  UserCheck, UserPlus } from 'lucide-react';

function ProfilePage() {
    const auth = useRecoilValue(authState);
    const { username } = useParams();
    const loggedInUser = useRecoilValue(userState).user;
    const [userData, setUserData] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isEdited, setIsEdited] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    
    useEffect(() => {
        if(auth.username === username){
            setIsOwnProfile(true);
            setUserData(loggedInUser);
        }
        else{
            const fetch = async () => {
                try {
                    const data = await fetchUserData(username, auth.token);
                    setUserData(data);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            };
            fetch();
        }
    }, [username, auth, loggedInUser]);

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (<>
        <div className="bg-slate-100 p-5 grid grid-cols-3 gap-4 w-full h-full">
            <Paper elevation={1} sx={{ borderRadius: "17px" }} className=' col-span-2 bg-green-200'>
                <div className='bg-gradient-to-r from-cyan-500 to-blue-500 bg-center bg-cover mt-0 rounded-t-2xl min-h-60 w-full relative '>
                    <IconButton sx={{position:"absolute", top:4, right:4, color: "white"}}>
                    <MoreVert />

                    </IconButton>

                    {/* style={{backgroundImage:'url("")'}} */}
                </div>
                <div className='px-8 mt-10'>
                    <div className="flex justify-between">
                        <div className="flex justify-around lg:gap-6 gap-3">
                            <img
                                referrerPolicy="no-referrer"
                                src={userData.profileImageUrl || defaultImage}
                                alt="profile_image"
                                className= 'rounded-full border-4 border-slate-200 lg:w-32 lg:h-32 w-20 h-20'
                            />

                            <div className='mt-2'>
                                <h1 className='lg:text-3xl text-2xl '>{userData.firstname} {userData.lastname}</h1>
                                <h3 className=' text-sm text-gray-500'>{userData.username}</h3>
                                <div className="flex   lg:mt-5 mt-2 lg:text-base text-sm flex-row gap-3">
                                    <p>23 Followers</p>
                                    <p>34 Followings</p>
                                    <p>7 Posts</p>

                                </div>
                            </div>

                        </div>
                        {isOwnProfile? <>
                            <div className="flex flex-col gap-1">
                                {isEdited? null :<Button variant="default" onClick={()=>setIsEdited(!isEdited)}>Edit Profile</Button>}
                                  
            { loggedInUser?.isOAuthUser ? <Link to="/create-password"><Button variant="default" >Create Password</Button> </Link> : <Link to="/request-reset"><Button variant="destructive">Reset Password</Button> </Link> }
          
                            </div>
                        </> : <>
                            <div className='flex gap-1 h-max items-center'>
                            <Button variant={isFollowing? "secondary" : "default"}
                                size={"sm"}
                                onClick={()=>setIsFollowing(!isFollowing)}
                                className="transition-all duration-300 ease-in-out hover:scale-105"
                            >{isFollowing? <UserCheck className="h-4 w-4 mr-2"/> : <UserPlus className="h-4 w-4 mr-2" />}
                            {isFollowing? "Following" :"Follow"}
                            </Button><br />
                            <Button variant="outline"><MessageSquare/></Button>
                        </div>
                        </>}
                    </div>
                    <div className="mt-8 text-base gap-6 pl-2">
                        {isEdited? <EditProfile isEdited={isEdited} setIsEdited={setIsEdited}  /> : <ProfileInfo 
                        bio={""}  birthdate={""} location={""} userData={userData} gender={""} dateJoined={""} siteLink={""} />}
                    </div>

                    <Posts userData={userData} />
                </div>
            </Paper>
            <Paper elevation={1} sx={{ borderRadius: "17px" }} className="bg-red-400">
                asdjlkasmdlkasm
            </Paper>
        </div>
    </>);
}
 
// function ButtonDark({onClick, text, icon}){
//     return (<>
//         <button className='bg-black rounded-sm p-1 px-3 flex items-center gap-2  text-white text-sm' onClick={onClick}>{icon} {text}</button>

//     </>)
// }

export default ProfilePage;