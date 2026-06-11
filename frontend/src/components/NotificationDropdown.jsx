import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { useRecoilValue, useRecoilState } from 'recoil';
import { authState, notificationUnreadCountState } from '@/store/atoms';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import defaultAvatar from '@/utils/defaultAvatar';

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useRecoilState(notificationUnreadCountState);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/notification/unread-count`,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/notification?unreadOnly=true`,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      setNotifications(response.data);
      
      // Mark notifications as read inside DB
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/notification/mark-read`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchUnreadCount();
    }
  }, [auth.isAuthenticated]);

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'mention':
        return 'mentioned you in a post';
      case 'message':
        return 'sent you a message';
      case 'broadcast':
        return 'sent a broadcast';
      case 'personal':
        return 'message for you';
      default:
        return 'interacted with you';
    }
  };

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'mention':
        navigate(`/post/${notification.postId._id}`);
        break;
      case 'follow':
        navigate(`/profile/${notification.triggeredBy.username}`);
        break;
      case 'message':
        navigate(`/messages/${notification.triggeredBy.username}`);
        break;
      case 'broadcast':
      case 'personal':
      default:
        navigate('/notifications');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) fetchNotifications();
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px] font-bold bg-red-600 border border-white dark:border-zinc-950"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 mt-1 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900/50 shadow-xl overflow-hidden p-0"
      >
        <div className="max-h-[350px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className="flex items-start gap-3 p-3.5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors focus:bg-zinc-50 dark:focus:bg-zinc-900/40"
                onClick={() => handleNotificationClick(notification)}
              >
                <Avatar className="h-8 w-8 border border-zinc-100 dark:border-zinc-800">
                  <AvatarImage
                    src={notification.triggeredBy.profileImage?.thumbUrl || defaultAvatar}
                    alt={notification.triggeredBy.username}
                  />
                  <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-[10px] font-bold">
                    {notification.triggeredBy.firstname[0]}
                    {notification.triggeredBy.lastname[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-normal">
                    <span className="font-bold text-zinc-950 dark:text-white">
                      {notification.triggeredBy.firstname} {notification.triggeredBy.lastname}
                    </span>{' '}
                    {getNotificationText(notification)}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-zinc-500 dark:text-zinc-400">
              No new notifications
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-900 p-2 text-center bg-zinc-50/50 dark:bg-zinc-950">
            <Button
              variant="ghost"
              className="w-full text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white h-9 rounded-xl hover:bg-transparent"
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}