import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authState } from '../store/atoms';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, UserCheck, MessageSquare, MapPin, Calendar, 
  Link as LinkIcon, Loader, Info, MoreVertical, Flag, Ban 
} from 'lucide-react';
import DefaultAvatar from '@/components/ui/DefaultAvatar';
import AdminBadge from '@/components/ui/AdminBadge';
import FollowModal from '@/components/FollowModal';
import { format, parseISO } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/contexts/SocketContext';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PostCard from '@/components/PostCard';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import defaultAvatar from "@/utils/defaultAvatar";
import { BannerImageUpload } from '@/components/BannerImageUpload';
import { Mentions } from '@/components/ui/Mentions';
import { ReportDialog } from '@/components/ui/ReportDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const PostSkeleton = () => (
  <div className="p-8 mb-6 bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 rounded-[28px] animate-pulse space-y-6 shadow-sm">
    <div className="flex items-center space-x-4">
      <div className="h-11 w-11 rounded-full bg-zinc-200 dark:bg-zinc-900" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-[160px] bg-zinc-200 dark:bg-zinc-900 rounded" />
        <div className="h-3 w-[110px] bg-zinc-200 dark:bg-zinc-900 rounded" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-900 rounded" />
      <div className="h-4 w-[90%] bg-zinc-200 dark:bg-zinc-900 rounded" />
    </div>
    <div className="h-44 w-full bg-zinc-200 dark:bg-zinc-900 rounded-2xl" />
  </div>
);

const UserInfoDialog = ({ isOpen, onClose, user }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-xl">
        <DialogTitle className="sr-only">About Profile</DialogTitle>
        <DialogDescription className="sr-only">Detailed profile parameters, user bio, location, gender, birthdate, and registration metrics</DialogDescription>
        <DialogHeader className="border-b border-zinc-150 dark:border-zinc-900 pb-3 mb-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">About {user?.firstname}</h3>
        </DialogHeader>
        <div className="space-y-5">
          {user?.bio && (
            <div>
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Bio</h4>
              <div className="text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                <Mentions text={user.bio} />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {user?.location && (
              <div>
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Location</h4>
                <p className="text-sm text-zinc-800 dark:text-zinc-250 font-medium">{user.location}</p>
              </div>
            )}
            
            {user?.gender && (
              <div>
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Gender</h4>
                <p className="text-sm text-zinc-800 dark:text-zinc-250 font-medium">{user.gender}</p>
              </div>
            )}
            
            {user?.birthdate && (
              <div>
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Birth Date</h4>
                <p className="text-sm text-zinc-800 dark:text-zinc-250 font-medium">
                  {format(new Date(user.birthdate), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
            
            {user?.website && (
              <div>
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Website</h4>
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-900 dark:text-white font-bold hover:underline break-all"
                >
                  {user.website.replace(/(^\w+:|^)\/\//, '')}
                </a>
              </div>
            )}
            
            <div>
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Joined</h4>
              <p className="text-sm text-zinc-800 dark:text-zinc-250 font-medium">
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
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(null);

  // Fetch profile data
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/profile/${username}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data;
    }
  });

  // Fetch followers
  const { data: followersData, isLoading: isLoadingFollowers } = useQuery({
    queryKey: ['followers', user?._id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/followers/${user._id}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data || [];
    },
    enabled: !!user && showFollowersModal,
    staleTime: 30000,
  });

  // Fetch following
  const { data: followingData, isLoading: isLoadingFollowing } = useQuery({
    queryKey: ['following', user?._id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/following/${user._id}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data || [];
    },
    enabled: !!user && showFollowingModal,
    staleTime: 30000,
  });

  // Follow mutation handles optimistic cache logic
  const followMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/follow/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries(['profile', username]);
      await queryClient.cancelQueries(['followers', user?._id]);
      await queryClient.cancelQueries(['following', user?._id]);

      const previousProfile = queryClient.getQueryData(['profile', username]);

      queryClient.setQueryData(['profile', username], old => ({
        ...old,
        isFollowedByMe: !old.isFollowedByMe,
        followersCount: old.isFollowedByMe ? old.followersCount - 1 : old.followersCount + 1
      }));

      return { previousProfile };
    },
    onError: (err, userId, context) => {
      queryClient.setQueryData(['profile', username], context.previousProfile);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(['profile', username]);
      queryClient.invalidateQueries(['followers', user?._id]);
      queryClient.invalidateQueries(['following', user?._id]);
    }
  });

  const handleFollowToggle = async (userId) => {
    if (followLoadingStates[userId]) return;
    try {
      await followMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  // Fetch posts published by the user
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

  const handleLikePost = async (postId) => {
    const currentPosts = queryClient.getQueryData(['userPosts', username]);
    if (!currentPosts) return;

    const postToUpdate = currentPosts.find(p => p._id === postId);
    if (!postToUpdate) return;

    queryClient.setQueryData(['userPosts', username], old => 
      old.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked
                ? post.likes.filter(id => id !== auth.userId)
                : [...post.likes, auth.userId]
            }
          : post
      )
    );

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/post/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
    } catch (error) {
      queryClient.setQueryData(['userPosts', username], old => 
        old.map(post => post._id === postId ? postToUpdate : post)
      );

      toast({
        title: "Error",
        description: error.response?.status === 403 
          ? "You cannot like your own post"
          : "Failed to like post",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/post/${postId}/comments`,
        { content: commentText },
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      setCommentText('');
      queryClient.invalidateQueries(['userPosts', username]);
      queryClient.invalidateQueries(['comments', postId]);
      toast({
        title: "Success",
        description: "Comment posted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <Loader className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50/50 border border-red-200 text-red-600 rounded-3xl p-4 text-center" role="alert">
          <p className="font-bold text-sm">Failed to retrieve profile</p>
          <p className="text-xs mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-8">
      <Toaster />
      <div className="container max-w-4xl mx-auto sm:px-4">
        <Card className="overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 rounded-[32px] shadow-sm">
          
          {/* Cover Header Image */}
          <div className="relative w-full h-[220px] bg-zinc-100 dark:bg-zinc-900 overflow-hidden select-none">
            {auth.userId === user?._id ? (
              <BannerImageUpload
                currentImage={user.bannerImage?.displayUrl}
                onImageUpdate={(newImage) => {
                  queryClient.setQueryData(['profile', username], old => ({
                    ...old,
                    bannerImage: newImage
                  }));
                }}
              />
            ) : (
              <>
                {user?.bannerImage?.displayUrl ? (
                  <img
                    src={user.bannerImage.displayUrl}
                    alt="User cover art"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-zinc-200 to-zinc-350 dark:from-zinc-900 dark:to-zinc-950" />
                )}
                
                {auth.userId !== user?._id && (
                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="bg-black/40 hover:bg-black/60 rounded-full h-9 w-9 text-white transition-all p-0"
                        >
                          <MoreVertical className="h-4.5 w-4.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1">
                        <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="rounded-lg cursor-pointer text-xs font-semibold p-2.5">
                          <Flag className="h-4 w-4 mr-2 text-zinc-400" />
                          Report User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Spatial Profile Column Section */}
          <div className="relative px-6 sm:px-10 pb-8">
            <div className="flex flex-col items-center -mt-20 sm:-mt-24">
              <div className="relative z-10 mb-5">
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
                      className="w-36 h-36 rounded-[28px] border-4 border-white dark:border-zinc-950 object-cover shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    {onlineUsers?.has(user._id) && (
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm animate-pulse" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center gap-1.5 flex-wrap">
                  <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {user?.firstname} {user?.lastname}
                  </h1>
                  {user?.isAdmin && <AdminBadge />}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 animate-none"
                    onClick={() => setShowUserInfo(true)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                {user?.isBanned && (
                  <span className="font-bold rounded-full px-3 py-1 bg-red-500/10 text-xs text-red-500 flex items-center justify-center gap-1 w-fit mx-auto mt-2">
                    <Ban className="w-3.5 h-3.5" strokeWidth={3} /> Suspended
                  </span>
                )}
                <p className="text-sm text-zinc-400 dark:text-zinc-500 font-mono mt-1">@{user?.username}</p>
              </div>

              {/* Action Operations */}
              {auth.userId !== user?._id && (
                <div className="flex gap-3 mb-6">
                  <Button
                    variant={user?.isFollowedByMe ? "secondary" : "default"}
                    disabled={followLoadingStates[user._id]}
                    onClick={() => handleFollowToggle(user._id)}
                    className={cn(
                      "w-32 h-10 font-semibold text-xs tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98]",
                      user?.isFollowedByMe 
                        ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                        : "bg-zinc-950 dark:bg-white text-white dark:text-black hover:opacity-90"
                    )}
                  >
                    {followLoadingStates[user._id] ? (
                      <Loader className="w-4 h-4 animate-spin text-zinc-500" />
                    ) : user?.isFollowedByMe ? (
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/messages/${user.username}`)}
                    className="h-10 border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold px-4 hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-transparent text-zinc-900 dark:text-white transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-2 text-zinc-400" />
                    Message
                  </Button>
                </div>
              )}

              {/* Minimal Ledger Profile Stats */}
              <div className="flex justify-center gap-4 sm:gap-10 w-full border-t border-b border-zinc-105 dark:border-zinc-900 py-3 mb-8">
                <Button
                  variant="ghost"
                  onClick={() => setShowFollowingModal(true)}
                  className="flex flex-col items-center px-4 py-1 h-auto hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl group transition-all duration-200"
                >
                  <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white leading-tight">
                    {user?.followingCount || 0}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5 group-hover:text-zinc-900 dark:group-hover:text-white font-mono">
                    Following
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowFollowersModal(true)}
                  className="flex flex-col items-center px-4 py-1 h-auto hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl group transition-all duration-200"
                >
                  <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white leading-tight">
                    {user?.followersCount || 0}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5 group-hover:text-zinc-900 dark:group-hover:text-white font-mono">
                    Followers
                  </span>
                </Button>
              </div>

              {/* Tabs Switch Section */}
              <Tabs
                defaultValue="posts"
                className="w-full"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-2 bg-zinc-100 dark:bg-zinc-900/60 p-1.5 rounded-2xl h-12 max-w-md mx-auto border border-zinc-200/20">
                  <TabsTrigger value="posts" className="rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all duration-250 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:text-zinc-950 dark:data-[state=active]:text-white">Posts</TabsTrigger>
                  <TabsTrigger value="media" className="rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all duration-250 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:text-zinc-950 dark:data-[state=active]:text-white">Media</TabsTrigger>
                </TabsList>
                
                <TabsContent value="posts" className="mt-8 space-y-4 text-left">
                  {isLoadingPosts ? (
                    Array(3).fill(0).map((_, i) => (
                      <PostSkeleton key={i} />
                    ))
                  ) : userPosts?.length > 0 ? (
                    userPosts.map(post => (
                      <PostCard
                        key={post._id}
                        post={post}
                        userBasicInfo={auth}
                        onLike={handleLikePost}
                        onDelete={() => {}}
                        onComment={handleAddComment}
                        showComments={showComments}
                        setShowComments={setShowComments}
                        commentText={commentText}
                        setCommentText={setCommentText}
                        isSubmittingComment={isSubmittingComment}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-zinc-400 dark:text-zinc-550 bg-white dark:bg-zinc-950/20 rounded-[24px] border border-zinc-150 dark:border-zinc-900 text-sm font-semibold">
                      No posts synchronized to timeline
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="media" className="mt-8">
                  {userPosts?.filter(post => post.images?.length > 0).length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {userPosts.filter(post => post.images?.length > 0)
                        .map(post => (
                          <div
                            key={post._id}
                            className="aspect-square overflow-hidden rounded-2xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 shadow-inner group relative cursor-pointer"
                          >
                            <img
                              src={post.images[0].displayUrl}
                              alt=""
                              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-400 dark:text-zinc-550 bg-white dark:bg-zinc-950/20 rounded-[24px] border border-zinc-150 dark:border-zinc-900 text-sm font-semibold">
                      No media files shared yet
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Card>
      </div>

      {/* Profile Detail Dialog */}
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

      {/* Report window */}
      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        targetType="user"
        targetId={user?._id}
        targetUser={user?._id}
      />
    </div>
  );
};

export default ProfilePage;