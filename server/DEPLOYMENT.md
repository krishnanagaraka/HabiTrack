# HabitTracker Server Deployment Guide

This guide covers deploying the HabitTracker notification server to various platforms.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm run dev
```

## Production Deployment

### Option 1: Heroku

1. Create a Heroku app:
```bash
heroku create your-habit-tracker-server
```

2. Set environment variables:
```bash
heroku config:set PORT=3001
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
```

3. Deploy:
```bash
git push heroku main
```

### Option 2: Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Option 3: DigitalOcean App Platform

1. Create a new app in DigitalOcean
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Option 4: VPS (Ubuntu/Debian)

1. SSH into your server
2. Install Node.js and npm
3. Clone your repository
4. Install dependencies:
```bash
npm install --production
```

5. Set up environment variables
6. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name habit-tracker-server
pm2 startup
pm2 save
```

7. Set up Nginx reverse proxy (optional):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

Required environment variables:

- `PORT`: Server port (default: 3001)
- `EMAIL_USER`: Gmail address for sending notifications
- `EMAIL_PASS`: Gmail app password

Optional:

- `NODE_ENV`: Set to 'production' for production mode
- `CORS_ORIGIN`: Allowed CORS origins

## Database Setup (Production)

For production, consider using a real database:

1. **PostgreSQL**:
```bash
npm install pg
```

2. **MongoDB**:
```bash
npm install mongodb
```

3. **SQLite** (for simple setups):
```bash
npm install sqlite3
```

## Security Considerations

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Input Validation**: Validate all input data
3. **HTTPS**: Use HTTPS in production
4. **CORS**: Configure CORS properly
5. **Authentication**: Add user authentication if needed

## Monitoring

1. **Logging**: Use Winston or similar for structured logging
2. **Health Checks**: The `/health` endpoint for monitoring
3. **Error Tracking**: Use Sentry or similar for error tracking
4. **Performance**: Monitor response times and resource usage

## SSL/HTTPS Setup

### Let's Encrypt (Free)

1. Install Certbot
2. Get certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

3. Auto-renewal:
```bash
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change PORT in environment variables
2. **Email not sending**: Check Gmail app password and 2FA settings
3. **CORS errors**: Configure CORS_ORIGIN properly
4. **Memory issues**: Monitor memory usage and optimize

### Logs

Check logs for errors:
```bash
# PM2 logs
pm2 logs habit-tracker-server

# Direct logs
npm run dev
```

## Scaling

For high traffic:

1. **Load Balancing**: Use multiple server instances
2. **Caching**: Add Redis for caching
3. **CDN**: Use CDN for static assets
4. **Database**: Use managed database service
5. **Monitoring**: Set up comprehensive monitoring 