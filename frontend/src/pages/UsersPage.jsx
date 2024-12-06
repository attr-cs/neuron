import { useEffect, useState } from "react";
import axios from 'axios';
import defaultImage from '../assets/default_profile_avatar.png';
import { authState } from '../store/atoms';
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, Search, Loader2, UserPlus, UserCheck } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import AdminBadge from '@/components/ui/AdminBadge';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 dark:from-indigo-400 dark:to-indigo-600">
            Connect with Others
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover and connect with like-minded individuals
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-destructive/10 border border-destructive/20">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-muted focus:border-primary/50 transition-all duration-300"
          />
        </div>

        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.filter(user =>
              user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.lastname.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group"
              >
                <Card className="backdrop-blur-sm bg-card/50 border-muted hover:border-primary/20 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center gap-4 p-6">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={user.profileImageUrl || defaultImage}
                      alt="profile_image"
                      className="w-16 h-16 rounded-full object-cover cursor-pointer shadow-md ring-1 ring-primary/10 hover:ring-primary/30 transition-all"
                      onClick={() => navigate(`/profile/${user.username}`)}
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {user.firstname} {user.lastname}
                        </h2>
                        {user.isAdmin && <AdminBadge />}
                      </div>
                      <CardDescription className="text-muted-foreground">
                        @{user.username}
                      </CardDescription>
                    </div>
                    <Button
                      variant={user.followers?.includes(auth.userId) ? "secondary" : "default"}
                      size="sm"
                      disabled={followLoading[user._id]}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollowToggle(user._id);
                      }}
                      className={`transition-all duration-300 ${
                        user.followers?.includes(auth.userId)
                          ? "bg-primary/10 hover:bg-primary/20 text-primary"
                          : "bg-primary hover:bg-primary/90"
                      }`}
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
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {users.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-16"
          >
            <UserCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No users found</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default UsersPage;

