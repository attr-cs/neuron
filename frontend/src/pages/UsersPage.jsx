import { useEffect, useState } from "react";
import axios from 'axios';
import defaultImage from '../assets/default_profile_avatar.png';
import { authState } from '../store/atoms';
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, Mail, Calendar, Search, Loader2, UserPlus, UserCheck } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function UsersPage() {
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("Fetching users with token:", auth.token);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/userslist`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
          }
        );
        console.log("Users response:", response.data);
        if (response.status === 200) {
          const usersList = response.data.users.filter(user => user._id !== auth.userId);
          setUsers(usersList);
        }
      } catch (err) {
        console.error("Error details:", err.response || err);
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) {
      fetchUsers();
    } else {
      setError("Authentication required");
      setLoading(false);
    }
  }, [auth.userId, auth.token]);

  const handleFollowToggle = async (userId) => {
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/follow`,
        { userId: auth.userId, targetId: userId },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        }
      );

      if (response.status === 200) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId
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
      setError(err.response?.data?.message || "Failed to update follow status");
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Current state:", { 
    loading, 
    users: users.length, 
    error, 
    filteredUsers: filteredUsers.length 
  });

  if (!auth.token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive">
          <AlertDescription>Please login to view users</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center">Users</h1>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center gap-4">
                  <img
                    referrerPolicy="no-referrer"
                    src={user.profileImageUrl || defaultImage}
                    alt="profile_image"
                    className="w-16 h-16 rounded-full object-cover cursor-pointer"
                    onClick={() => navigate(`/profile/${user.username}`)}
                  />
                  <div className="flex-grow">
                    <CardTitle 
                      className="cursor-pointer hover:text-purple-600"
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      {`${user.firstname} ${user.lastname}`}
                    </CardTitle>
                    <CardDescription>@{user.username}</CardDescription>
                  </div>
                  <Button
                    variant={user.followers?.includes(auth.userId) ? "secondary" : "default"}
                    size="sm"
                    disabled={followLoading[user._id]}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollowToggle(user._id);
                    }}
                  >
                    {followLoading[user._id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.followers?.includes(auth.userId) ? (
                      <UserCheck className="h-4 w-4" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredUsers.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
          <UserCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No users found</p>
        </motion.div>
      )}
    </div>
  );
}

export default UsersPage;

