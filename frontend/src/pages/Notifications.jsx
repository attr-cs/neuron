import { useState    } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoNotifications, IoCheckmarkCircle, IoWarning, IoInformationCircle } from 'react-icons/io5';
import { format } from 'date-fns';

const Notification = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Order Confirmed',
      message: 'Your order #12345 has been successfully processed',
      timestamp: new Date(2024, 0, 15, 14, 30),
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Product "Wireless Headphones" is running low on stock',
      timestamp: new Date(2024, 0, 15, 12, 15),
      read: true
    },
    {
      id: 3,
      type: 'info',
      title: 'New Feature Available',
      message: 'Check out our new dashboard analytics feature!',
      timestamp: new Date(2024, 0, 14, 9, 45),
      read: false
    }
  ]);

  const getIcon = (type) => {
    switch(type) {
      case 'success':
        return <IoCheckmarkCircle className="text-green-500 text-xl" />;
      case 'warning':
        return <IoWarning className="text-yellow-500 text-xl" />;
      case 'info':
        return <IoInformationCircle className="text-blue-500 text-xl" />;
      default:
        return <IoNotifications className="text-gray-500 text-xl" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        <div className="bg-blue-100 px-4 py-2 rounded-full">
          <span className="text-blue-600 font-medium">
            {notifications.filter(n => !n.read).length} Unread
          </span>
        </div>
      </div>

      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 p-4 rounded-lg shadow-md transition-all duration-300 ${
              notification.read ? 'bg-gray-50' : 'bg-white border-l-4 border-blue-500'
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {notification.title}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {format(notification.timestamp, 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="mt-1 text-gray-600">{notification.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <IoNotifications className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl text-gray-500">No notifications yet</h3>
        </motion.div>
      )}
    </div>
  );
};

export default Notification;
