import defaultImage from "../assets/default_profile_avatar.png";
import { Link, useParams } from "react-router-dom";
import fetchUserData from "../utils/fetchUserData";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, userState } from "../store/atoms";
import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import ProfileInfo from "../components/ProfileInfo";
import ProfilePosts from "../components/ProfilePosts";
import EditProfile from "../components/EditProfile";
import { MoreVert } from "@mui/icons-material";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserCheck, UserPlus } from "lucide-react";

function ProfilePage() {
  const auth = useRecoilValue(authState);
  const { username } = useParams();
  const loggedInUser = useRecoilValue(userState).user;
  const setUserState = useSetRecoilState(userState);
  const [userData, setUserData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingsCount, setFollowingsCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsOwnProfile(false);
  
        if (auth.username === username) {
          setIsOwnProfile(true);
          setUserData(loggedInUser);
          setFollowingsCount(loggedInUser.following?.length || 0);
          setFollowersCount(loggedInUser.followers?.length || 0);
        } else {
          const data = await fetchUserData(username, auth.token);
          setUserData(data);
          setIsFollowing(data.followers.includes(loggedInUser._id));
          setFollowingsCount(data.following?.length || 0);
          setFollowersCount(data.followers?.length || 0);
        }
      } catch (err) {
        setError("Failed to load user data.");
        console.error("Error Fetching user data:", err);
      }
    };
  
    fetchData();
  }, [username, auth.username, loggedInUser, auth.token]);

  const handleToggleFollow = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/follow`,
        { userId: loggedInUser._id, targetId: userData._id },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      if (response.status === 200) {
        const message = response.data.msg;
        if (message === "Followed") {
          setIsFollowing(true);
          setFollowersCount((prev) => prev + 1);

          setUserState((prevState) => ({
            user: {
              ...prevState.user,
              following: [...prevState.user.following, userData._id],
            },
          }));
        } else if (message === "Unfollowed") {
          setIsFollowing(false);
          setFollowersCount((prev) => prev - 1);

          setUserState((prevState) => ({
            user: {
              ...prevState.user,
              following: prevState.user.following.filter(
                (id) => id !== userData._id
              ),
            },
          }));
        }
      }
    } catch (err) {
      console.log("Error toggling follow status:", err);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-slate-100 p-5 grid grid-cols-3 gap-4 w-full h-full">
      <div className="col-span-2 bg-green-200 rounded-2xl shadow-lg">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-cover rounded-t-2xl h-60 relative">
          <IconButton sx={{ position: "absolute", top: 4, right: 4, color: "white" }}>
            <MoreVert />
          </IconButton>
        </div>
        <div className="px-8 mt-10">
          <div className="flex justify-between">
            <div className="flex gap-6">
              <img
                referrerPolicy="no-referrer"
                src={userData.profileImageUrl || defaultImage}
                alt="profile_image"
                className="rounded-full border-4 border-slate-200 w-32 h-32"
              />
              <div>
                <h1 className="text-3xl">{userData.firstname} {userData.lastname}</h1>
                <h3 className="text-sm text-gray-500">@{userData.username}</h3>
                <div className="flex mt-5 text-base gap-3">
                  <p>{followersCount} Followers</p>
                  <p>{followingsCount} Followings</p>
                  <p>{userData.posts?.length || 0} Posts</p>
                </div>
              </div>
            </div>
            {isOwnProfile ? (
              <div className="flex flex-col gap-2">
                <Button onClick={() => setIsEdited(!isEdited)}>
                  {isEdited ? "Cancel" : "Edit Profile"}
                </Button>
                { loggedInUser?.isOAuthUser ? <Link to="/create-password"><Button variant="default" >
                  Create Password</Button> </Link> : <Link to="/request-reset"><Button variant="destructive">
                  Reset Password</Button> </Link> }
          
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  onClick={handleToggleFollow}
                >
                  {isFollowing ? <UserCheck className="mr-2" /> : <UserPlus className="mr-2" />}
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline">
                  <MessageSquare />
                </Button>
              </div>
            )}
          </div>
          {isEdited ? (
            <EditProfile isEdited={isEdited} setIsEdited={setIsEdited} />
          ) : (
            <ProfileInfo userData={userData} />
          )}
          <ProfilePosts userData={userData} />
        </div>
      </div>
      <div className="bg-red-400 rounded-2xl shadow-lg">
        Sidebar content
      </div>
    </div>
  );
}

export default ProfilePage;
