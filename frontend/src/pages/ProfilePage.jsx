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
import { MoreVert } from "@mui/icons-material";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserCheck, UserPlus, LoaderIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdminBadge from '@/components/ui/AdminBadge';

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
      className="min-h-screen bg-slate-50"
    >
      {/* Banner Section */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-cyan-500 to-blue-500">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
        >
          <MoreVert />
        </motion.button>
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24">
          {/* Profile Header */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={userData.profileImageUrl || defaultImage}
                alt="profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-md"
                referrerPolicy="no-referrer"
              />

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                      {userData.firstname} {userData.lastname}
                      {userData.isAdmin && <AdminBadge />}
                    </h1>
                    <p className="text-gray-600">@{userData.username}</p>
                  </div>

                  {/* Action Buttons */}
                  {isOwnProfile ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={() => setIsEdited(!isEdited)}>
                        {isEdited ? "Cancel" : "Edit Profile"}
                      </Button>
                      {userData?.isOAuthUser ? (
                        <Link to="/create-password">
                          <Button variant="default">Create Password</Button>
                        </Link>
                      ) : (
                        <Link to="/request-reset">
                          <Button variant="destructive">Reset Password</Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant={isFollowing ? "secondary" : "default"}
                        onClick={handleToggleFollow}
                        disabled={isFollowLoading}
                        className="w-full sm:w-auto"
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
  size="sm"
  className="flex items-center gap-2"
>
  <MessageSquare className="h-4 w-4" />
  Message
</Button>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <motion.div 
                  variants={itemVariants}
                  className="flex gap-6 mt-4 text-sm md:text-base"
                >
                  <div>
                    <span className="font-semibold">{userData.followers?.length || 0}</span>
                    <span className="text-gray-600 ml-1">Followers</span>
                  </div>
                  <div>
                    <span className="font-semibold">{userData.following?.length || 0}</span>
                    <span className="text-gray-600 ml-1">Following</span>
                  </div>
                  <div>
                    <span className="font-semibold">{userData.posts?.length || 0}</span>
                    <span className="text-gray-600 ml-1">Posts</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Profile Info and Posts */}
          <div className="mt-6">
            {isEdited ? (
              <EditProfile isEdited={isEdited} setIsEdited={setIsEdited} />
            ) : (
              <ProfileInfo userData={userData} />
            )}
            <ProfilePosts userData={userData} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProfilePage;
