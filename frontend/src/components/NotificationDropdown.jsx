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
      console.log('Received notifications:', response.data);
      setNotifications(response.data);
      
      // Mark notifications as read
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
        navigate(`/notifications?postId=${notification.postId}`);
        break;
      case 'follow':
        navigate(`/profile/${notification.triggeredBy.username}`);
        break;
      case 'message':
        navigate(`/messages/${notification.triggeredBy.username}`);
        break;
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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80"
        style={{ maxHeight: '400px' }}
      >
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={notification.triggeredBy.profileImage?.thumbUrl || defaultAvatar}
                    alt={notification.triggeredBy.username}
                  />
                  <AvatarFallback>
                    {notification.triggeredBy.firstname[0]}
                    {notification.triggeredBy.lastname[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-none">
                    <span className="font-medium">
                      {notification.triggeredBy.firstname} {notification.triggeredBy.lastname}
                    </span>{' '}
                    {getNotificationText(notification)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No new notifications
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="border-t p-2 text-center">
            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground hover:text-foreground"
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