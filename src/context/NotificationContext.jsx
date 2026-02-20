// // import { createContext, useContext, useState, useEffect } from 'react';
// // import { useAuth } from './AuthContext';
// // import { notificationService } from '../services/notificationService/notificationService'; // ✅ Fix: remove extra /notificationService

// // const NotificationContext = createContext();

// // export const useNotifications = () => {
// //   const context = useContext(NotificationContext);
// //   if (!context) {
// //     throw new Error('useNotifications must be used within NotificationProvider');
// //   }
// //   return context;
// // };

// // export const NotificationProvider = ({ children }) => {
// //   const { user } = useAuth();
// //   const [notifications, setNotifications] = useState([]);
// //   const [unreadCount, setUnreadCount] = useState(0);
// //   const [loading, setLoading] = useState(false);

// //   // Fetch notifications
// //   const fetchNotifications = async () => {
// //     if (!user) return;
    
// //     setLoading(true);
// //     try {
// //       const data = await notificationService.getNotifications();
// //       setNotifications(data);
// //       updateUnreadCount(data);
// //     } catch (error) {
// //       console.error('Error fetching notifications:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Mark as read
// //   const markAsRead = async (notificationId) => {
// //     try {
// //       const updated = await notificationService.markAsRead(notificationId);
// //       setNotifications(updated);
// //       updateUnreadCount(updated);
// //     } catch (error) {
// //       console.error('Error marking as read:', error);
// //     }
// //   };

// //   // Mark all as read
// //   const markAllAsRead = async () => {
// //     try {
// //       const updated = await notificationService.markAllAsRead();
// //       setNotifications(updated);
// //       setUnreadCount(0);
// //     } catch (error) {
// //       console.error('Error marking all as read:', error);
// //     }
// //   };

// //   // Delete notification
// //   const deleteNotification = async (notificationId) => {
// //     try {
// //       const updated = await notificationService.deleteNotification(notificationId);
// //       setNotifications(updated);
// //       updateUnreadCount(updated);
// //     } catch (error) {
// //       console.error('Error deleting notification:', error);
// //     }
// //   };

// //   // Add new notification
// //   const addNotification = async (notification) => {
// //     try {
// //       const newNotification = await notificationService.addNotification(notification);
// //       setNotifications(prev => [newNotification, ...prev]);
// //       setUnreadCount(prev => prev + 1);
// //       return newNotification;
// //     } catch (error) {
// //       console.error('Error adding notification:', error);
// //     }
// //   };

// //   // Update unread count
// //   const updateUnreadCount = (notifs) => {
// //     const count = notifs.filter(n => !n.read).length;
// //     setUnreadCount(count);
// //   };

// //   // Initial fetch and polling
// //   useEffect(() => {
// //     if (user) {
// //       fetchNotifications();
      
// //       // Poll every 30 seconds
// //       const interval = setInterval(fetchNotifications, 30000);
// //       return () => clearInterval(interval);
// //     }
// //   }, [user]);

// //   const value = {
// //     notifications,
// //     unreadCount,
// //     loading,
// //     markAsRead,
// //     markAllAsRead,
// //     deleteNotification,
// //     addNotification,
// //     fetchNotifications
// //   };

// //   return (
// //     <NotificationContext.Provider value={value}>
// //       {children}
// //     </NotificationContext.Provider>
// //   );
// // };


// import { createContext, useContext, useState, useEffect } from 'react';
// import { useAuth } from './AuthContext';
// import { notificationService } from '../services/notificationService/notificationService';

// const NotificationContext = createContext();

// export const useNotifications = () => {
//   const context = useContext(NotificationContext);
//   if (!context) {
//     throw new Error('useNotifications must be used within NotificationProvider');
//   }
//   return context;
// };

// export const NotificationProvider = ({ children }) => {
//   const { user } = useAuth();
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Fetch sent notifications
//   const fetchNotifications = async () => {
//     if (!user) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await notificationService.getSentNotifications();
//       const notificationsData = response.data || [];
//       setNotifications(notificationsData);
      
//       // Fetch unread count separately
//       try {
//         const count = await notificationService.getUnreadCount();
//         setUnreadCount(count);
//       } catch (countError) {
//         console.error('Error fetching unread count:', countError);
//       }
      
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Mark as read
//   const markAsRead = async (notificationId) => {
//     try {
//       await notificationService.markAsRead(notificationId);
      
//       // Update local state
//       setNotifications(prev => 
//         prev.map(n => 
//           n.id === notificationId ? { ...n, read: true } : n
//         )
//       );
      
//       // Update unread count
//       setUnreadCount(prev => Math.max(0, prev - 1));
      
//     } catch (error) {
//       console.error('Error marking as read:', error);
//       throw error;
//     }
//   };

//   // Mark all as read
//   const markAllAsRead = async () => {
//     try {
//       await notificationService.markAllAsRead();
      
//       // Update local state
//       setNotifications(prev => 
//         prev.map(n => ({ ...n, read: true }))
//       );
      
//       setUnreadCount(0);
      
//     } catch (error) {
//       console.error('Error marking all as read:', error);
//       throw error;
//     }
//   };

//   // Delete notification
//   const deleteNotification = async (notificationId) => {
//     try {
//       await notificationService.deleteNotification(notificationId);
      
//       // Update local state
//       setNotifications(prev => 
//         prev.filter(n => n.id !== notificationId)
//       );
      
//       // Recalculate unread count
//       setUnreadCount(prev => {
//         const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
//         return wasUnread ? Math.max(0, prev - 1) : prev;
//       });
      
//     } catch (error) {
//       console.error('Error deleting notification:', error);
//       throw error;
//     }
//   };

//   // Create new notification
//   const createNotification = async (notificationData) => {
//     try {
//       const response = await notificationService.createNotification(notificationData);
      
//       // Add to local state if needed
//       if (response.data) {
//         setNotifications(prev => [response.data, ...prev]);
//         setUnreadCount(prev => prev + 1);
//       }
      
//       return response;
//     } catch (error) {
//       console.error('Error creating notification:', error);
//       throw error;
//     }
//   };

//   // Get single notification by ID
//   const getNotificationById = async (notificationId) => {
//     try {
//       const response = await notificationService.getNotificationById(notificationId);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching notification:', error);
//       throw error;
//     }
//   };

//   // Initial fetch and polling
//   useEffect(() => {
//     if (user) {
//       fetchNotifications();
      
//       // Poll every 30 seconds for updates
//       const interval = setInterval(() => {
//         fetchNotifications();
//       }, 30000);
      
//       return () => clearInterval(interval);
//     }
//   }, [user]);

//   const value = {
//     notifications,
//     unreadCount,
//     loading,
//     error,
//     markAsRead,
//     markAllAsRead,
//     deleteNotification,
//     createNotification,
//     getNotificationById,
//     fetchNotifications,
//     refetch: fetchNotifications
//   };

//   return (
//     <NotificationContext.Provider value={value}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };



// context/NotificationContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Uses getMyNotifications (RECIPIENT side) to power:
//   • Navbar bell badge (unreadCount)
//   • MyNotificationsPage inbox
//
// ⚠️  markAsRead single API removed — /markNotificationRead returns 404
//     Only local state is updated when user clicks a notification row
//     markAllAsRead (PUT /markAllAsRead) still works fine
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  // ── Normalise one item from getMyNotifications ──────────────────────────────
  const normalise = (n) => {
    if (!n || typeof n !== 'object') return null;
    return {
      id:          n.notification_id ?? n.id,
      title:       n.title           ?? 'No Title',
      message:     n.description     ?? n.message   ?? '',
      createdAt:   n.created_at      ?? n.createdAt ?? new Date().toISOString(),
      status:      n.status,
      read:        n.is_read === 1   || n.is_read === true || n.read === true,
      readAt:      n.read_at         ?? null,
      senderName:  n.sender_name     ?? '',
      senderRole:  n.sender_role     ?? '',
      senderEmail: n.sender_email    ?? '',
    };
  };

  // ── Fetch recipient inbox ────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async ({ page = 1, limit = 50, is_read } = {}) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await notificationService.getMyNotifications({ page, limit, is_read });
      const data = res?.data ?? {};
      const raw  = Array.isArray(data.notifications) ? data.notifications : [];
      setNotifications(raw.map(normalise).filter(Boolean));
      setUnreadCount(data.unread_count ?? 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Refresh only unread count (lightweight poll) ─────────────────────────────
  const refreshUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res   = await notificationService.getMyNotifications({ page: 1, limit: 1 });
      const count = res?.data?.unread_count ?? 0;
      setUnreadCount(count);
    } catch {
      // silent — badge not critical
    }
  }, [user]);

  // ── Mark single as read — LOCAL STATE ONLY (no API, endpoint is 404) ─────────
  // When user opens a notification, we mark it read in UI immediately
  // The server tracks reads via getMyNotifications response on next fetch
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // ── Mark ALL as read — API call (PUT /markAllAsRead, no body) ────────────────
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  };

  // ── Delete notification ──────────────────────────────────────────────────────
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  // ── Initial load + 30s poll ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifications();
    const interval = setInterval(refreshUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications, refreshUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,          // local only — no API call (404 fix)
    markAllAsRead,       // API call (PUT /markAllAsRead)
    deleteNotification,
    fetchNotifications,
    refreshUnreadCount,
    refetch: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};