import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useRecoilValue } from 'recoil';
import { authState } from '../store/atoms';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="fixed inset-0 bg-white dark:bg-gray-900 z-10 flex flex-col"
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isRecipientOnline ? 'Active now' : 'Offline'}
                  </p>
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

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate="visible"
                variants={messageVariants}
                layout
                className={`flex ${msg.sender._id === auth.userId ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`max-w-[80%] md:max-w-[60%] p-3 rounded-2xl ${
                    msg.sender._id === auth.userId
                      ? 'bg-purple-500 text-white ml-12'
                      : 'bg-gray-100 dark:bg-gray-800 dark:text-white mr-12'
                  }`}
                >
                  <p className="text-sm md:text-base">{msg.content}</p>
                  <span className="text-xs opacity-75 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </motion.div>
              </motion.div>
            ))}
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
              onChange={(e) => setMessage(e.target.value)}
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
    </motion.div>
  );
};

export default Chat;

