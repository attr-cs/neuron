import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, Eye, Calendar, Plus } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FAKE_POSTS = [
  {
    id: 1,
    text: "Just launched my new portfolio website! Check it out 🚀",
    imageUrl: "https://source.unsplash.com/random/800x600?website",
    likes: 234,
    comments: 42,
    views: 1205,
    dateCreated: "2024-03-20T10:30:00",
    isLiked: false,
    isSaved: false,
  },
  // Add more fake posts...
];

function Post({ post, userData, onLike, onSave }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="p-4 bg-card/50 backdrop-blur-sm">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={userData.profileImageUrl}
              alt="profile"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-foreground text-sm">{userData.firstname} {userData.lastname}</h3>
              <div className="flex items-center text-xs text-muted-foreground space-x-2">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(post.dateCreated), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Content */}
        <div className="space-y-2">
          <p className="text-sm text-foreground">{post.text}</p>
          {post.imageUrl && (
            <motion.img
              whileHover={{ scale: 1.01 }}
              src={post.imageUrl}
              alt="post"
              className="rounded-md w-full object-cover max-h-[400px]"
            />
          )}
        </div>

        {/* Post Stats & Actions */}
        <div className="mt-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{post.views.toLocaleString()} views</span>
              </div>
              
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onLike(post.id)}
                className="flex items-center space-x-1"
              >
                <Heart 
                  className={`h-4 w-4 transition-colors ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                />
                <span className="text-xs">{post.likes}</span>
              </motion.button>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MessageSquare className="h-4 w-4" />{post.comments}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onSave(post.id)}
            >
              <Bookmark 
                className={`h-4 w-4 transition-colors ${post.isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
              />
            </motion.button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function ProfilePosts({ userData }) {
  const [posts, setPosts] = useState(FAKE_POSTS);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
  };

  return (
    <div className="space-y-4">
      <Button className="w-full sm:w-auto" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Create Post
      </Button>

      <AnimatePresence>
        <div className="space-y-3">
          {posts.map(post => (
            <Post 
              key={post.id}
              post={post}
              userData={userData}
              onLike={handleLike}
              onSave={handleSave}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}

export default ProfilePosts;