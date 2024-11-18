import defaultImage from "../assets/default_profile_avatar.png";
import { Link, useParams } from "react-router-dom";
import fetchUserData from "../utils/fetchUserData";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, userState } from "../store/atoms";
import { useEffect, useState } from "react";
import { IconButton, Paper } from "@mui/material";
import ProfileInfo from "../components/ProfileInfo";
import ProfilePosts from "../components/ProfilePosts";
import EditProfile from "../components/EditProfile";
import { MoreVert } from "@mui/icons-material";
import axios from 'axios'
import { Button } from "@/components/ui/button";
import { MessageSquare, UserCheck, UserPlus } from "lucide-react";

function ProfilePage() {
  const auth = useRecoilValue(authState);
  const { username } = useParams();
  const loggedInUser = useRecoilValue(userState).user;
    const setUserState = useSetRecoilState(userState)
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
        if (auth.username === username) {
          setIsOwnProfile(true);
          setUserData(loggedInUser);
          setFollowingsCount(loggedInUser.following?.length || 0);
          setFollowersCount(loggedInUser.followers?.length || 0);
        } else {
          const data = await fetchUserData(username, auth.token);
          setUserData(data);
          setIsFollowing(data.followers.includes(loggedInUser._id));
          setFollowingsCount(data.following.length || 0);
          setFollowersCount(data.followers.length || 0);
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
      <Paper elevation={1} sx={{ borderRadius: "17px" }} className="col-span-2 bg-green-200">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-center bg-cover mt-0 rounded-t-2xl min-h-60 w-full relative">
          <IconButton sx={{ position: "absolute", top: 4, right: 4, color: "white" }}>
            <MoreVert />
          </IconButton>
        </div>
        <div className="px-8 mt-10">
          <div className="flex justify-between">
            <div className="flex justify-around lg:gap-6 gap-3">
              <img
                referrerPolicy="no-referrer"
                src={userData.profileImageUrl || defaultImage}
                alt="profile_image"
                className="rounded-full border-4 border-slate-200 lg:w-32 lg:h-32 w-20 h-20"
              />
              <div className="mt-2">
                <h1 className="lg:text-3xl text-2xl">
                  {userData.firstname} {userData.lastname}
                </h1>
                <h3 className="text-sm text-gray-500">@{userData.username}</h3>
                <div className="flex lg:mt-5 mt-2 lg:text-base text-sm flex-row gap-3">
                  <p>{followersCount} Followers</p>
                  <p>{followingsCount} Followings</p>
                  <p>{userData.posts?.length || 0} Posts</p>
                </div>
              </div>
            </div>
            {isOwnProfile ? (
              <div className="flex flex-col gap-1">
                {!isEdited && (
                  <Button variant="default" onClick={() => setIsEdited(!isEdited)}>
                    Edit Profile
                  </Button>
                )}
                {loggedInUser?.isOAuthUser ? (
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
              <div className="flex gap-1 h-max items-center">
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  size="sm"
                  onClick={handleToggleFollow}
                  className="transition-all duration-300 ease-in-out hover:scale-105"
                >
                  {isFollowing ? (
                    <UserCheck className="h-4 w-4 mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline">
                  <MessageSquare />
                </Button>
              </div>
            )}
          </div>
          <div className="mt-8 text-base gap-6 pl-2">
            {isEdited ? (
              <EditProfile isEdited={isEdited} setIsEdited={setIsEdited} />
            ) : (
              <ProfileInfo
                bio=""
                birthdate=""
                location=""
                userData={userData}
                gender=""
                dateJoined=""
                siteLink=""
              />
            )}
          </div>
          <ProfilePosts userData={userData} />
        </div>
      </Paper>
      <Paper elevation={1} sx={{ borderRadius: "17px" }} className="bg-red-400">
        Sidebar content
      </Paper>
    </div>
  );
}

export default ProfilePage;