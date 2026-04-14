# LearnPoint - Internal Training Platform

A full-stack training platform with a beautiful Coursera-like UI for managing employee training courses.

## Features

### For Employees
- 📚 Browse and access assigned courses
- 🎯 Track learning progress with visual indicators
- ✅ Mark chapters as complete
- 📊 View course completion statistics
- 🏷️ Filter courses by department and bank
- 📱 Responsive design for mobile and desktop

### For Admins
- 👥 User management (view all employees)
- 📖 Course creation and management
- 📝 Module and chapter organization
- 🎯 Assign courses to specific employees
- 📊 View platform-wide statistics
- 🏷️ Tag courses by department (IT, Ops, Onboarding, Risk, Product, Customer Service)
- 🏦 Tag courses by bank (SSFB, CUB, ESAF)

### Content Types
Each chapter supports:
- 📄 **Documents**: Rich text content with formatting
- 🎥 **Videos**: Video URLs with player integration
- 🖼️ **Mixed**: Combination of text, images, and videos

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Custom CSS with beautiful design
- Framer Motion for animations
- Context API for state management

## Project Structure

```
training-platform/
├── backend/
│   ├── models/
│   │   ├── User.js           # User/Employee model
│   │   ├── Course.js         # Course model
│   │   ├── Module.js         # Module model
│   │   └── Chapter.js        # Chapter model
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── moduleController.js
│   │   ├── chapterController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js           # JWT authentication
│   ├── routes/
│   │   └── api.js            # All API routes
│   ├── server.js             # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── CourseList.jsx
    │   │   ├── CourseDetail.jsx
    │   │   ├── ModuleDetail.jsx
    │   │   ├── ChapterView.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminCourses.jsx
    │   │   └── AdminUsers.jsx
    │   ├── App.jsx
    │   ├── App.css
    │   └── index.js
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd training-platform/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/training-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Start MongoDB:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud)
```

6. Start the backend server:
```bash
npm start

# For development with auto-reload
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd training-platform/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the React development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Default Admin Account

Create an admin account by registering with:
- Email: admin@company.com
- Password: admin123
- Department: IT
- Bank: All
- Role: admin (set in registration)

Or use the API directly:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@company.com",
    "password": "admin123",
    "department": "IT",
    "bank": "All",
    "role": "admin"
  }'
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (admin only)
- `PUT /api/courses/:id` - Update course (admin only)
- `DELETE /api/courses/:id` - Delete course (admin only)
- `POST /api/courses/:id/assign` - Assign course to users (admin only)
- `GET /api/courses/:id/progress` - Get course progress

### Modules
- `GET /api/courses/:courseId/modules` - Get modules for a course
- `POST /api/courses/:courseId/modules` - Create module (admin only)
- `GET /api/modules/:id` - Get single module
- `PUT /api/modules/:id` - Update module (admin only)
- `DELETE /api/modules/:id` - Delete module (admin only)

### Chapters
- `GET /api/modules/:moduleId/chapters` - Get chapters for a module
- `POST /api/modules/:moduleId/chapters` - Create chapter (admin only)
- `GET /api/chapters/:id` - Get single chapter
- `PUT /api/chapters/:id` - Update chapter (admin only)
- `DELETE /api/chapters/:id` - Delete chapter (admin only)
- `POST /api/chapters/:id/complete` - Mark chapter as complete
- `POST /api/chapters/:id/uncomplete` - Unmark chapter as complete

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/progress` - Get user's learning progress

## Usage Guide

### Creating a Course (Admin)

1. Login as admin
2. Navigate to Admin Panel → Manage Courses
3. Click "Create Course"
4. Fill in:
   - Course title
   - Description
   - Select department tag
   - Select bank tag
5. Click "Create Course"

### Adding Modules to a Course (Admin)

Use the API to create modules:
```bash
curl -X POST http://localhost:5000/api/courses/{courseId}/modules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Banking",
    "description": "Learn the basics of banking operations",
    "order": 1
  }'
```

### Adding Chapters to a Module (Admin)

```bash
curl -X POST http://localhost:5000/api/modules/{moduleId}/chapters \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "What is Banking?",
    "order": 1,
    "contentType": "document",
    "content": {
      "text": "Banking is the business of accepting deposits...",
      "videoUrl": "",
      "images": []
    },
    "estimatedDuration": 10
  }'
```

### Assigning Courses to Employees (Admin)

1. Go to Admin Panel → Manage Users
2. Click "Assign Courses" on a user
3. Select courses from the list
4. Click "Assign X Courses"

### Employee Learning Flow

1. Login to the platform
2. View assigned courses on Dashboard
3. Click on a course to see modules
4. Click on a module to see chapters
5. Click on a chapter to view content
6. Mark chapter as complete when finished
7. Progress is automatically tracked

## Database Schema

### User
- name, email, password
- role: employee | admin
- department: IT | Ops | Onboarding | Risk | Product | Customer Service
- bank: SSFB | CUB | ESAF | All
- assignedCourses: [Course IDs]
- completedChapters: [Chapter IDs]
- completedModules: [Module IDs]
- completedCourses: [Course IDs]

### Course
- title, description, thumbnail
- tags: { department, bank }
- modules: [Module IDs]
- assignedTo: [User IDs]
- createdBy: User ID

### Module
- title, description
- course: Course ID
- order: Number
- chapters: [Chapter IDs]

### Chapter
- title, order
- module: Module ID
- contentType: document | video | mixed
- content: { text, videoUrl, images }
- estimatedDuration: Number (minutes)
- completedBy: [{ user, completedAt }]

## Deployment

### Backend Deployment (Heroku Example)

1. Create a Heroku app:
```bash
heroku create your-training-platform-api
```

2. Add MongoDB Atlas:
```bash
heroku addons:create mongolab
```

3. Set environment variables:
```bash
heroku config:set JWT_SECRET=your-production-secret
heroku config:set NODE_ENV=production
```

4. Deploy:
```bash
git subtree push --prefix backend heroku master
```

### Frontend Deployment (Vercel Example)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd frontend
vercel --prod
```

3. Set environment variable:
```
REACT_APP_API_URL=https://your-training-platform-api.herokuapp.com/api
```

## Future Enhancements

- [ ] File upload for course thumbnails
- [ ] Video hosting integration (YouTube, Vimeo)
- [ ] Quiz and assessment features
- [ ] Certificates on course completion
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Discussion forums per course
- [ ] Peer review system
- [ ] Gamification (badges, leaderboards)

## License

MIT License - Feel free to use this for your organization!

## Support

For issues or questions, please create an issue in the repository or contact the development team.
"# learnpoint" 
