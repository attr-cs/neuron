import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { authState, userBasicInfoState } from '../store/atoms';
import PostCard from '@/components/PostCard';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const auth = useRecoilValue(authState);
  const userBasicInfo = useRecoilValue(userBasicInfoState);
  const [showComments, setShowComments] = React.useState(postId);
  const [commentText, setCommentText] = React.useState('');
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);

  // Validate postId format
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(postId);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!isValidObjectId) {
        throw new Error('Invalid post ID format');
      }
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/post/${postId}/single`,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data;
    },
    retry: false // Don't retry if the ID is invalid
  });

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/post/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      queryClient.invalidateQueries(['post', postId]);
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to like post",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/post/${postId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  const handleComment = async (postId) => {
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
      queryClient.invalidateQueries(['post', postId]);
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

  if (!isValidObjectId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-destructive">Invalid post ID</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-destructive">
          {error.response?.data?.message || "Error loading post"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {post && (
        <PostCard
          post={post}
          userBasicInfo={userBasicInfo}
          onLike={handleLike}
          onDelete={handleDelete}
          onComment={handleComment}
          showComments={showComments}
          setShowComments={setShowComments}
          commentText={commentText}
          setCommentText={setCommentText}
          isSubmittingComment={isSubmittingComment}
        />
      )}
    </div>
  );
};

export default PostPage; 