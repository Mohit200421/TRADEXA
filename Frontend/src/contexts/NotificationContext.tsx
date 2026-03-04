import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "session" | "trade" | "alert" | "system";
  sessionName?: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Forex sessions data
const FOREX_SESSIONS = [
  { name: "Sydney", open: 22, close: 7, timezone: "UTC" },
  { name: "Tokyo", open: 0, close: 9, timezone: "UTC" },
  { name: "London", open: 8, close: 17, timezone: "UTC" },
  { name: "New York", open: 13, close: 22, timezone: "UTC" },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Check for session changes every minute
  useEffect(() => {
    const checkSessions = () => {
      const now = new Date();
      const currentHour = now.getUTCHours();
      const currentMinute = now.getUTCMinutes();
      const currentTime = currentHour + currentMinute / 60;

      FOREX_SESSIONS.forEach((session) => {
        // Check if session just opened (within last minute)
        if (currentTime >= session.open && currentTime < session.open + 0.02) {
          const notificationId = `session-${session.name}-${now.getMinutes()}`;
          
          // Avoid duplicate notifications
          setNotifications((prev) => {
            if (prev.some((n) => n.id === notificationId)) return prev;
            
            const newNotification: Notification = {
              id: notificationId,
              title: "📈 Market Session Opened",
              message: `${session.name} session is now LIVE! Trading volume increasing.`,
              type: "session",
              sessionName: session.name,
              timestamp: new Date(),
              read: false,
            };
            
            return [newNotification, ...prev].slice(0, 50); // Keep max 50 notifications
          });
        }
        
        // Check if session just closed (within last minute)
        if (currentTime >= session.close && currentTime < session.close + 0.02) {
          const notificationId = `session-close-${session.name}-${now.getMinutes()}`;
          
          setNotifications((prev) => {
            if (prev.some((n) => n.id === notificationId)) return prev;
            
            const newNotification: Notification = {
              id: notificationId,
              title: "📊 Market Session Closed",
              message: `${session.name} session has ended. Review your trades.`,
              type: "session",
              sessionName: session.name,
              timestamp: new Date(),
              read: false,
            };
            
            return [newNotification, ...prev].slice(0, 50);
          });
        }
      });
    };

    // Check immediately on mount
    checkSessions();
    
    // Then check every minute
    const interval = setInterval(checkSessions, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
