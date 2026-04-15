# Quick Start Guide

Get your training platform up and running in 5 minutes!

## Prerequisites
- Node.js installed (v16+)
- MongoDB installed and running

## Step 1: Install Dependencies

```bash
# Install backend dependencies
cd training-platform/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Setup Environment Variables

Create a `.env` file in the backend directory:

```bash
cd ../backend
cp .env.example .env
```

The default `.env.example` should work for local development.

## Step 3: Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# MongoDB should start automatically, or use MongoDB Compass
```

## Step 4: Seed Sample Data (Optional but Recommended)

```bash
# From the backend directory
node seedData.js
```

This creates:
- 1 Admin user
- 2 Employee users  
- 3 Sample courses with modules and chapters

## Step 5: Start the Backend Server

```bash
# From backend directory
npm start
```

Backend runs on http://localhost:5000

## Step 6: Start the Frontend (New Terminal)

```bash
# From frontend directory
cd ../frontend
npm start
```

Frontend runs on http://localhost:3000

## Step 7: Login and Explore!

### Admin Account
- Email: `admin@company.com`
- Password: `admin123`
- Can create courses, manage users, assign courses

### Employee Accounts
- Email: `john@company.com` or `jane@company.com`
- Password: `password123`
- Can view assigned courses, mark chapters complete

## Common Issues

### MongoDB Connection Error
**Problem:** `MongoServerError: connect ECONNREFUSED`

**Solution:** 
```bash
# Make sure MongoDB is running
mongosh  # Test connection
```

### Port Already in Use
**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:** 
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env file
```

### Module Not Found
**Problem:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Create Your First Course** (Admin)
   - Login as admin
   - Go to Admin Panel → Manage Courses
   - Click "Create Course"

2. **Add Modules via API** (Admin)
   ```bash
   # Get your JWT token from browser DevTools (Application → Local Storage)
   curl -X POST http://localhost:5000/api/courses/{courseId}/modules \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Your Module Title",
       "description": "Module description",
       "order": 1
     }'
   ```

3. **Assign Courses to Employees** (Admin)
   - Admin Panel → Manage Users
   - Click "Assign Courses" next to a user

4. **Explore as Employee**
   - Login as employee
   - View assigned courses
   - Navigate through modules and chapters
   - Mark chapters as complete

## API Testing with Postman

Import this collection for quick API testing:

1. Create a new Postman collection
2. Add requests for:
   - POST `/api/auth/login` - Login
   - GET `/api/courses` - Get courses
   - POST `/api/courses` - Create course
   - POST `/api/chapters/:id/complete` - Mark chapter complete

## Development Tips

### Auto-reload Backend
```bash
npm install -g nodemon
cd backend
nodemon server.js
```

### React DevTools
Install React DevTools browser extension for debugging

### MongoDB GUI
Use MongoDB Compass for visual database management

## Production Deployment

See the main README.md for detailed deployment instructions to:
- Heroku (Backend)
- Vercel (Frontend)
- MongoDB Atlas (Database)

## Support

Having trouble? Check:
1. README.md for detailed documentation
2. Backend logs in terminal
3. Browser console for frontend errors
4. MongoDB logs: `tail -f /usr/local/var/log/mongodb/mongo.log`

Happy Learning! 🎓
