import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useState, useEffect, lazy, memo, useCallback, useMemo } from "react";
import DefaultAvatar from "../components/ui/DefaultAvatar";
import { Link, useParams, useNavigate } from "react-router-dom";
import fetchUserData from "../utils/fetchUserData";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, userBasicInfoState, userProfileState, userSocialState, userContentState } from "../store/atoms";
import { followersCountState, followingsCountState } from "../store/selectors";
import { IconButton } from "@mui/material";
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

// Lazy load components
const ProfileInfo = lazy(() => import("../components/ProfileInfo"));
const ProfilePosts = lazy(() => import("../components/ProfilePosts"));
const EditProfile = lazy(() => import("../components/EditProfile"));
const FollowModal = lazy(() => import("../components/FollowModal"));

// Memoized components
const ProfileImage = memo(({ url, isOwnProfile }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="relative group"
  >
    {url ? (
      <img
        src={url}
        alt="profile"
        className="w-32 h-32 rounded-full border-4 border-background shadow-xl object-cover"
        referrerPolicy="no-referrer"
        loading="eager"
        decoding="async"
      />
    ) : (
      <DefaultAvatar className="w-32 h-32 rounded-full border-4 border-background shadow-xl object-cover" />
    )}
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
));

const StatsButton = memo(({ onClick, icon: Icon, count, label }) => (
  <Button onClick={onClick} variant="ghost" className="flex items-center gap-2">
    <Icon className="h-4 w-4" />
    <span className="font-semibold">{count}</span>
    <span className="text-muted-foreground">{label}</span>
  </Button>
));

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
  const [isLoadingModalData, setIsLoadingModalData] = useState(false);

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

  const handleToggleFollow = useCallback(async () => {
    try {   
      setIsFollowLoading(true);
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);
  
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
  }, [isFollowing, auth.userId, auth.token, userData?._id]);

  const handleFollowToggle = useCallback(async (targetId) => {
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
  }, [auth.userId, auth.token]);

  const handleShowFollowers = async () => {
    setShowFollowModal(true);
    setModalType('followers');
    setIsLoadingModalData(true);
    
    try {
      const userId = isOwnProfile ? auth.userId : userData._id;
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/followers/${userId}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setFollowModalData(response.data);
    } catch (err) {
      console.error("Error fetching followers:", err);
    } finally {
      setIsLoadingModalData(false);
    }
  };

  const handleShowFollowing = async () => {
    setShowFollowModal(true);
    setModalType('following');
    setIsLoadingModalData(true);
    
    try {
      const userId = isOwnProfile ? auth.userId : userData._id;
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/following/${userId}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setFollowModalData(response.data);
    } catch (err) {
      console.error("Error fetching following:", err);
    } finally {
      setIsLoadingModalData(false);
    }
  };

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 } 
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      y: -20,
      opacity: 0
    }
  }), []);

  if (!userData && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background/50 backdrop-blur-sm">
        <motion.div
          className="flex flex-col items-center gap-6 p-8 rounded-xl bg-background/95 shadow-lg border border-border/50"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 360],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <LoaderIcon className="h-10 w-10 text-primary" />
          </motion.div>
          <div className="space-y-2 text-center">
            <p className="text-lg font-medium text-foreground">Loading profile...</p>
            <p className="text-sm text-muted-foreground">Please wait while we fetch the data</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="flex items-center justify-center min-h-screen bg-background/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className="min-h-screen bg-background"
      >
        {/* Banner Section */}
        <motion.div
          variants={itemVariants}
          className="relative h-48 md:h-64 overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              backgroundImage: userData.bannerImageUrl
                ? `url(${userData.bannerImageUrl})`
                : "none",
              backgroundColor: userData.bannerImageUrl ? "transparent" : "#0096FF",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 backdrop-blur-[2px]" />
          </motion.div>
          {isOwnProfile && (
            <motion.div 
              variants={itemVariants}
              className="absolute top-4 right-4 flex items-center gap-3"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-background/80 hover:bg-background/90 text-muted-foreground backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Edit className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-background/80 hover:bg-background/90 text-muted-foreground backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MoreVert className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Profile Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={itemVariants}
            className="relative -mt-24 rounded-xl border-none bg-background/95 backdrop-blur-md shadow-lg"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <ProfileImage url={userData.profileImageUrl} isOwnProfile={isOwnProfile} />

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
                    <StatsButton onClick={handleShowFollowers} icon={Users} count={isOwnProfile ? followersCount : followers?.length || 0} label="Followers" />
                    <StatsButton onClick={handleShowFollowing} icon={Users} count={isOwnProfile ? followingsCount : following?.length || 0} label="Following" />
                    <StatsButton icon={BookOpen} count={isOwnProfile ? content.posts.length : userData?.posts?.length || 0} label="Posts" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs Section */}
          <motion.div 
            variants={itemVariants}
            className="mt-6"
          >
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto bg-transparent space-x-8">
                <TabsTrigger 
                  value="about" 
                  className="relative px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent hover:bg-transparent transition-all duration-300"
                >
                  <motion.span 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Person className="h-4 w-4" />
                    <span className="font-medium">About</span>
                  </motion.span>
                  {isEdited && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" 
                    />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="posts" 
                  className="relative px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent hover:bg-transparent transition-all duration-300"
                >
                  <motion.span 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">Posts</span>
                  </motion.span>
                  {userData.posts?.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {userData.posts.length}
                    </motion.span>
                  )}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="mt-6">
                <Suspense fallback={<LoadingPlaceholder />}>
                  {isEdited ? (
                    <EditProfile isEdited={isEdited} setIsEdited={setIsEdited} />
                  ) : (
                    <ProfileInfo userData={userData} />
                  )}
                </Suspense>
              </TabsContent>
              <TabsContent value="posts" className="mt-6">
                <Suspense fallback={<LoadingPlaceholder />}>
                  <ProfilePosts userData={userData} />
                </Suspense>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        <Suspense fallback={null}>
          <FollowModal
            isOpen={showFollowModal}
            onClose={() => setShowFollowModal(false)}
            data={followModalData}
            type={modalType}
            currentUserId={auth.userId}
            onFollowToggle={handleFollowToggle}
            followLoading={followLoading}
            isLoadingModalData={isLoadingModalData}
          />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const LoadingPlaceholder = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-muted rounded w-1/4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </div>
  </div>
);

export default memo(ProfilePage);
