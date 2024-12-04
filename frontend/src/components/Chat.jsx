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

const Chat = ({ recipientId, recipientName, recipientImage }) => {
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

    newSocket.on('receive_message', (message) => {
      if (message.sender._id !== auth.userId) {
        setMessages(prev => [...prev, message]);
      }
    });

    newSocket.on('online_users_list', (users) => {
      setOnlineUsers(new Set(users));
    });

    newSocket.on('user_status_change', ({ userId, status, lastSeen }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status === 'online') {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        if (status === 'offline' && lastSeen) {
          setLastSeen(new Date(lastSeen));
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
        newSocket.off();
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

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('typing_notify', (data) => {
      if (data.userId === recipientId) {
        setRecipientIsTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('typing_notify');
    };
  }, [socket, recipientId]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!socket) return;
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', {
        roomId: [auth.userId, recipientId].sort().join('-'),
        userId: auth.userId
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_end', {
        roomId: [auth.userId, recipientId].sort().join('-'),
        userId: auth.userId
      });
    }, 1000);
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
            ? 'bg-purple-500 text-white ml-12'
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="fixed inset-0 bg-gray-900 z-10 flex flex-col"
    >
      <Card className="w-full h-screen max-w-none mx-auto bg-white dark:bg-gray-900 overflow-hidden rounded-none flex flex-col pt-16 pb-20">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 border-b dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md fixed top-0 left-0 right-0 z-20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <img src={recipientImage} alt={recipientName} className="object-cover" referrerPolicy="no-referrer" />
                  </Avatar>
                  {isRecipientOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 bg-green-500 transform translate-x-1/4 translate-y-1/4"></span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-semibold dark:text-white">{recipientName}</h2>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {isRecipientOnline ? 'Active now' : lastSeen && `Last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Video className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {recipientIsTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-16 left-0 right-0 flex justify-center"
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

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => renderMessage(msg, index))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={sendMessage}
          className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t dark:border-gray-800 fixed bottom-0 left-0 right-0"
        >
          <div className="flex items-end space-x-2">
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              placeholder="Type your message..."
              className="flex-grow p-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white text-sm transition-shadow"
            />
            <div ref={emojiPickerRef} className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-14 right-0 z-50"
                  >
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-full bg-purple-500 hover:bg-purple-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
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

export default Chat;

