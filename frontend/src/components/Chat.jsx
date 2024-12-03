import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useRecoilValue } from 'recoil';
import { authState } from '../store/atoms';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader } from '@/components/ui/card';

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
      console.log('Socket connected with ID:', newSocket.id);
      setSocket(newSocket);
      console.log('Emitting user_connected for userId:', auth.userId);
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

    // Request initial status
    if (newSocket.connected) {
      console.log('Requesting initial status for:', recipientId);
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

  const isRecipientOnline = onlineUsers.has(recipientId);

  return (
    <Card className="w-full h-[85vh] max-w-4xl mx-auto shadow-lg">
      <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="relative"
          >
            <Avatar className="w-12 h-12">
              <AvatarImage src={recipientImage} referrerPolicy="no-referrer" />
              <AvatarFallback className="bg-purple-100 text-purple-600">
                {recipientName[0]}
              </AvatarFallback>
            </Avatar>
            <span 
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isRecipientOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold">{recipientName}</h2>
            <p className="text-sm text-gray-500">
              {isRecipientOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </CardHeader>
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-4 ${msg.sender._id === auth.userId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] p-3 rounded-lg ${
              msg.sender._id === auth.userId
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300 text-gray-800'
            }`}>
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-75 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
          <div ref={emojiPickerRef} className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="bg-gray-200 p-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
};

export default Chat;

