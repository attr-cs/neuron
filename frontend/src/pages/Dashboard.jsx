

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import EmojiPicker from 'emoji-picker-react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MessageSquare, Heart, Share2, Camera, Image as ImageIcon, MapPin, Smile, Settings, LogOut, ThumbsUp, ThumbsDown, Bookmark, Send, X, Moon, Sun, MoreVertical } from 'lucide-react'

const fakePosts = [
  {
    id: 1,
    user: { name: 'George Lollio', avatar: 'https://i.pravatar.cc/150?img=1' },
    content: 'Hi everyone, today I was on the most beautiful mountain in the world 🌎, I also want to say hi to 👋 Silento, 👋 Diva and 👋 David!',
    images: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba',
      'https://images.unsplash.com/photo-1475066392170-59d55d96fe51',
      'https://images.unsplash.com/photo-1542224566-6e85f2e6772f'
    ],
    likes: 1325,
    dislikes: 12,
    comments: [
      { id: 1, user: 'Alex', content: 'Amazing view!', likes: 5, replies: [] },
      { id: 2, user: 'Sarah', content: 'I wish I was there!', likes: 3, replies: [
        { id: 3, user: 'George Lollio', content: 'You should come next time!', likes: 2 }
      ]}
    ],
    saved: false
  },
  {
    id: 2,
    user: { name: 'Vitaly Tayko', avatar: 'https://i.pravatar.cc/150?img=2' },
    content: 'I chose a wonderful coffee today, I wanted to tell you what product they have in stock - it\'s a latte with coconut 🥥 milk... delicious... it\'s really incredibly tasty!!! 😋',
    likes: 655,
    dislikes: 5,
    comments: [
      { id: 4, user: 'Coffee Lover', content: 'Sounds delicious! Which cafe?', likes: 8, replies: [] }
    ],
    saved: true
  },
  {
    id: 3,
    user: { name: 'Emma Watson', avatar: 'https://i.pravatar.cc/150?img=3' },
    content: 'Just finished reading an amazing book! What are your favorite reads?',
    likes: 892,
    dislikes: 3,
    comments: [
      { id: 5, user: 'Bookworm', content: 'What book was it?', likes: 12, replies: [] },
      { id: 6, user: 'Literature Fan', content: 'I love "To Kill a Mockingbird"!', likes: 7, replies: [] }
    ],
    saved: false
  },
  {
    id: 4,
    user: { name: 'Chris Hemsworth', avatar: 'https://i.pravatar.cc/150?img=4' },
    content: 'Poll time! What\'s your favorite superhero movie?',
    poll: {
      question: 'What\'s your favorite superhero movie?',
      options: [
        { id: 1, text: 'The Dark Knight', votes: 150 },
        { id: 2, text: 'Avengers: Endgame', votes: 120 },
        { id: 3, text: 'Spider-Man: Into the Spider-Verse', votes: 80 },
        { id: 4, text: 'Wonder Woman', votes: 70 }
      ],
      totalVotes: 420,
      userVote: null
    },
    likes: 1203,
    dislikes: 8,
    comments: [
      { id: 7, user: 'Marvel Fan', content: 'Endgame all the way!', likes: 15, replies: [] },
      { id: 8, user: 'DC Enthusiast', content: 'The Dark Knight is a masterpiece', likes: 10, replies: [] }
    ],
    saved: false
  }
]

const fakeStories = [
  { id: 1, user: 'Alex M.', image: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e' },
  { id: 2, user: 'Lena K.', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963' },
  { id: 3, user: 'Mike R.', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d' },
  { id: 4, user: 'Sarah L.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' },
  { id: 5, user: 'Tom H.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
  { id: 6, user: 'Emily W.', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9' },
  { id: 7, user: 'David B.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },
  { id: 8, user: 'Sophie T.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' }
]

const fakeSuggestions = [
  { id: 1, name: 'Nick Shelburne', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 2, name: 'Brittni Lenzo', avatar: 'https://i.pravatar.cc/150?img=6' },
  { id: 3, name: 'Ivan Shevchenko', avatar: 'https://i.pravatar.cc/150?img=7' },
  { id: 4, name: 'Olivia Martinez', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: 5, name: 'Ethan Thompson', avatar: 'https://i.pravatar.cc/150?img=9' }
]

const fakeRecommendations = [
  { id: 1, name: 'UI/UX', icon: '🎨' },
  { id: 2, name: 'Music', icon: '🎵' },
  { id: 3, name: 'Cooking', icon: '🍳' },
  { id: 4, name: 'Hiking', icon: '🏔️' },
  { id: 5, name: 'Photography', icon: '📷' },
  { id: 6, name: 'Gaming', icon: '🎮' }
]

export default function Component() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [newPostContent, setNewPostContent] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', () => setWindowSize({ width: window.innerWidth, height: window.innerHeight }))
    return () => window.removeEventListener('resize', () => setWindowSize({ width: window.innerWidth, height: window.innerHeight }))
  }, [])

  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setPosts(fakePosts)
      setLoading(false)
    }, 2000)
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleNewPost = () => {
    if (newPostContent.trim() || selectedImage) {
      const newPost = {
        id: posts.length + 1,
        user: { name: 'Bogdan Nikhin', avatar: 'https://i.pravatar.cc/150?img=10' },
        content: newPostContent,
        images: selectedImage ? [URL.createObjectURL(selectedImage)] : [],
        likes: 0,
        dislikes: 0,
        comments: [],
        saved: false
      }
      setPosts([newPost, ...posts])
      setNewPostContent('')
      setSelectedImage(null)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }

  const handleEmojiClick = (emojiObject) => {
    setNewPostContent(prevContent => prevContent + emojiObject.emoji)
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1, dislikes: post.dislikes > 0 ? post.dislikes - 1 : 0 } : post
    ))
  }

  const handleDislike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, dislikes: post.dislikes + 1, likes: post.likes > 0 ? post.likes - 1 : 0 } : post
    ))
  }

  const handleSave = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, saved: !post.saved } : post
    ))
  }

  const handlePollVote = (postId, optionId) => {
    setPosts(posts.map(post => {
      if (post.id === postId && post.poll && post.poll.userVote === null) {
        const updatedOptions = post.poll.options.map(option => 
          option.id === optionId ? { ...option, votes: option.votes + 1 } : option
        )
        return {
          ...post,
          poll: {
            ...post.poll,
            options: updatedOptions,
            totalVotes: post.poll.totalVotes + 1,
            userVote: optionId
          }
        }
      }
      return post
    }))
  }

  const handleCommentLike = (postId, commentId, replyId = null) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const updatedComments = post.comments.map(comment => {
          if (replyId === null && comment.id === commentId) {
            return { ...comment, likes: comment.likes + 1 }
          } else if (comment.id === commentId) {
            const updatedReplies = comment.replies.map(reply => 
              reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply
            )
            return { ...comment, replies: updatedReplies }
          }
          return comment
        })
        return { ...post, comments: updatedComments }
      }
      return post
    }))
  }

  const handleAddComment = (postId, content, parentCommentId = null) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        if (parentCommentId === null) {
          const newComment = {
            id: Math.max(...post.comments.map(c => c.id), 0) + 1,
            user: 'Bogdan Nikhin',
            content,
            likes: 0,
            replies: []
          }
          return { ...post, comments: [newComment, ...post.comments] }
        } else {
          const updatedComments = post.comments.map(comment => {
            if (comment.id === parentCommentId) {
              const newReply = {
                id: Math.max(...comment.replies.map(r => r.id), 0) + 1,
                user: 'Bogdan Nikhin',
                content,
                likes: 0
              }
              return { ...comment, replies: [...comment.replies, newReply] }
            }
            return comment
          })
          return { ...post, comments: updatedComments }
        }
      }
      return post
    }))
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} p-4 md:p-6 lg:p-8 transition-colors duration-300`}>
      {showConfetti && <ReactConfetti width={windowSize.width} height={windowSize.height} />}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <Card className={`col-span-1 md:col-span-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src="https://i.pravatar.cc/150?img=10" alt="Bogdan Nikhin" />
                <AvatarFallback>BN</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">Bogdan Nikhin</h2>
              <p className="text-sm text-gray-500">@designdevbro</p>
            </div>
            <nav className="mt-8 hidden md:block">
              <ul className="space-y-2">
                <li>
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    News Feed
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className="w-full justify-start">
                    <Share2 className="mr-2 h-4 w-4" />
                    Forums
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className="w-full justify-start text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </li>
              </ul>
            </nav>
            <div className="mt-8 flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className={`col-span-1 md:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle>Feeds</CardTitle>
            <Tabs defaultValue="recent" className="w-full">
              <TabsList>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="friends">Friends</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Card className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Share something..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex justify-between mt-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => document.getElementById('image-upload').click()}>
                        <ImageIcon className="h-4 w-4" />
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </Button>
                      <Button variant="outline" size="icon">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleNewPost}>Post</Button>
                  </div>
                  {showEmojiPicker && (
                    <div className="mt-2">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                  {selectedImage && (
                    <div className="mt-2">
                      <img src={URL.createObjectURL(selectedImage)} alt="Selected" className="max-h-40 rounded" />
                    </div>
                  )}
                </CardContent>
              </Card>
              <AnimatePresence>
                {loading ? (
                  <PostSkeleton />
                ) : (
                  posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className={darkMode ? 'bg-gray-700' : 'bg-white'}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4 mb-4">
                            <Avatar>
                              <AvatarImage src={post.user.avatar} alt={post.user.name} />
                              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{post.user.name}</h3>
                              <p className="text-sm text-gray-500">2 hours ago</p>
                            </div>
                          </div>
                          <p>{post.content}</p>
                          {post.images && (
                            <div className="grid grid-cols-3 gap-2 mt-4">
                              {post.images.map((image, index) => (
                                <Dialog key={index}>
                                  <DialogTrigger>
                                    <img src={image} alt={`Post image ${index + 1}`} className="rounded-md cursor-pointer" />
                                  </DialogTrigger>
                                  <DialogContent className="max-w-3xl">
                                    <img src={image} alt={`Post image ${index + 1}`} className="w-full h-auto" />
                                  </DialogContent>
                                </Dialog>
                              ))}
                            </div>
                          )}
                          {post.poll && (
                            <div className="mt-4">
                              <h4 className="font-semibold mb-2">{post.poll.question}</h4>
                              {post.poll.options.map((option) => (
                                <Button
                                  key={option.id}
                                  variant="outline"
                                  className={`w-full mb-2 justify-between ${
                                    post.poll.userVote === option.id ? 'bg-blue-500 text-white' : ''
                                  }`}
                                  onClick={() => handlePollVote(post.id, option.id)}
                                  disabled={post.poll.userVote !== null}
                                >
                                  <span>{option.text}</span>
                                  <span>{Math.round((option.votes / post.poll.totalVotes) * 100)}%</span>
                                </Button>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between mt-4">
                            <motion.div whileTap={{ scale: 0.9 }}>
                              <Button variant="ghost" onClick={() => handleLike(post.id)}>
                                <ThumbsUp className={`mr-2 h-4 w-4 ${post.likes > 0 ? 'text-blue-500' : ''}`} />
                                {post.likes}
                              </Button>
                            </motion.div>
                            <motion.div whileTap={{ scale: 0.9 }}>
                              <Button variant="ghost" onClick={() => handleDislike(post.id)}>
                                <ThumbsDown className={`mr-2 h-4 w-4 ${post.dislikes > 0 ? 'text-red-500' : ''}`} />
                                {post.dislikes}
                              </Button>
                            </motion.div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost">
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  {post.comments.length}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                
                                <div className="flex items-center mt-4">
                                  <Input placeholder="Add a comment..." className="flex-grow mr-2" />
                                  <Button size="icon" onClick={() => handleAddComment(post.id, 'New comment')}>
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost">
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </Button>
                            <Button variant="ghost" onClick={() => handleSave(post.id)}>
                              <Bookmark className={`mr-2 h-4 w-4 ${post.saved ? 'fill-current' : ''}`} />
                              {post.saved ? 'Saved' : 'Save'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <Card className={`col-span-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Stories</h3>
            <ScrollArea className="h-40 w-full whitespace-nowrap rounded-md border">
              <div className="flex w-max space-x-4 p-4">
                {fakeStories.map((story) => (
                  <div key={story.id} className="flex-shrink-0">
                    <Avatar className="w-20 h-20 rounded-full">
                      <AvatarImage src={story.image} alt={story.user} className="object-cover" />
                      <AvatarFallback>{story.user[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-center mt-1">{story.user}</p>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <h3 className="font-semibold mt-8 mb-4">Suggestions</h3>
            <div className="space-y-4">
              {fakeSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
                      <AvatarFallback>{suggestion.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{suggestion.name}</span>
                  </div>
                  <Button variant="outline" size="sm">Follow</Button>
                </div>
              ))}
            </div>

            <h3 className="font-semibold mt-8 mb-4">Recommendations</h3>
            <div className="grid grid-cols-2 gap-4">
              {fakeRecommendations.map((rec) => (
                <Button key={rec.id} variant="outline" className="h-20">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-2">{rec.icon}</span>
                    <span>{rec.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PostSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between mt-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}