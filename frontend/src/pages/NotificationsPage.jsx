import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Loader2 } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import axios from 'axios';
import { useRecoilValue, useRecoilState } from 'recoil';
import { authState, notificationUnreadCountState } from '@/store/atoms';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import defaultAvatar from '@/utils/defaultAvatar';
import { Card } from '@/components/ui/card';
import { Mentions } from '@/components/ui/Mentions';
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useRecoilState(notificationUnreadCountState);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/notification`,
          {
            headers: { Authorization: `Bearer ${auth.token}` }
          }
        );
        setNotifications(response.data);

        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/notification/mark-read`,
          {},
          {
            headers: { Authorization: `Bearer ${auth.token}` }
          }
        );
        const countResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/notification/unread-count`,
          {
            headers: { Authorization: `Bearer ${auth.token}` }
          }
        );
        setUnreadCount(countResponse.data.count);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) {
      fetchNotifications();
    }
  }, [auth.token]);

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
        return 'sent a personal message';
      default:
        return 'interacted with you';
    }
  };

  const groupNotifications = (notifications) => {
    const unread = notifications.filter(n => !n.isRead);
    const read = notifications.filter(n => n.isRead);

    const groupByDate = (notifications) => {
      return notifications.reduce((groups, notification) => {
        const date = new Date(notification.createdAt);
        let key;

        if (isToday(date)) {
          key = 'Today';
        } else if (isYesterday(date)) {
          key = 'Yesterday';
        } else if (isThisWeek(date)) {
          key = 'This Week';
        } else {
          key = 'Older';
        }

        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(notification);
        return groups;
      }, {});
    };

    return {
      unread: groupByDate(unread),
      read: groupByDate(read)
    };
  };

  const handleNotificationClick = (notification) => {
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'mention':
        if (notification.postId?._id) {
          navigate(`/post/${notification.postId._id}`);
        }
        break;
      case 'follow':
        if (notification.triggeredBy?.username) {
          navigate(`/profile/${notification.triggeredBy.username}`);
        }
        break;
      case 'message':
        if (notification.triggeredBy?.username) {
          navigate(`/messages/${notification.triggeredBy.username}`);
        }
        break;
      default:
        break;
    }
  };

  const renderNotificationGroup = (notificationsGroup, groupTitle) => {
    return Object.entries(notificationsGroup).map(([dateGroup, items]) => {
      if (!items || items.length === 0) return null;

      return (
        <div key={dateGroup} className="space-y-3 pt-2">
          {/* Typographical group markers with clear uppercase spacing */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
              {groupTitle} • {dateGroup}
            </span>
            <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-900" />
          </div>

          <div className="space-y-1">
            {items.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "py-4 sm:px-4 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/35 transition-all duration-200 flex items-start gap-4 border-b border-zinc-100 dark:border-zinc-900 bg-transparent",
                  !notification.isRead && "border-l-2 border-zinc-900 dark:border-white pl-3.5 sm:pl-4"
                )}
              >
                <Avatar className="h-10 w-10 border border-zinc-200/50 dark:border-zinc-850 shadow-sm flex-shrink-0">
                  <AvatarImage
                    src={notification.triggeredBy?.profileImage?.thumbUrl || defaultAvatar}
                    alt={notification.triggeredBy?.username}
                  />
                  <AvatarFallback className="text-xs font-bold">
                    {notification.triggeredBy?.firstname?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 leading-normal">
                    <span className="font-bold">
                      {notification.triggeredBy?.firstname} {notification.triggeredBy?.lastname}
                    </span>{' '}
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                      {getNotificationText(notification)}
                    </span>
                  </p>
                  
                  {/* Styled blockquotes for messaging/mentions content */}
                  {notification.postId && notification.message && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-900/40 p-3 rounded-xl mt-2 leading-relaxed border border-zinc-150/40 dark:border-zinc-900">
                      <Mentions text={notification.message} />
                    </div>
                  )}
                  
                  {notification.type === 'broadcast' && notification.message && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-900/40 p-3 rounded-xl mt-2 leading-relaxed border border-zinc-150/40 dark:border-zinc-900">
                      <Mentions text={notification.message} />
                    </p>
                  )}

                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1.5 tracking-tight">
                    {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-black">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const groupedNotifications = groupNotifications(notifications);
  const hasUnread = Object.keys(groupedNotifications.unread).length > 0;
  const hasRead = Object.keys(groupedNotifications.read).length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Typographical Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-900">
          <Bell className="h-6 w-6 text-zinc-900 dark:text-white" />
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Activity Log</h1>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-10">
            {/* Unread Section */}
            {hasUnread && (
              <div className="space-y-4">
                {renderNotificationGroup(groupedNotifications.unread, "Unread")}
              </div>
            )}

            {/* Read Section */}
            {hasRead && (
              <div className="space-y-4">
                {renderNotificationGroup(groupedNotifications.read, "Earlier")}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-400 dark:text-zinc-500 border border-zinc-150 dark:border-zinc-900 rounded-[28px] bg-zinc-50/50 dark:bg-zinc-950/20 max-w-lg mx-auto">
            <Bell className="h-10 w-10 mx-auto mb-4 text-zinc-300 dark:text-zinc-800" />
            <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Timeline Silence</p>
            <p className="text-xs mt-1 text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto">
              When peers interact with your publications or follow your connection vector, the events will populate here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}