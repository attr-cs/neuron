import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import EmojiPicker from 'emoji-picker-react'
import imageCompression from 'browser-image-compression';
import { Link } from 'react-router-dom'
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

  const { toast } = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showComments, setShowComments] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const auth = useRecoilValue(authState)
  const userBasicInfo = useRecoilValue(userBasicInfoState)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/post`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      })
      console.log('Posts response:', response.data)
      
      setPosts(response.data)
      setLoading(false)
      
    } catch (error) {
      console.error('Error fetching posts:', error)
      setLoading(false)
    }
  }

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
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        }
      );

      setPosts([response.data, ...posts]);
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

  const handleLikePost = async (postId) => {
    try {
      // Find the post
      const post = posts.find(p => p._id === postId);
      if (!post) return;

      // Make API call first
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/post/${postId}/like`,
        {},
        {
          headers: { 'Authorization': `Bearer ${auth.token}` }
        }
      );

      // Update state with server response
      setPosts(currentPosts => 
        currentPosts.map(p => 
          p._id === postId 
            ? { 
                ...p, 
                isLiked: response.data.isLiked,
                likes: response.data.likes
              }
            : p
        )
      );
    } catch (error) {
      if (error.response?.status === 403) {
        toast({
          title: "Error",
          description: "You cannot like your own post",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to like post",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    
    try {
      setIsSubmittingComment(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/post/${postId}/comment`,
        { content: commentText },
        { headers: { 'Authorization': `Bearer ${auth.token}` } }
      );
      
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, comments: [...post.comments, response.data] }
          : post
      ));
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/post/${postId}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      setPosts(posts.filter(post => post._id !== postId));
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
            className="min-h-[120px] mb-4 bg-background/80 resize-none text-base focus:ring-2 focus:ring-primary/20"
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
      {/* <ScrollArea className="h-[calc(100vh-320px)]"> */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {loading ? (
            Array(3).fill(0).map((_, i) => <PostSkeleton key={i} />)
          ) : (
            posts.map((post) => (
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
      {/* </ScrollArea> */}
    </div>
  )
}

// Separate PostCard component for better organization
const PostCard = ({ post, userBasicInfo, onLike, onDelete, onComment, showComments, setShowComments, commentText, setCommentText, isSubmittingComment }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
  
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showCommentReportDialog, setShowCommentReportDialog] = useState(false);
  const [selectedCommentForReport, setSelectedCommentForReport] = useState(null);

  return (
    <motion.div
      variants={itemVariants}
      className="group"
    >
      <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                  <AvatarImage 
                    src={post.author?.profileImage?.thumbUrl || defaultAvatar} 
                    alt={post.author?.firstname || 'User'}
                    referrerPolicy="no-referrer" 
                  />
                  <AvatarFallback>
                    {post.author?.firstname?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {post.author?.firstname} {post.author?.lastname}
                    </h3>
                    <span className="text-sm text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">
                      @{post.author?.username}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(post.createdAt), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </Link>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {post.author?._id === userBasicInfo._id ? (
                  <DropdownMenuItem 
                    onClick={() => onDelete(post._id)}
                    className="text-destructive"
                  >
                    Delete post
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                    <Flag className="w-4 h-4 mr-2" />
                    Report post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="text-base leading-relaxed mb-4">
            <Mentions text={post.content} />
          </div>

          {post.images?.length > 0 && (
            <>
              <div className="mb-4 rounded-lg overflow-hidden h-[300px] relative">
                <img
                  src={post.images[0].displayUrl}
                  alt="Post"
                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-200"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/75 text-white rounded-full p-0 z-10"
                  onClick={() => setIsImageDialogOpen(true)}
                >
                  <Maximize className="h-4 w-4" color="white" strokeWidth={3} />
                </Button>
              </div>

              <ImageDialog
                isOpen={isImageDialogOpen}
                onClose={() => setIsImageDialogOpen(false)}
                imageUrl={post.images[0].url}
              />
            </>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(post._id)}
                className={`hover:text-primary ${post.isLiked ? 'text-primary' : ''}`}
              >
                <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                {post.likes?.length || 0}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(showComments === post._id ? null : post._id)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {post.comments?.length || 0}
              </Button>

              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            <Button variant="ghost" size="sm">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments Section */}
          {showComments === post._id && (
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-4">
                {post.comments?.map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-2 group">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.author?.profileImage?.thumbUrl || defaultAvatar} />
                      <AvatarFallback>{comment.author?.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{comment.author?.username}</p>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                    
                    {/* Add Comment Menu */}
                    {comment.author?._id !== userBasicInfo._id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-100"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedCommentForReport(comment);
                              setShowCommentReportDialog(true);
                            }}
                          >
                            Report comment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button 
                  size="sm" 
                  onClick={() => onComment(post._id)}
                  disabled={isSubmittingComment || !commentText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Report Dialogs */}
          <ReportDialog
            isOpen={showReportDialog}
            onClose={() => setShowReportDialog(false)}
            targetType="post"
            targetId={post._id}
            targetUser={post.author}
          />

          <ReportDialog
            isOpen={showCommentReportDialog}
            onClose={() => {
              setShowCommentReportDialog(false);
              setSelectedCommentForReport(null);
            }}
            targetType="comment"
            targetId={selectedCommentForReport?._id}
            targetUser={selectedCommentForReport?.author}
          />
        </div>
      </Card>
    </motion.div>
  )
}

export default Dashboard


