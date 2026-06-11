import { useEffect, useState, useMemo, useCallback } from "react";
import axios from 'axios';
import { useSocket } from '@/contexts/SocketContext';
import DefaultAvatar from '../components/ui/DefaultAvatar';
import { authState } from '../store/atoms';
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, UserPlus, UserCheck, Users2, Shield } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import defaultAvatar from '../utils/defaultAvatar';
import OnlineStatus from '@/components/ui/OnlineStatus';

// Custom Online Status Dot component with clean, professional alignment
const OnlineStatusDot = ({ userId }) => {
  const socket = useSocket();
  const auth = useRecoilValue(authState);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (userId === auth.userId) {
      setIsOnline(true);
      return;
    }

    if (!socket || !userId) return;
    
    const handleStatusChange = ({ userId: changedUserId, status }) => {
      if (changedUserId === userId) {
        setIsOnline(status === 'online');
      }
    };

    socket.on('user_status_change', handleStatusChange);
    socket.emit('get_user_status', userId);

    return () => {
      socket.off('user_status_change', handleStatusChange);
    };
  }, [socket, userId, auth.userId]);

  if (!isOnline) return null;

  return (
    <div 
      className={cn(
        "w-3 h-3 rounded-full border-2 border-white dark:border-black",
        "absolute bottom-0 right-0",
        "bg-emerald-500 shadow-sm",
        "animate-in fade-in-0 duration-300"
      )}
      title="Online"
    />
  );
};

function UsersPage() {
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [followLoading, setFollowLoading] = useState({});
  const [followStatus, setFollowStatus] = useState({});

  useEffect(() => {
    let isSubscribed = true;

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/userslist`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
          }
        );
        
        if (isSubscribed && response.status === 200) {
          const usersList = response.data.users.filter(user => user._id !== auth.userId);
          setUsers(usersList);
          
          // Initialize follow status for each user
          const initialFollowStatus = {};
          usersList.forEach(user => {
            initialFollowStatus[user._id] = user.followers.includes(auth.userId);
          });
          setFollowStatus(initialFollowStatus);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error details:", err.response || err);
          setError(err.response?.data?.message || "Failed to fetch users");
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    if (auth.token) {
      fetchUsers();
    } else {
      setError("Authentication required");
      setLoading(false);
    }

    return () => {
      isSubscribed = false;
    };
  }, [auth.userId, auth.token]);

  const handleFollowToggle = useCallback(async (userId) => {
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/follow/${userId}`,
        {},
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
                  followers: response.data.isFollowing
                    ? [...user.followers, auth.userId]
                    : user.followers.filter(id => id !== auth.userId)
                }
              : user
          )
        );
        setFollowStatus(prev => ({ ...prev, [userId]: !prev[userId] }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update follow status");
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  }, [auth.userId, auth.token]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const filteredUsers = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return searchTerm
      ? users.filter(user =>
          user.username.toLowerCase().includes(searchLower) ||
          user.firstname.toLowerCase().includes(searchLower) ||
          user.lastname.toLowerCase().includes(searchLower)
        )
      : users;
  }, [users, searchTerm]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white dark:bg-zinc-950 rounded-2xl p-6 border border-zinc-150 dark:border-zinc-900/80">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="absolute bottom-0 right-0 w-3 h-3 rounded-full" />
            </div>
            <div className="flex-grow space-y-2 min-w-0">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center items-center gap-3">
              <Users2 className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-900 dark:text-white animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Index Directory</h1>
            </div>
            <div className="max-w-xl mx-auto">
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        
        {/* Editorial Directory Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-3">
            <Users2 className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-950 dark:text-white" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
              Community Directory
            </h1>
          </div>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-medium max-w-lg mx-auto">
            Discover and curate authentic connections with intellectual profiles within the network.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-200/40 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 max-w-xl mx-auto rounded-2xl animate-in fade-in-50 duration-300">
            <AlertDescription className="text-red-600 dark:text-red-400 font-medium text-center">{error}</AlertDescription>
          </Alert>
        )}

        {/* Minimal High-Contrast Search Block */}
        <div className="relative max-w-xl mx-auto w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4.5 h-4.5 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search profiles by name or username..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-11 pr-4 h-11 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 focus-visible:ring-zinc-200 dark:focus-visible:ring-zinc-800 rounded-xl text-zinc-900 dark:text-white font-medium text-sm transition-all shadow-sm"
          />
        </div>

        {/* Grid Ledger System */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div
                className={cn(
                  "group rounded-2xl bg-white dark:bg-zinc-950 border transition-all duration-300",
                  user.isAdmin 
                    ? "border-zinc-300 dark:border-zinc-800 hover:border-zinc-400" 
                    : "border-zinc-150 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800",
                  "shadow-sm hover:shadow-md"
                )}
              >
                <div className="p-5 flex items-center gap-4">
                  
                  {/* Portrait & Custom Status Dot */}
                  <div className="relative shrink-0">
                    {user.profileImage?.thumbUrl ? (
                      <img
                        src={user.profileImage.thumbUrl}
                        alt={user.username}
                        className={cn(
                          "w-12 h-12 rounded-full object-cover",
                          "border border-zinc-200/50 dark:border-zinc-800/80",
                          "cursor-pointer transition-transform duration-300",
                          "hover:scale-105"
                        )}
                        onClick={() => navigate(`/profile/${user.username}`)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <DefaultAvatar 
                        onClick={() => navigate(`/profile/${user.username}`)} 
                        className={cn(
                          "w-12 h-12 rounded-full",
                          "border border-zinc-200/50 dark:border-zinc-800/80",
                          "cursor-pointer transition-transform duration-300",
                          "hover:scale-105"
                        )}
                      />
                    )}
                    <OnlineStatus userId={user._id} />
                  </div>
                  
                  {/* Context Text Box */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 
                        className={cn(
                          "font-bold text-sm sm:text-base truncate cursor-pointer leading-tight",
                          "transition-colors duration-200",
                          "text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white"
                        )}
                        onClick={() => navigate(`/profile/${user.username}`)}
                      >
                        {user.firstname} {user.lastname}
                      </h2>
                      {user.isAdmin && (
                        <div className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono px-2 py-0.5 rounded-md border border-zinc-200/50 dark:border-zinc-800">
                          <Shield className="w-3 h-3 text-zinc-400" />
                          <span>Admin</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium truncate mt-0.5">
                      @{user.username}
                    </p>
                  </div>

                  {/* High Contrast Tactile Follow Trigger */}
                  <Button
                    variant={followStatus[user._id] ? "outline" : "default"}
                    size="icon"
                    disabled={followLoading[user._id]}
                    onClick={() => handleFollowToggle(user._id)}
                    className={cn(
                      "shrink-0 h-9 w-9 rounded-xl transition-all duration-300",
                      followStatus[user._id]
                        ? "border-zinc-200 dark:border-zinc-800 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 text-zinc-500 bg-transparent"
                        : "bg-zinc-950 text-white hover:bg-zinc-850 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
                    )}
                  >
                    {followLoading[user._id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : followStatus[user._id] ? (
                      <UserCheck className="h-4.5 w-4.5" />
                    ) : (
                      <UserPlus className="h-4.5 w-4.5" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Empty Ledger Screen */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-16 sm:py-24 text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-950/20 rounded-2xl border border-zinc-150 dark:border-zinc-900">
            <Users2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-850" />
            <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 tracking-tight">
              {searchTerm ? "No results matched your parameters" : "Index is completely empty"}
            </p>
            {searchTerm && (
              <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 font-medium">
                Try searching for a different name or username combination.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;