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

// Custom Online Status Dot component
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
        "w-3 h-3 rounded-full border-2 border-background",
        "absolute -bottom-0.5 -right-0.5",
        "bg-green-500 shadow-sm",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-card rounded-lg p-3 sm:p-4 border border-border">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
              <Skeleton className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full" />
            </div>
            <div className="flex-grow space-y-2 min-w-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background/50 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center space-y-4 animate-in fade-in-50 duration-500">
            <div className="flex justify-center items-center gap-2">
              <Users2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Loading Users</h1>
            </div>
            <div className="max-w-xl mx-auto px-3 sm:px-0">
              <Skeleton className="h-9 sm:h-10 w-full rounded-lg" />
            </div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="flex justify-center items-center gap-2">
            <Users2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Connect with Others
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Find and follow other users in the community
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-destructive/10 animate-in fade-in-50 duration-300 mx-3 sm:mx-0">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative max-w-xl mx-auto px-3 sm:px-0">
          <Search className="absolute left-6 sm:left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by name or username..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9 sm:pl-9 h-9 sm:h-10 bg-background/50 focus-visible:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredUsers.map(user => (
            <div
              key={user._id}
              className={cn(
                "group bg-card rounded-lg border",
                "transition-all duration-300 hover:shadow-lg",
                user.isAdmin 
                  ? "border-primary/20 hover:border-primary/40 dark:bg-primary/5" 
                  : "border-border hover:border-border/80 dark:bg-card/40",
                "animate-in fade-in-50 duration-500"
              )}
            >
              <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.username}
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover",
                        "ring-2",
                        user.isAdmin 
                          ? "ring-primary/20 group-hover:ring-primary/40" 
                          : "ring-border/50 group-hover:ring-border",
                        "cursor-pointer transition-all duration-300",
                        "hover:scale-105"
                      )}
                      onClick={() => navigate(`/profile/${user.username}`)}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <DefaultAvatar 
                      onClick={() => navigate(`/profile/${user.username}`)} 
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12",
                        "ring-2",
                        user.isAdmin 
                          ? "ring-primary/20 group-hover:ring-primary/40" 
                          : "ring-border/50 group-hover:ring-border",
                        "cursor-pointer transition-all duration-300",
                        "hover:scale-105"
                      )}
                    />
                  )}
                  <OnlineStatusDot userId={user._id} />
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 
                      className={cn(
                        "font-medium truncate cursor-pointer",
                        "transition-colors duration-200",
                        "text-sm sm:text-base",
                        user.isAdmin 
                          ? "text-primary group-hover:text-primary/80" 
                          : "text-foreground group-hover:text-primary"
                      )}
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      {user.firstname} {user.lastname}
                    </h2>
                    {user.isAdmin && (
                      <div className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full animate-in slide-in-from-left-5">
                        <Shield className="w-3 h-3" />
                        <span>Admin</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    @{user.username}
                  </p>
                </div>

                <Button
                  variant={user.followers?.includes(auth.userId) ? "outline" : "default"}
                  size="icon"
                  disabled={followLoading[user._id]}
                  onClick={() => handleFollowToggle(user._id)}
                  className={cn(
                    "shrink-0 transition-all duration-300",
                    "h-8 w-8",
                    user.followers?.includes(auth.userId)
                      ? "hover:bg-primary/10 hover:text-primary"
                      : "hover:bg-primary/90"
                  )}
                >
                  {followLoading[user._id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : user.followers?.includes(auth.userId) ? (
                    <UserCheck className="h-4 w-4" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-muted-foreground bg-card/40 rounded-lg border border-border mx-3 sm:mx-0">
            <Users2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-base sm:text-lg font-medium mb-1">
              {searchTerm ? "No users found matching your search" : "No users available"}
            </p>
            {searchTerm && (
              <p className="text-xs sm:text-sm">
                Try adjusting your search terms
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;
