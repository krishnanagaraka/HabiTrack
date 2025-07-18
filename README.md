# HabitTracker

A modern habit tracking app built with React and Capacitor, designed to help you build discipline and track your habits effectively.

## Features

- **Local Storage**: All data is stored locally on your device - no login required
- **Habit Management**: Create, edit, and delete habits with custom frequencies
- **Progress Tracking**: Visual progress indicators and streak tracking
- **Calendar View**: Monthly calendar to view and log habit completions
- **Notifications**: Local notifications for habit reminders
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Ready**: Built with Capacitor for cross-platform mobile deployment

## Architecture

### Local Storage
- All habit data is stored in the device's local storage
- No authentication required - start using immediately
- Data persists between app sessions
- Works offline

### Notifications
- **Local Notifications**: Use Capacitor's local notifications for immediate reminders
- **Server Notifications**: Optional backend server for advanced features (email, SMS, cross-device sync)

## Getting Started

### Frontend (React App)

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

### Backend Server (Optional)

For advanced notification features:

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Start the server:
```bash
npm run dev
```

## Mobile Deployment

### Android

1. Build the app:
```bash
npm run build
```

2. Add Android platform:
```bash
npx cap add android
```

3. Sync changes:
```bash
npx cap sync
```

4. Open in Android Studio:
```bash
npx cap open android
```

### iOS

1. Add iOS platform:
```bash
npx cap add ios
```

2. Sync changes:
```bash
npx cap sync
```

3. Open in Xcode:
```bash
npx cap open ios
```

## Data Storage

All data is stored locally using:

- **Habits**: `localStorage.getItem('habits')`
- **Completions**: `localStorage.getItem('completions')`
- **Weekly History**: `localStorage.getItem('weeklyHistory')`

## Notification System

### Local Notifications
- Immediate reminders using device notifications
- Scheduled based on habit frequency and time
- Works offline

### Server Notifications (Optional)
- Email notifications
- Cross-device synchronization
- Advanced scheduling options

## Development

### Project Structure
```
habit-tracker/
├── src/                    # React app source
│   ├── App.jsx            # Main app component
│   ├── ThemeContext.jsx   # Theme management
│   └── ...
├── server/                 # Backend server (optional)
│   ├── server.js          # Express server
│   └── package.json       # Server dependencies
├── android/               # Android platform files
└── ios/                  # iOS platform files
```

### Key Technologies
- **Frontend**: React, Material-UI, Vite
- **Mobile**: Capacitor
- **Storage**: Local Storage
- **Notifications**: Capacitor Local Notifications
- **Backend**: Express.js (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
