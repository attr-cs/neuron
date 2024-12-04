import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useRecoilValue } from 'recoil';
import { authState } from '.m/store/atoms';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Phone, Video, MoreVertical } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

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

  // Socket connection and message handling logic remains the same
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

  // Fetch messages effect remains the same
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

  // Emoji picker click outside handler
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
      setError('Failed to send message');
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
  };

  const isRecipientOnline = onlineUsers.has(recipientId);

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Card className="w-full h-[100vh] md:h-[85vh] max-w-5xl mx-auto shadow-2xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 border-b bg-white dark:bg-gray-800 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Avatar className="w-12 h-12 ring-2 ring-offset-2 ring-purple-500">
                <img src={recipientImage} alt={recipientName} className="object-cover" referrerPolicy="no-referrer" />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 bg-green-500"></span>
              </Avatar>
            </motion.div>
            <div>
              <h2 className="text-lg font-semibold">{recipientName}</h2>
              <p className="text-sm text-gray-500">
                {isRecipientOnline ? 'Active now' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Video className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
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
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate="visible"
              variants={messageVariants}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex ${msg.sender._id === auth.userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] p-3 rounded-2xl ${
                  msg.sender._id === auth.userId
                    ? 'bg-purple-500 text-white ml-12'
                    : 'bg-gray-100 dark:bg-gray-700 dark:text-white mr-12'
                }`}
              >
                <p className="text-sm md:text-base">{msg.content}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
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
        className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700"
      >
        <div className="flex items-end space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-3 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
          />
          <div ref={emojiPickerRef} className="relative">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Smile className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </motion.button>
            {showEmojiPicker && (
              <div className="absolute bottom-14 right-0 z-50">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-purple-500 hover:bg-purple-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <Send className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.form>
    </Card>
  );
};

export default Chat;