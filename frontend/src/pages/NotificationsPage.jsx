import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Loader2 } from 'lucide-react';
import { format, isToday, isYesterday, isSameWeek, isThisWeek, subDays } from 'date-fns';
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

    fetchNotifications();
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
        return 'Message for you';
      default:
        return 'interacted with you';
    }
  };

  const groupNotifications = (notifications) => {
    // First separate by read/unread
    const unread = notifications.filter(n => !n.isRead);
    const read = notifications.filter(n => n.isRead);

    // Function to group notifications by date
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

  const renderNotificationGroup = (notifications, title) => {
    if (!notifications || notifications.length === 0) return null;

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground px-1">{title}</h3>
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={cn(
                "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                !notification.isRead && "bg-primary/5 dark:bg-primary/10"
              )}
              onClick={() => {
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
                    navigate('/notifications');
                    break;
                  case 'personal':
                    navigate('/notifications');
                    break;
                  default:
                    navigate('/notifications');
                }
              }}
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
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
                  <p className="text-sm">
                    <span className="font-medium">
                      {notification.triggeredBy.firstname} {notification.triggeredBy.lastname}
                    </span>{' '}
                    {getNotificationText(notification)}
                  </p>
                  {notification.postId && notification.message && (
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-2">
                      <Mentions text={notification.message} />
                    </div>
                  )}
                  {notification.type === 'broadcast' && (
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-2">
                      <Mentions text={notification.message} />
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupedNotifications = groupNotifications(notifications);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-8">
          {/* Unread Notifications */}
          {Object.entries(groupedNotifications.unread).map(([dateGroup, notifications]) => (
            <div key={dateGroup} className="space-y-4">
              <h2 className="text-lg font-semibold">{dateGroup}</h2>
              {renderNotificationGroup(notifications, "Unread")}
            </div>
          ))}

          {/* Read Notifications */}
          {Object.entries(groupedNotifications.read).map(([dateGroup, notifications]) => (
            <div key={dateGroup} className="space-y-4">
              <h2 className="text-lg font-semibold">{dateGroup}</h2>
              {renderNotificationGroup(notifications, "Earlier")}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm mt-1">
            When someone interacts with you, you'll see it here
          </p>
        </div>
      )}
    </div>
  );
} 