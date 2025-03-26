import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import EmojiPicker from 'emoji-picker-react'
import imageCompression from 'browser-image-compression';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import { useRecoilValue } from 'recoil'
import { authState, userBasicInfoState } from '../store/atoms'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageSquare, Heart, Share2, Image as ImageIcon, Bookmark, Send, X, MoreVertical, Loader2, Maximize, Flag } from 'lucide-react'
import defaultAvatar from "../utils/defaultAvatar"
import uploadImage from "../utils/uploadImage"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Mentions } from '@/components/ui/Mentions'
import { ReportDialog } from '@/components/ui/ReportDialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PostCard from '@/components/PostCard'

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
)

const ImageUploadPreview = ({ imageUrl, isUploading, onRemove }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative mb-4 rounded-lg overflow-hidden group"
    >
      {isUploading ? (
        <div className="w-full h-[300px] bg-muted/30 rounded-lg animate-pulse flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <img 
            src={imageUrl} 
            alt="Upload preview" 
            className="w-full max-h-[300px] object-cover transition-transform group-hover:scale-[1.02]"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 transition-colors"
            onClick={onRemove}
          >
            <X className="h-4 w-4 text-white" />
          </Button>
        </>
      )}
    </motion.div>
  );
};

const ImageDialog = ({ isOpen, onClose, imageUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border-none min-h-[300px] flex items-center justify-center bg-black">
          {isLoading && (
          <Loader2 className="animate-spin w-10 h-10 text-gray-300" />
          )}
          <img
            src={imageUrl}
            alt="Full size"
          className={`w-full h-auto max-h-[80vh] object-contain ${
            isLoading ? "hidden" : "block"
          }`}
            onLoad={() => setIsLoading(false)}
          />
      </DialogContent>
    </Dialog>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useRecoilValue(authState);
  const userBasicInfo = useRecoilValue(userBasicInfoState);
  const { toast } = useToast();
  
  // States
  const [newPost, setNewPost] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showComments, setShowComments] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  // Fetch posts using React Query
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/post`,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data;
    }
  });

  // Like mutation with optimistic updates
  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/post/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries(['posts']);
      const previousPosts = queryClient.getQueryData(['posts']);
      
      queryClient.setQueryData(['posts'], old => 
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

      return { previousPosts };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(['posts'], context.previousPosts);
      toast({
        title: "Error",
        description: err.response?.status === 403 
          ? "You cannot like your own post"
          : "Failed to like post",
        variant: "destructive"
      });
    }
  });

  const handleLikePost = async (postId) => {
    // Find the post to update
    const currentPosts = queryClient.getQueryData(['posts']);
    const postToUpdate = currentPosts.find(p => p._id === postId);
    
    if (!postToUpdate) return;

    // Immediately update UI optimistically
    queryClient.setQueryData(['posts'], old => 
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

    // Make API call in background
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/post/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
    } catch (error) {
      // Revert on error
      queryClient.setQueryData(['posts'], old => 
        old.map(post => 
          post._id === postId ? postToUpdate : post
        )
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
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['comments', postId]);
      toast({
        title: "Success",
        description: "Comment added successfully",
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

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      setIsCreating(true);
      
      let imageData = null;
      if (selectedImageFile) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        
        const compressedFile = await imageCompression(selectedImageFile, options);
        imageData = await uploadImage(compressedFile);
      }

      const postData = {
        content: newPost,
        images: imageData ? [{
          imageId: imageData.imageId,
          url: imageData.url,
          thumbUrl: imageData.thumbUrl,
          displayUrl: imageData.displayUrl
        }] : []
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/post/user`,
        postData,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );

      // Update posts cache
      queryClient.setQueryData(['posts'], old => [response.data, ...old]);
      
      setNewPost('');
      setImageUrl('');
      setSelectedImageFile(null);
      
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/post/${postId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      
      queryClient.setQueryData(['posts'], old => 
        old.filter(post => post._id !== postId)
      );
      
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploadingImage(true);
        
        // Create a preview URL immediately
        const previewUrl = URL.createObjectURL(file);
        setImageUrl(previewUrl);
        setSelectedImageFile(file);
        
      } catch (error) {
        console.error('Error handling image:', error);
        setImageUrl('');
        setSelectedImageFile(null);
        toast({
          title: "Error",
          description: "Failed to handle image. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleRemoveImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl('');
    setSelectedImageFile(null);
    
    // Reset the file input
    const fileInput = document.getElementById('imageInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen">
      <Toaster />
      
      {/* Create Post Card */}
      <Card className="mb-8 overflow-hidden border-none bg-gradient-to-br from-background to-muted/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10 transition-transform hover:scale-105">
  <AvatarImage 
    src={userBasicInfo?.profileImage?.displayUrl || defaultAvatar} 
    alt={userBasicInfo?.firstname} 
    className="object-cover w-full h-full" // Add this class to maintain aspect ratio
  />
  <AvatarFallback>{userBasicInfo?.firstname?.[0]}</AvatarFallback>
</Avatar>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {userBasicInfo?.firstname} {userBasicInfo?.lastname}
              </h3>
              <p className="text-sm text-muted-foreground">@{auth?.username}</p>
            </div>
          </div>

          <Textarea
            placeholder="Share your thoughts..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[120px] mb-4 bg-background/80 resize-none text-base focus:ring-2 focus:ring-primary/20 whitespace-pre-line"
            rows={4}
          />

          {/* Image Preview */}
          <AnimatePresence>
            {(imageUrl || isUploadingImage) && (
              <ImageUploadPreview
                imageUrl={imageUrl}
                isUploading={isUploadingImage}
                onRemove={handleRemoveImage}
              />
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => document.getElementById('imageInput').click()}
              disabled={isUploadingImage}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isUploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Image
                </>
              )}
            </Button>
            <input
              type="file"
              id="imageInput"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Button 
              onClick={handleCreatePost} 
              disabled={isCreating || !newPost.trim()}
              className="relative overflow-hidden group"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Posts Feed */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <PostSkeleton key={i} />)
        ) : (
          posts?.map(post => (
            <PostCard
              key={post._id}
              post={post}
              userBasicInfo={userBasicInfo}
              onLike={handleLikePost}
              onDelete={handleDeletePost}
              onComment={handleAddComment}
              showComments={showComments}
              setShowComments={setShowComments}
              commentText={commentText}
              setCommentText={setCommentText}
              isSubmittingComment={isSubmittingComment}
            />
          ))
        )}
      </motion.div>
    </div>
  )
}

export default Dashboard

