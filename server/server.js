const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for notifications (in production, use a database)
let scheduledNotifications = new Map();

// Email transporter setup
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'HabitTracker Server is running' });
});

// Schedule a notification
app.post('/api/notifications/schedule', (req, res) => {
  try {
    const { userId, habitId, habitTitle, schedule, type } = req.body;
    
    const notificationId = `${userId}-${habitId}`;
    
    // Store notification data
    scheduledNotifications.set(notificationId, {
      userId,
      habitId,
      habitTitle,
      schedule,
      type,
      createdAt: new Date()
    });
    
    // Schedule the notification based on type
    if (type === 'daily') {
      // Schedule daily notification
      const [hour, minute] = schedule.time.split(':');
      cron.schedule(`${minute} ${hour} * * *`, () => {
        sendNotification(userId, habitTitle);
      });
    } else if (type === 'weekly') {
      // Schedule weekly notification
      const [hour, minute] = schedule.time.split(':');
      const days = schedule.days.join(',');
      cron.schedule(`${minute} ${hour} * * ${days}`, () => {
        sendNotification(userId, habitTitle);
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Notification scheduled successfully',
      notificationId 
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to schedule notification' 
    });
  }
});

// Cancel a notification
app.delete('/api/notifications/:notificationId', (req, res) => {
  try {
    const { notificationId } = req.params;
    
    if (scheduledNotifications.has(notificationId)) {
      scheduledNotifications.delete(notificationId);
      res.json({ 
        success: true, 
        message: 'Notification cancelled successfully' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }
  } catch (error) {
    console.error('Error cancelling notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel notification' 
    });
  }
});

// Get all notifications for a user
app.get('/api/notifications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userNotifications = Array.from(scheduledNotifications.values())
      .filter(notification => notification.userId === userId);
    
    res.json({ 
      success: true, 
      notifications: userNotifications 
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get notifications' 
    });
  }
});

// Send notification function
async function sendNotification(userId, habitTitle) {
  try {
    // For now, we'll just log the notification
    // In a real app, you might send push notifications, emails, or SMS
    console.log(`Sending notification to user ${userId}: Time for habit "${habitTitle}"`);
    
    // Example: Send email notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: `${userId}@example.com`, // In real app, get user's email from database
        subject: 'Habit Reminder',
        text: `Time for your habit: ${habitTitle}`,
        html: `
          <h2>Habit Reminder</h2>
          <p>It's time for your habit: <strong>${habitTitle}</strong></p>
          <p>Stay consistent and build discipline!</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log('Email notification sent');
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`HabitTracker Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 