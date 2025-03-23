import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageSquare, Heart, Share2, Bookmark, Send, MoreVertical, Loader2, Maximize, Flag } from 'lucide-react';
import defaultAvatar from "../utils/defaultAvatar";
import { Mentions } from '@/components/ui/Mentions';
import { ReportDialog } from '@/components/ui/ReportDialog';
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { authState } from '../store/atoms'
import { useRecoilValue } from 'recoil';
import EmojiPicker from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import ShareButton from './ShareButton';

// ImageDialog Component
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

const PostCard = ({ 
  post, 
  userBasicInfo, 
  onLike, 
  onDelete, 
  onComment,
  showComments, 
  setShowComments, 
  commentText, 
  setCommentText, 
  isSubmittingComment 
}) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const auth = useRecoilValue(authState);
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const commentInputRef = useRef(null);

  const handleLikeClick = (postId) => {
    if (isLiking) return;
    onLike(postId);
  };

  // Add this query for comments
  const { 
    data: comments, 
    isLoading: isLoadingComments,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['comments', post._id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/post/${post._id}/comments`,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data;
    },
    enabled: showComments === post._id, // Only fetch when comments are shown
  });

  // Add emoji handler
  const onEmojiClick = (emojiObject) => {
    const input = commentInputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const newText = commentText.slice(0, start) + emojiObject.emoji + commentText.slice(end);
      setCommentText(newText);
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = start + emojiObject.emoji.length;
        input.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  // Add this to handle new comment addition
  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;
    
    // Create a temporary comment object for optimistic update
    const newComment = {
      _id: Date.now(), // temporary ID
      content: commentText,
      author: userBasicInfo,
      createdAt: new Date().toISOString(),
      isOptimistic: true // flag to identify optimistic updates
    };

    // Add comment to the beginning of the list
    setComments(prev => [newComment, ...prev]);
    
    // Update comment count optimistically
    post.commentsCount = (post.commentsCount || 0) + 1;

    // Clear input
    setCommentText('');

    // Call the actual comment submission
    await onComment(postId);
  };

  return (
    <motion.div
      variants={itemVariants}
      className="group"
    >
      <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
        <div className="p-6">
          {/* Author Info */}
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

            {/* Delete Option */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm" 
                    className="h-8 w-8 p-0"
                  >
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

          {/* Post Content */}
          <div className="mt-3">
            <Mentions text={post.content} />
          </div>

          {/* Post Image */}
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
                  <Maximize className="h-3 w-3" color="white" strokeWidth={3} />
                </Button>
              </div>

              <ImageDialog
                isOpen={isImageDialogOpen}
                onClose={() => setIsImageDialogOpen(false)}
                imageUrl={post.images[0].url}
              />
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLikeClick(post._id)}
                disabled={post.author?._id === userBasicInfo._id || isLiking}
                className={cn(
                  "flex items-center gap-2 text-sm transition-all duration-200",
                  "hover:text-primary disabled:hover:text-muted-foreground",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  post.isLiked ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Heart 
                  className={cn(
                    "w-4 h-4 transition-all duration-200",
                    post.isLiked ? "fill-current scale-110" : "scale-100",
                    "transform hover:scale-125"
                  )} 
                />
                <span className="font-medium">
                  {Array.isArray(post.likes) ? post.likes.length : 0}
                </span>
              </button>

              <button
                onClick={() => setShowComments(showComments === post._id ? null : post._id)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <MessageSquare className="w-4 h-4 " />
                <span className="font-medium">
                  {post.commentsCount || 0}
                </span>
              </button>

              <ShareButton post={post} />
            </div>

            <Button variant="ghost" size="sm">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments Section */}
          {showComments === post._id && (
            <div className="mt-4 pt-4 border-t">
              {/* Comment Input */}
              <div className="flex items-end gap-2 mb-3">
                <div className="relative flex-1">
                  <textarea
                    ref={commentInputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[36px] max-h-[100px] w-full rounded-2xl px-4 py-2 pr-12 resize-none
                             bg-muted/50 border-0 focus:ring-0 focus:outline-none
                             placeholder:text-muted-foreground text-sm whitespace-pre-line"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCommentSubmit(post._id);
                      }
                    }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full hover:bg-muted"
                        >
                          <Smile className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0 border-none" 
                        side="top" 
                        align="end"
                      >
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          width={320}
                          height={400}
                          searchDisabled={false}
                          skinTonesDisabled
                          previewConfig={{
                            showPreview: false
                          }}
                          lazyLoadEmojis
                        />
                      </PopoverContent>
                    </Popover>
                <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary"
                  disabled={!commentText.trim() || isSubmittingComment}
                      onClick={() => onComment(post._id)}
                >
                  {isSubmittingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : comments?.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment._id}
                      initial={comment.isOptimistic ? { opacity: 0, y: -10 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group flex items-start gap-2 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    >
                      <Link to={`/profile/${comment.author?.username}`}>
                        <Avatar className="h-7 w-7 ring-1 ring-primary/10">
                          <AvatarImage 
                            src={comment.author?.profileImage?.thumbUrl || defaultAvatar} 
                            alt={comment.author?.username}
                          />
                          <AvatarFallback>
                            {comment.author?.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                  </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link 
                            to={`/profile/${comment.author?.username}`}
                            className="font-medium text-sm hover:underline"
                          >
                            {comment.author?.username}
                          </Link>
                          <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), 'MMM d')}
                    </span>
                  </div>
                        <p className="text-sm break-words leading-snug">
                          <Mentions text={comment.content} />
                        </p>
                </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {comment.author?._id === userBasicInfo._id ? (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => onDeleteComment(comment._id)}
                            >
                              Delete comment
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => onReportComment(comment._id)}>
                              Report comment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground bg-muted/50 rounded-lg text-sm">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          )}

          {/* Add Report Dialog */}
          <ReportDialog
            isOpen={showReportDialog}
            onClose={() => setShowReportDialog(false)}
            targetType="post"
            targetId={post._id}
            targetUser={post.author._id}
          />
        </div>
      </Card>
    </motion.div>
  );
};

export default PostCard;