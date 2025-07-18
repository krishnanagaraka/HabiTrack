// Notification service for HabitTracker
// Handles both local and server notifications

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

class NotificationService {
  constructor() {
    this.isServerAvailable = false;
    this.checkServerAvailability();
  }

  // Check if the server is available
  async checkServerAvailability() {
    try {
      const response = await fetch(`${SERVER_URL}/health`);
      this.isServerAvailable = response.ok;
    } catch (error) {
      console.log('Server not available, using local notifications only');
      this.isServerAvailable = false;
    }
  }

  // Schedule a notification (local and/or server)
  async scheduleNotification(habit) {
    if (!habit.startTime) return;

    // Always schedule local notification
    await this.scheduleLocalNotification(habit);

    // Optionally schedule server notification
    if (this.isServerAvailable) {
      await this.scheduleServerNotification(habit);
    }
  }

  // Helper to generate a numeric id from a string
  hashId(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash) % 1000000; // Keep it positive and within 6 digits
  }

  // Schedule local notification using Capacitor
  async scheduleLocalNotification(habit) {
    try {
      console.log('DEBUG: scheduleLocalNotification called with habit:', JSON.stringify(habit));
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      // Check permissions first
      const permissionStatus = await LocalNotifications.checkPermissions();
      console.log('DEBUG: Notification permission status:', JSON.stringify(permissionStatus));
      
      if (permissionStatus.display !== 'granted') {
        console.log('DEBUG: Notification permission not granted');
        return;
      }
      
      if (habit.frequency === 'daily') {
        const hour = parseInt(habit.startTime.split(':')[0]);
        const minute = parseInt(habit.startTime.split(':')[1]);
        const id = this.hashId(`${habit.title}-daily`); // Ensure this is a number
        const notification = {
          id: Number(id), // Force numeric id
          title: 'Habit Reminder',
          body: `Time for: ${habit.title}`,
          schedule: {
            on: {
              hour,
              minute
            }
          }
        };
        console.log('DEBUG: Scheduling daily notification object:', JSON.stringify(notification));
        await LocalNotifications.schedule({
          notifications: [notification]
        });
        console.log('DEBUG: Daily notification scheduled successfully');
      } else if (habit.frequency === 'weekly' && habit.weeklyDays.length > 0) {
        const notifications = habit.weeklyDays.map((dayIndex, idx) => {
          const hour = parseInt(habit.startTime.split(':')[0]);
          const minute = parseInt(habit.startTime.split(':')[1]);
          const id = this.hashId(`${habit.title}-weekly-${dayIndex}`); // Ensure this is a number
          return {
            id: Number(id), // Force numeric id
            title: 'Habit Reminder',
            body: `Time for: ${habit.title}`,
            schedule: {
              on: {
                weekday: dayIndex + 1, // Monday = 1, Sunday = 7
                hour,
                minute
              }
            }
          };
        });
        console.log('DEBUG: Scheduling weekly notifications array:', JSON.stringify(notifications));
        await LocalNotifications.schedule({
          notifications
        });
        console.log('DEBUG: Weekly notifications scheduled successfully');
      } else {
        console.log('DEBUG: Habit frequency not daily or weekly, or missing weeklyDays. No notification scheduled.');
      }
    } catch (error) {
      console.log('DEBUG: Local notification scheduling error:', error);
    }
  }

  // Schedule server notification
  async scheduleServerNotification(habit) {
    try {
      const userId = this.getUserId(); // Generate or get user ID
      const habitId = habit.title.replace(/\s+/g, '-').toLowerCase();
      
      const response = await fetch(`${SERVER_URL}/api/notifications/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          habitId,
          habitTitle: habit.title,
          schedule: {
            time: habit.startTime,
            days: habit.weeklyDays || []
          },
          type: habit.frequency
        })
      });

      if (response.ok) {
        console.log('Server notification scheduled successfully');
      } else {
        console.log('Failed to schedule server notification');
      }
    } catch (error) {
      console.log('Error scheduling server notification:', error);
    }
  }

  // Cancel notifications
  async cancelNotification(habit) {
    // Cancel local notification
    await this.cancelLocalNotification(habit);

    // Cancel server notification
    if (this.isServerAvailable) {
      await this.cancelServerNotification(habit);
    }
  }

  // Cancel local notification
  async cancelLocalNotification(habit) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      if (habit.frequency === 'daily') {
        await LocalNotifications.cancel({ 
          notifications: [{ id: `habit-${habit.title}-daily` }] 
        });
      } else if (habit.frequency === 'weekly') {
        const notificationIds = habit.weeklyDays.map(dayIndex => 
          `habit-${habit.title}-weekly-${dayIndex}`
        );
        await LocalNotifications.cancel({ 
          notifications: notificationIds.map(id => ({ id })) 
        });
      }
    } catch (error) {
      console.log('Local notification cancellation not available:', error);
    }
  }

  // Cancel server notification
  async cancelServerNotification(habit) {
    try {
      const userId = this.getUserId();
      const habitId = habit.title.replace(/\s+/g, '-').toLowerCase();
      const notificationId = `${userId}-${habitId}`;
      
      const response = await fetch(`${SERVER_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        console.log('Server notification cancelled successfully');
      } else {
        console.log('Failed to cancel server notification');
      }
    } catch (error) {
      console.log('Error cancelling server notification:', error);
    }
  }

  // Get or generate user ID
  getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.log('Permission request not available:', error);
      return false;
    }
  }

  // Check notification permissions
  async checkPermissions() {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.log('Permission check not available:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService; 