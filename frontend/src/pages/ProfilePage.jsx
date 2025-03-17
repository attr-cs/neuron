import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authState } from '../store/atoms';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, MessageSquare, Mail, MapPin, Calendar, Link as LinkIcon, Loader, Info, MoreVertical } from 'lucide-react';
import DefaultAvatar from '@/components/ui/DefaultAvatar';
import AdminBadge from '@/components/ui/AdminBadge';
import FollowModal from '@/components/FollowModal';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/contexts/SocketContext';
import OnlineStatus from '@/components/ui/OnlineStatus';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import  PostCard  from '@/components/PostCard'
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import defaultAvatar from "@/utils/defaultAvatar";
import { BannerImageUpload } from '@/components/BannerImageUpload';
import { Mentions } from '@/components/ui/Mentions';
import { ReportDialog } from '@/components/ui/ReportDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Add this PostSkeleton component before the ProfilePage component
const PostSkeleton = () => (
  <Card className="p-6 space-y-4 mb-4 bg-card/50 backdrop-blur-sm border-none animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="h-10 w-10 rounded-full bg-muted" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-[140px] bg-muted rounded" />
        <div className="h-3 w-[100px] bg-muted rounded" />
      </div>
    </div>
    <div className="h-20 w-full bg-muted rounded" />
    <div className="flex justify-between">
      <div className="h-8 w-20 bg-muted rounded" />
      <div className="h-8 w-20 bg-muted rounded" />
    </div>
  </Card>
);

const UserInfoDialog = ({ isOpen, onClose, user }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>About {user?.firstname}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {user?.bio && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Bio</h4>
              <div className="bio">
                <Mentions text={user.bio} />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {user?.email && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Email</h4>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            )}
            
            {user?.location && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Location</h4>
                <p className="text-sm text-muted-foreground">{user.location}</p>
              </div>
            )}
            
            {user?.gender && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Gender</h4>
                <p className="text-sm text-muted-foreground">{user.gender}</p>
              </div>
            )}
            
            {user?.birthdate && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Birth Date</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(user.birthdate), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
            
            {user?.website && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Website</h4>
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {user.website}
                </a>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-semibold mb-1">Joined</h4>
              <p className="text-sm text-muted-foreground">
                {format(parseISO(user.createdAt), 'MMMM yyyy')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProfilePage = () => {
  const { username } = useParams();
  const auth = useRecoilValue(authState);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const { onlineUsers } = useSocket();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [followLoadingStates, setFollowLoadingStates] = useState({});
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Fetch profile data with follower status and counts
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/profile/${username}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` }
          }
        );
        // Add error logging to see the response structure
        console.log('Profile response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    }
  });

  // Lazy load followers list
  const { data: followersData, isLoading: isLoadingFollowers } = useQuery({
    queryKey: ['followers', user?._id],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/followers/${user._id}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` }
          }
        );
        // The backend returns the array directly, so no need to access .followers
        return response.data || [];
      } catch (error) {
        console.error('Error fetching followers:', error);
        throw error;
      }
    },
    enabled: !!user && showFollowersModal,
  });

  // Lazy load following list
  const { data: followingData, isLoading: isLoadingFollowing } = useQuery({
    queryKey: ['following', user?._id],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/following/${user._id}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` }
          }
        );
        // The backend returns the array directly, so no need to access .following
        return response.data || [];
      } catch (error) {
        console.error('Error fetching following:', error);
        throw error;
      }
    },
    enabled: !!user && showFollowingModal,
  });

  // Modify the follow mutation
  const followMutation = useMutation({
    mutationFn: async (userId) => {
      setFollowLoadingStates(prev => ({ ...prev, [userId]: true }));
      try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/follow/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data;
      } finally {
        setFollowLoadingStates(prev => ({ ...prev, [userId]: false }));
      }
    },
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profile', username] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData(['profile', username]);

      // Optimistically update profile
      queryClient.setQueryData(['profile', username], old => ({
        ...old,
        isFollowedByMe: !old.isFollowedByMe,
        followersCount: old.isFollowedByMe ? old.followersCount - 1 : old.followersCount + 1
      }));

      return { previousProfile };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['profile', username], context.previousProfile);
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries(['profile', username]);
      if (showFollowersModal) {
        queryClient.invalidateQueries(['followers', user?._id]);
      }
      if (showFollowingModal) {
        queryClient.invalidateQueries(['following', user?._id]);
      }
    },
  });

  // Update the follow toggle handler
  const handleFollowToggle = async (userId) => {
    try {
      await followMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  // Add this new query for user posts
  const { data: userPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['userPosts', username],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/post/user/${username}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data;
    },
    enabled: !!username
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto sm:px-4">
        <Card className="overflow-hidden bg-card sm:rounded-lg rounded-none">
          {/* Cover Image - increased height */}
          <div 
            className="relative w-full h-[200px] bg-muted overflow-hidden"
          >
            {user?.bannerImage?.displayUrl ? (
              <img
                src={user.bannerImage.displayUrl}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            ) : (
              // Default banner or gradient background when no banner image exists
              <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900" />
            )}
          </div>
          
          {/* Profile Content - removed top padding */}
          <div className="relative px-4 sm:px-6 pb-6">
            {/* Profile Image and Basic Info - adjusted margin top */}
            <div className="flex flex-col items-center -mt-20 sm:-mt-24">
              <div className="relative z-10 mb-4">
                {auth.userId === user?._id ? (
                  <ProfileImageUpload
                    currentImage={user.profileImage?.displayUrl}
                    onImageUpdate={(newImage) => {
                      queryClient.setQueryData(['profile', username], old => ({
                        ...old,
                        profileImage: newImage
                      }));
                    }}
                    size="lg"
                  />
                ) : (
                  <div className="relative">
                    <img
                      src={user.profileImage?.displayUrl || defaultAvatar}
                      alt={user.username}
                      className="w-32 h-32 rounded-full border-4 border-background object-cover shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    {/* Online Status Indicator */}
                    {onlineUsers.has(user._id) && (
                      <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center gap-0">
                  <h1 className="text-2xl font-bold">
                    {user?.firstname} {user?.lastname}
                  </h1>
                  {user?.isAdmin && <AdminBadge />}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 rounded-full w-6"
                    onClick={() => setShowUserInfo(true)}
                  >
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </Button>
                  </div>
                <p className="text-sm text-muted-foreground mt-1">@{user?.username}</p>
            </div>

              {/* Action Buttons */}
              {auth.userId !== user?._id && (
                <div className="flex gap-3 mb-6">
                  <Button
                    variant={user?.isFollowedByMe ? "secondary" : "default"}
                    disabled={followLoadingStates[user._id]}
                    onClick={() => handleFollowToggle(user._id)}
                    className="w-32 h-10"
                  >
                    {followLoadingStates[user._id] ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : user?.isFollowedByMe ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/messages/${user.username}`)}
                    className="h-10"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              )}

              {/* Stats */}
              <div className="flex justify-center gap-4 sm:gap-6 w-full border-t border-b border-border/40 py-3 mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowFollowingModal(true)}
                  className={cn(
                    "flex flex-col items-center",
                    "px-4 py-2",
                    "h-auto",
                    "hover:bg-accent/80",
                    "transition-all duration-200",
                    "group"
                  )}
                >
                  <span className="text-base sm:text-lg font-semibold group-hover:text-primary">
                    {user?.followingCount || 0}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground group-hover:text-primary/80">
                    Following
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowFollowersModal(true)}
                  className={cn(
                    "flex flex-col items-center",
                    "px-4 py-2",
                    "h-auto",
                    "hover:bg-accent/80",
                    "transition-all duration-200",
                    "group"
                  )}
                >
                  <span className="text-base sm:text-lg font-semibold group-hover:text-primary">
                    {user?.followersCount || 0}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground group-hover:text-primary/80">
                    Followers
                  </span>
                    </Button>
                  </div>

              {/* Add Tabs for Posts and Media */}
              <Tabs
                defaultValue="posts"
                className="w-full"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                </TabsList>
                <TabsContent value="posts" className="mt-6 space-y-4">
                  {isLoadingPosts ? (
                    Array(3).fill(0).map((_, i) => (
                      <PostSkeleton key={i} />
                    ))
                  ) : userPosts?.length > 0 ? (
                    userPosts.map(post => (
                      <PostCard
                        key={post._id}
                        post={post}
                        userBasicInfo={user}
                        onLike={() => {}} // Implement these handlers
                        onDelete={() => {}}
                        onComment={() => {}}
                        showComments={false}
                        setShowComments={() => {}}
                        commentText=""
                        setCommentText={() => {}}
                        isSubmittingComment={false}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No posts yet
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="media" className="mt-6">
                  <div className="grid grid-cols-3 gap-1">
                    {userPosts?.filter(post => post.images?.length > 0)
                      .map(post => (
                        <div
                          key={post._id}
                          className="aspect-square overflow-hidden rounded-md"
                        >
                          <img
                            src={post.images[0].displayUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                    </div>
                      ))}
                    </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          </Card>

        {/* User Info Dialog */}
        <UserInfoDialog
          isOpen={showUserInfo}
          onClose={() => setShowUserInfo(false)}
          user={user}
        />

        {/* Modals */}
        <FollowModal
          isOpen={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          data={followersData || []}
          type="followers"
          currentUserId={auth.userId}
          onFollowToggle={handleFollowToggle}
          followLoading={followLoadingStates}
          isLoadingModalData={isLoadingFollowers}
        />

      <FollowModal
          isOpen={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          data={followingData || []}
          type="following"
          currentUserId={auth.userId}
          onFollowToggle={handleFollowToggle}
          followLoading={followLoadingStates}
          isLoadingModalData={isLoadingFollowing}
        />

        {/* Add report button in the banner area if not own profile */}
        {auth.userId !== user?._id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40"
              >
                <MoreVertical className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                Report user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Add Report Dialog */}
        <ReportDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          targetType="user"
          targetId={user?._id}
          targetUser={user?._id}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
