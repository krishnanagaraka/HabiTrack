# HabitTracker Notification Server

This is a backend server for the HabitTracker app that handles notification scheduling and sending.

## Features

- Schedule daily and weekly habit reminders
- Send email notifications (optional)
- RESTful API for notification management
- Cron-based scheduling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file:
```bash
cp env.example .env
```

3. Configure your environment variables in `.env`:
   - `PORT`: Server port (default: 3001)
   - `EMAIL_USER`: Gmail address for sending notifications
   - `EMAIL_PASS`: Gmail app password

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Schedule Notification
```
POST /api/notifications/schedule
Content-Type: application/json

{
  "userId": "user123",
  "habitId": "habit456",
  "habitTitle": "Morning Exercise",
  "schedule": {
    "time": "07:00",
    "days": [1, 2, 3, 4, 5] // For weekly notifications
  },
  "type": "daily" // or "weekly"
}
```

### Cancel Notification
```
DELETE /api/notifications/:notificationId
```

### Get User Notifications
```
GET /api/notifications/:userId
```

## Integration with Mobile App

The mobile app can use this server for more advanced notification features:

1. **Push Notifications**: Send push notifications to mobile devices
2. **Email Notifications**: Send email reminders
3. **SMS Notifications**: Send text message reminders
4. **Cross-Device Sync**: Sync notifications across devices

## Local vs Server Notifications

- **Local Notifications**: Use Capacitor's local notifications for immediate reminders
- **Server Notifications**: Use this server for advanced features like email, SMS, or cross-device sync

## Production Deployment

For production, consider:

1. **Database**: Use a real database instead of in-memory storage
2. **Authentication**: Add user authentication
3. **Push Notifications**: Integrate with Firebase Cloud Messaging or similar
4. **Monitoring**: Add logging and monitoring
5. **Security**: Add rate limiting and input validation 