import { motion } from "framer-motion";
import defaultImage from "../assets/default_profile_avatar.png";
import { Link, useParams, useNavigate } from "react-router-dom";
import fetchUserData from "../utils/fetchUserData";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, userBasicInfoState, userProfileState, userSocialState, userContentState } from "../store/atoms";
import { followersCountState, followingsCountState } from "../store/selectors";
import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import ProfileInfo from "../components/ProfileInfo";
import ProfilePosts from "../components/ProfilePosts";
import EditProfile from "../components/EditProfile";
import { MoreVert, Pencil, User2 } from "@mui/icons-material";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserCheck, UserPlus, LoaderIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdminBadge from '@/components/ui/AdminBadge';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, BookOpen } from "lucide-react";

function ProfilePage() {
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const basicInfo = useRecoilValue(userBasicInfoState);
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

      // Optimistically update the UI before the server responds
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);

      // Update the userData state to reflect follower count change
      setUserData(prev => ({
        ...prev,
        followers: newIsFollowing
          ? [...(prev.followers || []), auth.userId]
          : (prev.followers || []).filter(id => id !== auth.userId)
      }));

      // Send the request to the server
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/follow`,
        { userId: auth.userId, targetId: userData._id },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      // Confirm server response and ensure UI state matches
      if (response.status === 200) {
        const message = response.data.msg;
        if (message === "Followed" && !isFollowing) {
          setIsFollowing(true);
        } else if (message === "Unfollowed" && isFollowing) {
          setIsFollowing(false);
        }
      }
    } catch (err) {
      console.error("Error toggling follow status:", err);

      // Revert the optimistic UI updates in case of an error
      setIsFollowing(!isFollowing);
      setUserData(prev => ({
        ...prev,
        followers: isFollowing
          ? (prev.followers || []).filter(id => id !== auth.userId)
          : [...(prev.followers || []), auth.userId]
      }));
    } finally {
      setIsFollowLoading(false);
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
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/80 to-primary overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm"></div>
        {isOwnProfile && (
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/30 hover:bg-background/40 text-background backdrop-blur-sm"
            >
              <Pencil className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full  dark:bg-background/30 hover:bg-background/40 backdrop-blur-sm"
            >
              <MoreVert fontSize="medium" sx={{ color: "white" }} className="h-7 w-7" />
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
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-foreground">
                      {userData.firstname} {userData.lastname}
                      {userData.isAdmin && <AdminBadge />}
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
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">{userData.followers?.length || 0}</span>
                    <span className="text-muted-foreground">Followers</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">{userData.following?.length || 0}</span>
                    <span className="text-muted-foreground">Following</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-semibold">{userData.posts?.length || 0}</span>
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
                  <User2 className="h-4 w-4" />
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
    </motion.div>
  );
}

export default ProfilePage;
