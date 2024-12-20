import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useRecoilValue } from 'recoil';
import { authState } from '../store/atoms';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Phone, Video, MoreVertical, ArrowLeft, Copy } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useLongPress } from '@uidotdev/usehooks';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import AdminBadge from '@/components/ui/AdminBadge';
import DefaultAvatar from '@/components/ui/DefaultAvatar';


const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

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

const Chat = ({ recipientId, recipientName, recipientUsername, recipientImage, recipientIsAdmin }) => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = useRecoilValue(authState);
  const messagesEndRef = useRef(null);
  const [socketError, setSocketError] = useState("");
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
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
  const [debouncedMessage, setDebouncedMessage] = useState('');

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const emitTypingStatus = debounce((isTyping) => {
    if (!socket) return;
    const roomId = [auth.userId, recipientId].sort().join('-');
    socket.emit(isTyping ? 'typing_start' : 'typing_end', {
      roomId,
      userId: auth.userId
    });
  }, 300);

  useEffect(() => {
    // Prevent chatting with self
    if (recipientId === auth.userId) {
      navigate('/messages');
      return;
    }
  }, [recipientId, auth.userId, navigate]);
  
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL.replace('/api', ''), {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      withCredentials: true
    });
    
    newSocket.on('connect_error', (error) => {
      setSocketError("Failed to connect to chat server");
      console.error('Socket connection error:', error);
    });

    newSocket.on('connect', () => {
      setSocket(newSocket);
      newSocket.emit('user_connected', auth.userId);
      const roomId = [auth.userId, recipientId].sort().join('-');
      newSocket.emit('join_room', roomId);
    });

    newSocket.on('typing_notify', (data) => {
      if (data.userId === recipientId) {
        setRecipientIsTyping(data.isTyping);
      }
    });

    newSocket.on('receive_message', (message) => {
      if (message.sender._id !== auth.userId) {
        setMessages(prev => [...prev, message]);
      }
    });

    newSocket.on('online_users_list', (users) => {
      setOnlineUsers(new Set(users));
    });

    newSocket.on('user_status_change', ({ userId, status }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status === 'online') {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    if (newSocket.connected) {
      newSocket.emit('get_user_status', recipientId);
    }

    setLoading(false);
   
    return () => {
      if (newSocket) {
        newSocket.off('typing_notify');
        newSocket.disconnect();
      }
    };
  }, [auth.userId, recipientId]);

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
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    const roomId = [auth.userId, recipientId].sort().join('-');
    
    try {
      const newMessage = {
        sender: { _id: auth.userId },
        content: message,
        timestamp: new Date(),
        roomId
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage("");

      socket.emit('send_message', {
        roomId,
        sender: auth.userId,
        content: message
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

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
    const newValue = e.target.value;
    setMessage(newValue);
    
    if (newValue.length > 0) {
      emitTypingStatus(true);
    } else {
      emitTypingStatus(false);
    }
  };

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

  const renderMessage = (msg, index) => (
    <motion.div
      key={msg._id || index}
      initial="hidden"
      animate="visible"
      variants={messageVariants}
      layout
      className={`flex ${msg.sender._id === auth.userId ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`message-container relative max-w-[80%] md:max-w-[60%] p-3 rounded-2xl ${
          msg.sender._id === auth.userId
            ? 'bg-blue-600 text-white ml-12'
            : 'bg-gray-800 text-white mr-12'
        }`}
        {...(isMobile ? longPressConfig : { onContextMenu: (e) => handleContextMenu(e, msg) })}
      >
        <p className="text-sm md:text-base break-words">{msg.content}</p>
        <span className="text-xs opacity-75 mt-1 block">
          {new Date(msg.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
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

  useEffect(() => {
    return () => {
      emitTypingStatus.cancel && emitTypingStatus.cancel();
    };
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="fixed inset-0 bg-[#0A0A0A] z-10 flex flex-col"
    >
      <style>{customScrollbarStyles}</style>
      <Card className="w-full h-screen max-w-none mx-auto bg-[#111111] overflow-hidden rounded-none flex flex-col pt-16 pb-20">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 border-b border-[#2A2A2A] bg-[#111111]/90 backdrop-blur-md fixed top-0 left-0 right-0 z-20"
        >
          <div className="flex items-center justify-between max-w-screen-xl mx-auto">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-[#2A2A2A] transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 ring-2 ring-[#2A2A2A] ring-offset-2 ring-offset-[#111111]">
                    {recipientImage ? (
                      <img 
                        src={recipientImage} 
                        alt={recipientName} 
                        className="object-cover rounded-full" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(recipientName)}&background=random`;
                        }}
                      />
                    ) : (
                      <DefaultAvatar className="w-10 h-10 rounded-full object-cover cursor-pointer shadow-md ring-1 ring-primary/10 hover:ring-primary/30 transition-all" />
                    )}
                    {/* <img 
                      src={recipientImage} 
                      alt={recipientName} 
                      className="object-cover rounded-full" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(recipientName)}&background=random`;
                      }}
                    /> */}
                  </Avatar>
                  {isRecipientOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111111] bg-emerald-500"></span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-100 flex items-center gap-2">
                    <span className="truncate max-w-[200px]">
                      {recipientName}
                    </span>
                    {recipientIsAdmin && (
                      <AdminBadge className="flex-shrink-0" />
                    )}
                  </h2>
                  <div className="text-xs text-gray-400">
                    {isRecipientOnline ? 'Active now' : 'offline'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HeaderIconButton icon={<Phone />} />
              <HeaderIconButton icon={<Video />} />
              <HeaderIconButton icon={<MoreVertical />} />
            </div>
          </div>
        </motion.div>

        {/* Messages Container */}
        <div 
  ref={chatContainerRef}
  className="messages-container flex-1 overflow-y-auto px-2 py-4 space-y-4 bg-gradient-to-b from-[#111111] to-[#0A0A0A] scroll-smooth"
>
          <AnimatePresence mode="popLayout">
            {messages.reduce((acc, msg, index) => {
              const messageDate = new Date(msg.timestamp).toDateString();
              const prevMessageDate = index > 0 ? new Date(messages[index - 1].timestamp).toDateString() : null;

              if (messageDate !== prevMessageDate) {
                acc.push(
                  <DateSeparator key={`date-${msg.timestamp}`} date={msg.timestamp} />
                );
              }

              acc.push(
                <MessageBubble
                  key={msg._id || index}
                  message={msg}
                  isOwn={msg.sender._id === auth.userId}
                  handleContextMenu={handleContextMenu}
                  isMobile={isMobile}
                  longPressConfig={longPressConfig}
                />
              );

              return acc;
            }, [])}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {recipientIsTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-24 left-0 right-0 flex justify-center"
          >
            <div className="bg-blue-500 text-white  mt-3 px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2">
              <div className="flex gap-1">
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1 h-1 bg-white rounded-full"
                />
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="w-1 h-1 bg-white rounded-full"
                />
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  className="w-1 h-1 bg-white rounded-full"
                />
              </div>
              {/* <span>{recipientName} is typing</span> */}
            </div>
          </motion.div>
        )}    

        {/* Input Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={sendMessage}
          className="p-4 bg-[#111111]/90 backdrop-blur-md border-t border-[#2A2A2A] fixed bottom-0 left-0 right-0"
        >
          <div className="flex items-end space-x-2 max-w-screen-xl mx-auto">
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              placeholder="Type your message..."
              className="flex-grow p-3 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100 text-sm transition-shadow placeholder-gray-500"
            />
            <div ref={emojiPickerRef} className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-3 rounded-full bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-300" />
              </motion.button>
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-14 right-0 z-50"
                  >
                    <div className="shadow-lg rounded-lg overflow-hidden">
                      <EmojiPicker 
                        onEmojiClick={onEmojiClick}
                        theme="dark"
                        lazyLoadEmojis={true}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#111111] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!message.trim()}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.form>
      </Card>
      <ContextMenu />
    </motion.div>
  );
};

// New component for header icons
const HeaderIconButton = ({ icon }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="p-2 rounded-full hover:bg-[#2A2A2A] transition-colors"
  >
    {React.cloneElement(icon, { className: "w-5 h-5 text-gray-300" })}
  </motion.button>
);

// New component for message bubbles
const MessageBubble = ({ message, isOwn, handleContextMenu, isMobile, longPressConfig }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={messageVariants}
    layout
    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
  >
    <div
      className={`message-container relative max-w-[80%] md:max-w-[60%] p-3 rounded-2xl ${
        isOwn
          ? 'bg-blue-600 text-white ml-12 rounded-tr-sm'
          : 'bg-[#2A2A2A] text-gray-100 mr-12 rounded-tl-sm'
      } shadow-lg hover:shadow-xl transition-shadow`}
      {...(isMobile ? longPressConfig : { onContextMenu: (e) => handleContextMenu(e, message) })}
    >
      <p className="text-sm md:text-base break-words">{message.content}</p>
      <span className="text-xs opacity-75 mt-1 block">
        {new Date(message.timestamp).toLocaleTimeString([], { 
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}
      </span>
    </div>
  </motion.div>
);

export default Chat;

