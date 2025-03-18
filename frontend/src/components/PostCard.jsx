import React, { useState } from 'react';
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
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleLikeClick = async (postId) => {
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      await onLike(postId);
    } finally {
      setIsLiking(false);
    }
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
                  "flex items-center gap-2 text-sm transition-colors duration-200",
                  "hover:text-primary disabled:hover:text-muted-foreground",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  post.isLiked ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Heart 
                  className={cn(
                    "w-4 h-4 transition-all duration-200",
                    post.isLiked ? "fill-current scale-110" : "scale-100",
                    isLiking && "animate-pulse"
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
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">
                {post.comments?.length || 0}
                </span>
              </button>

              <button
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <Share2 className="w-4 h-4" />
                <span className="font-medium">Share</span>
              </button>
            </div>

            <Button variant="ghost" size="sm">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments Section */}
          {showComments === post._id && (
            <div className="mt-4">
              <div className="flex gap-2 mb-4">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1"
                />
                <Button
                  size="sm"
                  disabled={!commentText.trim() || isSubmittingComment}
                  onClick={() => onComment(post._id, commentText)}
                >
                  {isSubmittingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {post.comments?.map((comment) => (
                <div key={comment._id} className="flex items-start gap-2 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.profileImage?.thumbUrl || defaultAvatar} />
                    <AvatarFallback>{comment.author?.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm">
                      <Mentions text={comment.content} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
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
