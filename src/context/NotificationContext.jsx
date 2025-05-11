import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../service/firebaseConfig';
import { getUnreadNotifications, getAllNotifications } from '../service/NotificationService';

// Create context
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get current user from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Set up real-time listener for notifications
  useEffect(() => {
    if (!currentUser?.email) return;

    setLoading(true);
    
    try {
      // Create a query for this user's notifications
      const q = query(
        collection(db, 'notifications'),
        where('recipientEmail', '==', currentUser.email),
        orderBy('timestamp', 'desc')
      );
      
      // Set up the real-time listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notificationsList = [];
        let unreadCounter = 0;
        
        querySnapshot.forEach((doc) => {
          const notificationData = {
            id: doc.id,
            ...doc.data()
          };
          
          notificationsList.push(notificationData);
          
          // Count unread notifications
          if (!notificationData.read) {
            unreadCounter++;
          }
        });
        
        setNotifications(notificationsList);
        setUnreadCount(unreadCounter);
        setLoading(false);
      }, (error) => {
        console.error("Error listening to notifications:", error);
        setLoading(false);
        
        // Fallback to non-realtime if listener fails
        fetchNotificationsManually(currentUser.email);
      });
      
      // Cleanup listener on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up notification listener:", error);
      setLoading(false);
      
      // Fallback to non-realtime if listener setup fails
      fetchNotificationsManually(currentUser.email);
    }
  }, [currentUser]);
  
  // Fallback function for manual fetching
  const fetchNotificationsManually = async (email) => {
    try {
      // Get unread count
      const unreadResult = await getUnreadNotifications(email);
      if (unreadResult.success) {
        setUnreadCount(unreadResult.notifications.length);
      }
      
      // Get all notifications
      const allResult = await getAllNotifications(email);
      if (allResult.success) {
        setNotifications(allResult.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications manually:', error);
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        loading,
        refreshNotifications: () => fetchNotificationsManually(currentUser?.email)
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for using the notification context
export const useNotifications = () => useContext(NotificationContext);