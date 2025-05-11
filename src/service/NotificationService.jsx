import { collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Create a new notification
export const createNotification = async (recipientEmail, tripId, message, type, destination) => {
  try {
    const notificationData = {
      recipientEmail,
      tripId,
      message,
      type,
      destination,
      read: false,
      timestamp: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    console.log('Notification created with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};

// Get all notifications for a user
export const getAllNotifications = async (userEmail) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientEmail', '==', userEmail),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error, notifications: [] };
  }
};

// Get only unread notifications for a user
export const getUnreadNotifications = async (userEmail) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientEmail', '==', userEmail),
      where('read', '==', false),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, notifications };
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return { success: false, error, notifications: [] };
  }
};

// Mark a single notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
};

// Mark all notifications for a user as read
export const markAllNotificationsAsRead = async (userEmail) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientEmail', '==', userEmail),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = [];
    
    querySnapshot.forEach((document) => {
      const notificationRef = doc(db, 'notifications', document.id);
      batch.push(updateDoc(notificationRef, { read: true }));
    });
    
    await Promise.all(batch);
    
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
};