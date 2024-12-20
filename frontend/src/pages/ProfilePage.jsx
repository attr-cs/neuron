import { motion } from "framer-motion";
import defaultImage from "../assets/default_profile_avatar.png";
import { Link, useParams, useNavigate } from "react-router-dom";
import fetchUserData from "../utils/fetchUserData";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, userBasicInfoState, userProfileState, userSocialState, userContentState } from "../store/atoms";
import { followersCountState, followingsCountState } from "../store/selectors";
import FollowModal from "../components/FollowModal";
import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import ProfileInfo from "../components/ProfileInfo";
import ProfilePosts from "../components/ProfilePosts";
import EditProfile from "../components/EditProfile";
import { MoreVert, Edit, Person } from "@mui/icons-material";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserCheck, UserPlus, LoaderIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdminBadge from '@/components/ui/AdminBadge';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, BookOpen } from "lucide-react";
import UserStatusBadge from '../components/UserStatusBadge';
import FollowersCount from '../components/FollowersCount';



function ProfilePage() {
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const basicInfo = useRecoilValue(userBasicInfoState);
  const followersCount = useRecoilValue(followersCountState);
  const followingsCount = useRecoilValue(followingsCountState);
  const profile = useRecoilValue(userProfileState);
  const social = useRecoilValue(userSocialState);
  const content = useRecoilValue(userContentState);
  const { username } = useParams();
  const setBasicInfo = useSetRecoilState(userBasicInfoState);
  const setProfile = useSetRecoilState(userProfileState);
  const setSocial = useSetRecoilState(userSocialState);
  const setContent = useSetRecoilState(userContentState);
  const [userData, setUserData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalType, setModalType] = useState('followers');
  const [followModalData, setFollowModalData] = useState([]);
  const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsOwnProfile(false);

        if (auth.username === username) {
          setIsOwnProfile(true);
          setUserData({
            ...auth,
            ...basicInfo,
            ...profile,
            ...social,
            ...content
          });
        } else {
          const data = await fetchUserData(username, auth.token);
          if (!data) {
            throw new Error("Failed to load user data");
          }
          setUserData(data);
          setIsFollowing(data.followers ? data.followers.includes(auth.userId) : false);
          setFollowers(data.followers || []);
          setFollowing(data.following || []);
        }
      } catch (err) {
        setError(err.message || "Failed to load user data");
        console.error("Error Fetching user data:", err);
      }
    };

    if (auth.token && username) {
      const debounceTimer = setTimeout(() => {
        fetchData();
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [username, auth.token, auth.username]);

  const handleToggleFollow = async () => {
    try {   
      setIsFollowLoading(true);
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);
  
      // Only update followers state
      setFollowers(prev => 
        newIsFollowing 
          ? [...prev, auth.userId]
          : prev.filter(id => id !== auth.userId)
      );
  
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/follow`,
        { userId: auth.userId, targetId: userData._id },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
  
      if (response.status !== 200) {
        throw new Error('Failed to update follow status');
      }
    } catch (err) {
      console.error("Error toggling follow status:", err);
      setIsFollowing(!isFollowing);
      setFollowers(prev => 
        isFollowing 
          ? prev.filter(id => id !== auth.userId)
          : [...prev, auth.userId]
      );
    } finally {
      setIsFollowLoading(false);
    }
  };
  
  const handleFollowToggle = async (targetId) => {
    setFollowLoading(prev => ({ ...prev, [targetId]: true }));
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/follow`,
        { userId: auth.userId, targetId },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      if (response.status === 200) {
        setFollowModalData(prevData =>
          prevData.map(user =>
            user._id === targetId
              ? {
                  ...user,
                  followers: response.data.msg === "Followed"
                    ? [...user.followers, auth.userId]
                    : user.followers.filter(id => id !== auth.userId)
                }
              : user
          )
        );
      }
    } catch (err) {
      console.error("Error toggling follow status:", err);
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetId]: false }));
    }
  };

  const handleShowFollowers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/followers/${userData._id}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setFollowModalData(response.data);
      setModalType('followers');
      setShowFollowModal(true);
    } catch (err) {
      console.error("Error fetching followers:", err);
    }
  };

  const handleShowFollowing = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/following/${userData._id}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setFollowModalData(response.data);
      setModalType('following');
      setShowFollowModal(true);
    } catch (err) {
      console.error("Error fetching following:", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (!userData && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-background"
    >
      {/* Banner Section */}
<div
  className={`relative h-48 md:h-64 bg-gradient-to-r from-primary/80 to-primary overflow-hidden`}
  style={{
    backgroundImage: userData.bannerImageUrl
      ? `url(${userData.bannerImageUrl})`
      : "none",
    backgroundColor: userData.bannerImageUrl ? "transparent" : "#0096FF",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm"></div>
  {isOwnProfile && (
    <div className="absolute top-4 right-4 flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-background hover:bg-background/90 text-muted-foreground backdrop-blur-sm"
      >
        <Edit className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full text-muted-foreground dark:bg-background/30 hover:bg-background/90 bg-background backdrop-blur-sm"
      >
        <MoreVert fontSize="large" sx={{ color: "grey" }} />
      </Button>
    </div>
  )}
</div>
      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="relative -mt-24 border-none bg-background/60 backdrop-blur-md shadow-lg">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative group"
              >
                <img
                  src={userData.profileImageUrl || defaultImage}
                  alt="profile"
                  className="w-32 h-32 rounded-full border-4 border-background shadow-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background shadow-md hover:bg-background/90 text-muted-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-foreground">
                      {`${userData.firstname.charAt(0).toUpperCase()}${userData.firstname.slice(1)} ${userData.lastname.charAt(0).toUpperCase()}${userData.lastname.slice(1)}`}

                      {userData.isAdmin && <AdminBadge />}
                      {isOwnProfile? <UserStatusBadge userId={auth.userId} />: <UserStatusBadge userId={userData._id} />}
                      
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>@{userData.username}</span>
                      {userData.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{userData.location}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {isOwnProfile ? (
                      <>
                        <Button onClick={() => setIsEdited(!isEdited)}>
                          {isEdited ? "Cancel" : "Edit Profile"}
                        </Button>
                        {userData?.isOAuthUser ? (
                          <Link to="/create-password">
                            <Button variant="outline">Create Password</Button>
                          </Link>
                        ) : (
                          <Link to="/request-reset">
                            <Button variant="outline">Reset Password</Button>
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <Button
                          variant={isFollowing ? "secondary" : "default"}
                          onClick={handleToggleFollow}
                          disabled={isFollowLoading}
                        >
                          {isFollowLoading ? (
                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          ) : isFollowing ? (
                            <UserCheck className="mr-2 h-4 w-4" />
                          ) : (
                            <UserPlus className="mr-2 h-4 w-4" />
                          )}
                          {isFollowLoading ? "Processing..." : isFollowing ? "Following" : "Follow"}
                        </Button>
                        <Button
                          onClick={() => navigate(`/messages/${username}`)}
                          variant="outline"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                

                <div className="flex gap-6 pt-4 border-t border-border/40">
      <Button onClick={handleShowFollowers} variant="ghost" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        
        <span className="font-semibold">{isOwnProfile ? followersCount : followers?.length || 0}</span>
        <span className="text-muted-foreground">Followers</span>
      </Button>
      <Button onClick={handleShowFollowing} variant="ghost" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="font-semibold">{isOwnProfile ? followingsCount : following?.length || 0}</span>
        <span className="text-muted-foreground">Following</span>
      </Button>
      <Button variant="ghost" className="flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        <span className="font-semibold">{isOwnProfile ? content.posts.length : userData?.posts?.length || 0}</span>
        <span className="text-muted-foreground">Posts</span>
      </Button>
                 </div>   
             
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <div className="mt-6">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto bg-transparent space-x-8">
              <TabsTrigger 
                value="about" 
                className="relative px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent hover:bg-transparent"
              >
                <span className="flex items-center gap-2">
                  <Person className="h-4 w-4" />
                  <span className="font-medium">About</span>
                </span>
                {isEdited && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />}
              </TabsTrigger>
              <TabsTrigger 
                value="posts" 
                className="relative px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent hover:bg-transparent"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Posts</span>
                </span>
                {userData.posts?.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {userData.posts.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="mt-6">
              {isEdited ? (
                <EditProfile isEdited={isEdited} setIsEdited={setIsEdited} />
              ) : (
                <ProfileInfo userData={userData} />
              )}
            </TabsContent>
            <TabsContent value="posts" className="mt-6">
              <ProfilePosts userData={userData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <FollowModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        data={followModalData}
        type={modalType}
        currentUserId={auth.userId}
        onFollowToggle={handleFollowToggle}
        followLoading={followLoading}
      />
    </motion.div>
  );
}

export default ProfilePage;
