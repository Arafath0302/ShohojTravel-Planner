import React, { useState, useEffect } from 'react';
import { FiBell, FiX, FiCheck } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { markAllNotificationsAsRead, markNotificationAsRead } from '@/service/NotificationService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useNotifications } from '@/context/NotificationContext';

function NotificationPanel() {
  const { notifications, unreadCount, loading, refreshNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.email) return;
    
    try {
      const result = await markAllNotificationsAsRead(currentUser.email);
      if (result.success) {
        toast.success('All notifications marked as read');
        refreshNotifications();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        refreshNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    handleMarkAsRead(notification.id);
    
    // Navigate to the trip page
    if (notification.tripId) {
      navigate(`/view-trip/${notification.tripId}`);
      setIsOpen(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      // Handle both Firestore Timestamp and JavaScript Date objects
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
      // If less than 24 hours ago, show relative time
      const now = new Date();
      const diffMs = now - date;
      const diffHrs = diffMs / (1000 * 60 * 60);
      
      if (diffHrs < 24) {
        if (diffHrs < 1) {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        }
        return `${Math.floor(diffHrs)} hour${Math.floor(diffHrs) !== 1 ? 's' : ''} ago`;
      }
      
      // Otherwise show date
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Recently';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell with Badge */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 bg-primary text-white flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  className="text-white text-xs h-7 px-2"
                >
                  <FiCheck size={14} className="mr-1" /> Mark all read
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-white h-6 w-6"
              >
                <FiX size={16} />
              </Button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between">
                    <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;