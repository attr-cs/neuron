import DefaultAvatar from '@/components/ui/DefaultAvatar';
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { io } from 'socket.io-client';
import { useRecoilValue } from 'recoil';
import { authState } from '../store/atoms';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Phone, Video, MoreVertical, ArrowLeft, Copy, Check, CheckCheck, X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { useLongPress } from '@uidotdev/usehooks';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import AdminBadge from '@/components/ui/AdminBadge';
import defaultAvatar from '../utils/defaultAvatar';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/contexts/SocketContext';
import { cn } from '@/lib/utils';
import debounce from 'lodash.debounce';
import  OnlineStatus  from '@/components/ui/OnlineStatus';
import { Mentions } from '@/components/ui/Mentions';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

export const MobileContextMenu = ({ isOpen, position, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              zIndex: 51
            }}
            className="bg-gray-800 rounded-lg shadow-lg py-2 min-w-[150px]"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
    <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
    <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
    <Button onClick={resetErrorBoundary}>Try again</Button>
  </div>
);

const MessageBubble = ({ message, isOwn }) => (
  <div className={cn(
    "flex",
    isOwn ? "justify-end" : "justify-start",
    "px-2 sm:px-4"
  )}>
    <div className={cn(
      "message-container relative",
      "max-w-[85%] sm:max-w-[75%] md:max-w-[60%]",
      "p-3 rounded-2xl",
      "shadow-sm hover:shadow-md transition-shadow",
      isOwn 
        ? "bg-blue-600 text-white rounded-tr-sm ml-8 sm:ml-12" 
        : "bg-gray-100 text-gray-900 rounded-tl-sm mr-8 sm:mr-12"
    )}>
      <Mentions text={message.content} />
      <span className={cn(
        "text-[11px] block text-right mt-1",
        isOwn ? "text-white/70" : "text-gray-500"
      )}>
        {format(new Date(message.timestamp), 'HH:mm')}
      </span>
    </div>
  </div>
);

const Chat = ({ recipientId, recipientName, recipientUsername, recipientImage, recipientIsAdmin }) => {
  const { socket, onlineUsers } = useSocket();
  const queryClient = useQueryClient();
  const auth = useRecoilValue(authState);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketError, setSocketError] = useState("");
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [recipientIsTyping, setRecipientIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [lastSeen, setLastSeen] = useState(null);
  const [copyTooltip, setCopyTooltip] = useState('');
  const [copyStatus, setCopyStatus] = useState({});
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const { ref: loadMoreRef, inView } = useInView();
  const MESSAGES_PER_PAGE = 25;
  
  const [reconnecting, setReconnecting] = useState(false);
  const [messageQueue, setMessageQueue] = useState([]);

  // Fetch messages with React Query
  const { data: messagesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['messages', recipientId],
    queryFn: async ({ pageParam = 0 }) => {
      const roomId = [auth.userId, recipientId].sort().join('-');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/chat/messages/${roomId}`,
        {
          params: { page: pageParam, limit: 25 },
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    // Prevent chatting with self
    if (recipientId === auth.userId) {
      navigate('/messages');
      return;
    }
  }, [recipientId, auth.userId, navigate]);
  
  useEffect(() => {
    if (!socket) return;

    const roomId = [auth.userId, recipientId].sort().join('-');
    
    // Join room when component mounts
    socket.emit('join_room', roomId);

    // Listen for typing notifications
    const handleTypingNotify = ({ userId, isTyping }) => {
      if (userId === recipientId) {
        setRecipientIsTyping(isTyping);
        
        // Reset any existing timeout for this user
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    };

    // Listen for new messages
    const handleReceiveMessage = (newMessage) => {
      // Only add the message if it's from someone else
      if (newMessage.sender._id !== auth.userId) {
      queryClient.setQueryData(['messages', recipientId], (old) => {
        if (!old) return { pages: [[newMessage]], pageParams: [0] };
        return {
          ...old,
          pages: [
            [...(old.pages[0] || []), newMessage],
            ...old.pages.slice(1),
          ],
        };
      });
      scrollToBottom();
      }
    };

    socket.on('typing_notify', handleTypingNotify);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('typing_notify', handleTypingNotify);
      socket.off('receive_message', handleReceiveMessage);
      socket.emit('leave_room', roomId);
    };
  }, [socket, recipientId, auth.userId, queryClient]);

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const roomId = [auth.userId, recipientId].sort().join('-');
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/chat/messages/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
          }
        );
        if (isMounted) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (isMounted) {
          setError(error.response?.data?.message || 'Failed to fetch messages');
        }
      }
    };

    if (auth.userId && recipientId && auth.token) {
      fetchMessages();
    }

    return () => {
      isMounted = false;
    };
  }, [auth.userId, recipientId, auth.token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesData]);

  // Send message function
  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    const roomId = [auth.userId, recipientId].sort().join('-');
    const messageContent = message.trim();
    
    // Clear input immediately for better UX
    setMessage('');
    
    // Clear typing state
    if (isTyping) {
      setIsTyping(false);
      socket.emit('typing_end', { roomId, userId: auth.userId });
    }

    try {
      // Create optimistic message with temporary ID
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        content: messageContent,
        sender: { _id: auth.userId },
        timestamp: new Date().toISOString(),
        roomId
      };
      
      // Update UI optimistically
      queryClient.setQueryData(['messages', recipientId], (old) => {
        if (!old) return { pages: [[optimisticMessage]], pageParams: [0] };
        return {
          ...old,
          pages: [
            [...(old.pages[0] || []), optimisticMessage],
            ...old.pages.slice(1),
          ],
        };
      });

      // Emit message
      socket.emit('send_message', {
        roomId,
        content: messageContent,
        sender: auth.userId
      });
    } catch (error) {
      console.error('Error sending message:', error);
      queryClient.invalidateQueries(['messages', recipientId]);
    }
  }, [message, socket, auth.userId, recipientId, isTyping, queryClient]);

  const onEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
  };

  useEffect(() => {
    setIsRecipientOnline(onlineUsers.has(recipientId));
  }, [onlineUsers, recipientId]);

  const handleBack = () => {
    navigate(`/profile/${recipientUsername}`);
  };

  const handleTyping = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    if (!socket) return;
    
    const roomId = [auth.userId, recipientId].sort().join('-');
    
    // Always emit typing_start when there's content
    if (newMessage.length > 0) {
        setIsTyping(true);
        socket.emit('typing_start', {
          roomId,
          userId: auth.userId
        });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing_end', {
          roomId,
          userId: auth.userId
        });
      }, 1000);
    } else {
      // If message is empty, stop typing immediately
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
        setIsTyping(false);
        socket.emit('typing_end', {
          roomId,
          userId: auth.userId
        });
    }
  };

  // Typing notification listener
  useEffect(() => {
    if (!socket) return;

    const handleTypingNotify = ({ userId, isTyping }) => {
      if (userId === recipientId) {
        setRecipientIsTyping(isTyping);
      }
    };

    socket.on('typing_notify', handleTypingNotify);

    // Cleanup
    return () => {
      socket.off('typing_notify', handleTypingNotify);
    };
  }, [socket, recipientId, auth.userId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window);
    };
    checkMobile();
  }, []);

  const longPressConfig = useLongPress((e) => {
    e.preventDefault();
    const target = e.target.closest('.message-container');
    if (target) {
      const rect = target.getBoundingClientRect();
      setContextMenuPosition({
        x: rect.left,
        y: rect.top
      });
      setShowContextMenu(true);
    }
  }, {
    threshold: 500,
    cancelOnMovement: true
  });

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setSelectedMessageId(msg._id);
    setContextMenuPosition({
      x: e.clientX,
      y: e.clientY
    });
    setShowContextMenu(true);
  };

  // Load more messages when scrolling up
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Flatten messages from all pages
  const allMessages = useMemo(() => {
    return messagesData?.pages.flatMap(page => page) ?? [];
  }, [messagesData]);

  const renderMessage = (msg, index) => (
    <MessageBubble
      key={msg._id || index}
      message={msg}
      isOwn={msg.sender._id === auth.userId}
    />
  );

  const ContextMenu = () => (
    <AnimatePresence>
      {showContextMenu && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50"
            onClick={() => setShowContextMenu(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'fixed',
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
              zIndex: 51
            }}
            className="bg-gray-800 rounded-lg shadow-lg py-2 min-w-[150px]"
          >
            <button
              onClick={() => {
                const message = messages.find(m => m._id === selectedMessageId);
                if (message) handleCopyMessage(message.content);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Add this custom CSS to your index.css or a separate styles file
  const customScrollbarStyles = `
    .messages-container::-webkit-scrollbar {
      width: 5px;
    }
    
    .messages-container::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .messages-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    
    .messages-container::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `;

  const DateSeparator = ({ date }) => (
    <div className="flex items-center justify-center my-4">
      <div className="bg-[#2A2A2A] text-gray-400 text-xs px-4 py-1 rounded-full">
        {formatMessageDate(date)}
      </div>
    </div>
  );

  // Add this utility function
  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Add connection status monitoring
  useEffect(() => {
    if (!socket) return;

    const handleReconnect = () => {
      setReconnecting(true);
      // Refetch messages and user status
      queryClient.invalidateQueries(['messages', recipientId]);
    };

    const handleReconnected = () => {
      setReconnecting(false);
      setError(null);
    };

    const handleError = (err) => {
      setError('Connection lost. Trying to reconnect...');
      setReconnecting(true);
    };

    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_error', handleError);
    socket.on('connect', handleReconnected);

    return () => {
      socket.off('reconnect', handleReconnect);
      socket.off('reconnect_error', handleError);
      socket.off('connect', handleReconnected);
    };
  }, [socket, recipientId, queryClient]);

  // Add message debouncing for better performance
  const debouncedSendMessage = useMemo(
    () => (async (message) => {
      try {
        const roomId = [auth.userId, recipientId].sort().join('-');
        await socketService.emitMessage(socket, {
          roomId,
          message,
          sender: auth.userId
        });
      } catch (error) {
        setError('Failed to send message');
      }
    }, 300),
    [socket, auth.userId, recipientId]
  );

  // Add message batching for better performance
  useEffect(() => {
    if (messageQueue.length === 0) return;

    const batchSize = 10;
    const processBatch = async () => {
      const batch = messageQueue.slice(0, batchSize);
      try {
        await Promise.all(
          batch.map(msg => 
            socketService.emitMessage(socket, {
              roomId: msg.roomId,
              message: msg.content,
              sender: auth.userId
            })
          )
        );
        setMessageQueue(prev => prev.slice(batchSize));
      } catch (error) {
        setError('Failed to send messages');
      }
    };

    const timeoutId = setTimeout(processBatch, 100);
    return () => clearTimeout(timeoutId);
  }, [messageQueue, socket, auth.userId]);

  // Optimize typing indicator with debounce
  const debouncedTypingHandler = useMemo(
    () => debounce((e) => {
      const newMessage = e.target.value;
    if (!socket) return;

    const roomId = [auth.userId, recipientId].sort().join('-');

      if (newMessage.trim()) {
        if (!isTyping) {
          setIsTyping(true);
          socket.emit('typing_start', { roomId, userId: auth.userId });
        }
      } else {
        setIsTyping(false);
        socket.emit('typing_end', { roomId, userId: auth.userId });
      }
    }, 300),
    [socket, auth.userId, recipientId, isTyping]
  );

  // Optimize message container with virtualization for better performance
  const MessageContainer = useMemo(() => {
    return (
      <div 
        ref={chatContainerRef}
        className={cn(
          "messages-container flex-1 overflow-y-auto px-2 py-4 space-y-4",
          "bg-white scroll-smooth",
          "pb-24"
        )}
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        <div ref={loadMoreRef} className="h-px" />
        
        {allMessages.map((msg, index) => {
          const messageDate = new Date(msg.timestamp).toDateString();
          const prevMessageDate = index > 0 ? new Date(allMessages[index - 1].timestamp).toDateString() : null;

  return (
            <React.Fragment key={msg._id || `temp-${index}`}>
              {messageDate !== prevMessageDate && (
                <DateSeparator date={msg.timestamp} />
              )}
              <MessageBubble
                message={msg}
                isOwn={msg.sender._id === auth.userId}
              />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  }, [allMessages, isFetchingNextPage, auth.userId]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className={cn(
        "fixed inset-0 z-10 flex flex-col",
        "bg-white" // Light mode background
      )}>
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "p-4 border-b fixed top-0 left-0 right-0 z-20",
            "bg-white shadow-sm backdrop-blur-md",
            "border-gray-100"
          )}
        >
          <div className="flex items-center justify-between max-w-screen-xl mx-auto">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className={cn(
                  "p-2 rounded-full",
                  "hover:bg-accent",
                  "text-foreground",
                  "transition-colors"
                )}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className={cn(
                    "w-10 h-10",
                    "ring-2 ring-border ring-offset-2 ring-offset-background"
                  )}>
                   {recipientImage ? (
  <img 
    src={recipientImage} 
    alt={recipientName} 
                        className="object-cover rounded-full hover:opacity-90 transition-opacity cursor-pointer" 
    referrerPolicy="no-referrer"
    onClick={() => navigate(`/profile/${recipientUsername}`)}
    onError={(e) => {
      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(recipientName)}&background=random`;
    }}
  />
) : (
                      <DefaultAvatar 
                        onClick={() => navigate(`/profile/${recipientUsername}`)} 
                        className="w-10 h-10 rounded-full object-cover cursor-pointer" 
                      />
)}
                  </Avatar>
                  {onlineUsers.has(recipientId) && (
                    <OnlineStatus userId={recipientId} className="bottom-0 right-0" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <span className="truncate max-w-[200px]">
                      {recipientName}
                    </span>
                    {recipientIsAdmin && <AdminBadge />}
                  </h2>
                  <div className="text-xs text-muted-foreground">
                    {onlineUsers.has(recipientId) ? 'Active now' : 'Offline'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HeaderIconButton 
                icon={<Phone className="w-5 h-5" />}
                className=""
              />
              <HeaderIconButton 
                icon={<Video className="w-5 h-5" />}
                className=""
              />
              <HeaderIconButton 
                icon={<MoreVertical className="w-5 h-5" />}
                className=""
              />
            </div>
          </div>
        </motion.div>

        {/* Messages Container */}
        <div 
  ref={chatContainerRef}
          className={cn(
            "messages-container flex-1 overflow-y-auto px-2 py-4 space-y-4",
            "bg-white scroll-smooth",
            "pb-24"
          )}
        >
            {isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
            
            <div ref={loadMoreRef} className="h-px" />
            
          {allMessages.map((msg, index) => {
              const messageDate = new Date(msg.timestamp).toDateString();
                const prevMessageDate = index > 0 ? new Date(allMessages[index - 1].timestamp).toDateString() : null;

            return (
              <React.Fragment key={msg._id || `temp-${index}`}>
                {messageDate !== prevMessageDate && (
                  <DateSeparator date={msg.timestamp} />
                )}
                <MessageBubble
                  message={msg}
                  isOwn={msg.sender._id === auth.userId}
                />
              </React.Fragment>
              );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {recipientIsTyping && (
          <div className="absolute bottom-24 left-0 right-0 flex justify-center">
            <div className={cn(
              "rounded-full px-4 py-2 text-sm",
              "bg-gray-100 text-gray-700",
              "shadow-sm",
              "flex items-center gap-2"
            )}>
              <div className="flex gap-1">
                <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity}}
                  className="w-1 h-1 bg-gray-500 rounded-full"
                />
                <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity}}
                  className="w-1 h-1 bg-gray-500 rounded-full"
                />
                <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity}}
                  className="w-1 h-1 bg-gray-500 rounded-full"
                />
              </div>
            </div>
          </div>
        )}    

        {/* Input Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={sendMessage}
          className={cn(
            "p-3 fixed bottom-0 left-0 right-0",
            "bg-background/90 backdrop-blur-md",
            "border-t border-border"
          )}
        >
          <div className="flex items-end space-x-2 max-w-screen-xl mx-auto">
            <div className="relative flex-grow flex items-center">
            <input
              type="text"
              value={message}
                onChange={handleTyping}
              placeholder="Type your message..."
                className={cn(
                  "w-full p-2.5 pr-12 rounded-full",
                  "border border-gray-200",
                  "bg-white",
                  "text-gray-900",
                  "placeholder:text-gray-400",
                  "focus:outline-none focus:border-blue-500",
                  "transition-none"
                )}
                autoComplete="off"
                spellCheck="false"
                autoCorrect="off"
                autoCapitalize="off"
                maxLength={5000}
              />
              {message && (
                <button
                  type="button"
                  onClick={() => setMessage('')}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2",
                    "p-1.5 rounded-full",
                    "hover:bg-accent",
                    "text-muted-foreground",
                    "transition-colors"
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div ref={emojiPickerRef} className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn(
                  "p-2.5 rounded-full",
                  "bg-white",
                  "border border-gray-200",
                  "hover:bg-gray-50",
                  "text-gray-700",
                  "transition-colors"
                )}
              >
                <Smile className="w-5 h-5" />
              </motion.button>
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-14 right-0 z-50"
                  >
                    <div className={cn(
                      "shadow-xl rounded-lg overflow-hidden",
                      "border border-border"
                    )}>
                      <EmojiPicker 
                        theme="light"
                        lazyLoadEmojis={true}
                        onEmojiClick={onEmojiClick}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              className={cn(
                "p-2.5 rounded-full",
                "bg-blue-600 hover:bg-blue-700",
                "text-white",
                "transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:ring-2 focus:ring-blue-500/20"
              )}
              disabled={!message.trim()}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.form>
          </div>
    </ErrorBoundary>
  );
};

// New component for header icons
const HeaderIconButton = ({ icon }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="p-2 rounded-full hover:bg-[#2A2A2A] hover:text-white text-slate-800 "
  >
    {React.cloneElement(icon, { className: "w-5 h-5     " })}
  </motion.button>
);

export default memo(Chat);
