# Changelog

## Version 1.4 - Rich Content Editor & Production Ready

### 🎨 Major New Features

#### 1. **Rich Chapter Content Editor** (HUGE!)
- **Dedicated full-page editor** for creating chapter content
- **Features:**
  - Live Preview with split-screen
  - Text formatting toolbar (Bold, Italic, Headings, Lists, Code, Quotes, Links)
  - Image management with captions
  - Video support (YouTube, Vimeo, direct URLs)
  - Markdown-like syntax
  - Real-time preview
  
#### 2. **Course Thumbnail Support** 🖼️
- Add thumbnail images to courses
- Display everywhere (Dashboard, Course List, Admin)
- URL-based image upload

#### 3. **Complete Deployment Roadmap** 📚
- New DEPLOYMENT.md file
- 50+ page comprehensive guide
- Step-by-step instructions
- Multiple platform options
- Cost estimates
- Troubleshooting
- 45-minute deployment timeline

---

## Version 1.2 - Admin User Progress Tracking

### New Features

#### 🎯 User Progress Tracking in Admin Panel
- **"View Progress" button** added to Manage Users section
- Click to see detailed learning progress for any user
- Shows comprehensive progress modal with:
  - **Summary Statistics**: Total courses, completed courses, in-progress courses
  - **Course-by-Course Breakdown**: Individual progress for each assigned course
  - **Visual Progress Bars**: Color-coded bars showing completion percentage
  - **Completion Badges**: Green "✓ Completed" badge for finished courses
  - **Chapter Counts**: Shows X/Y chapters completed for each course
  - **Remaining Chapters**: Displays how many chapters left to complete

#### UI Improvements
- Beautiful gradient stat cards (Total, Completed, In Progress)
- Real-time progress data fetched from API
- Loading state while fetching progress
- Scrollable course list for users with many assignments
- Empty state with "Assign Courses" button if no courses assigned
- Close button (✕) in modal header

### Technical Details

**New API Usage:**
- `GET /api/users/:id/progress` - Fetches detailed user learning progress
- Returns aggregated data: courses, chapters completed, percentages

**Frontend Components:**
- Added progress modal to AdminUsers page
- State management for loading and displaying progress data
- Conditional rendering based on progress state

---

## Version 1.1

## Updates & Fixes

### 1. ✅ Chapter Page Sidebar Navigation
- Added collapsible sidebar to chapter view page
- Shows full course structure with all modules and chapters
- Visual indicators for completed chapters (checkmarks)
- Easy navigation between chapters
- Highlights current chapter
- Toggle button to show/hide sidebar
- Progress bar showing overall course completion

### 2. ✅ Course Edit Functionality  
- Added full edit capability for courses in Admin panel
- Click "Edit" button on any course card
- Modal opens with pre-filled course data
- Update title, description, department, or bank
- Changes saved immediately to database

### 3. ✅ Multiple Banks per User
**Backend Changes:**
- Changed `bank` field to `banks` array in User model
- Updated all controllers to handle array of banks
- Seed data updated with multiple banks per user

**Frontend Changes:**
- Login/Registration now uses checkboxes for bank selection
- Users can select multiple banks (SSFB, CUB, ESAF, All)
- Admin user table displays all assigned banks as tags

### 4. ✅ Progress Bar Updates
- Dashboard now shows real-time progress for each course
- Progress calculated from actual chapter completion
- Stats cards (Total, In Progress, Completed) update correctly
- Progress bars animate to show percentage
- Color coding: 
  - Green for 100% complete
  - Orange for in progress
  - Shows exact percentage on hover

### 5. ✅ Module Completion Indicators
- Completed modules show "✓ Completed" badge on course page
- Badge appears when all chapters in module are marked complete
- Green badge with checkmark for visual clarity
- Modules update in real-time as chapters are completed

### 6. ✅ Branding Update
- Changed all "LearnHub" references to "LearnPoint"
- Updated in:
  - Login page
  - Navigation bar
  - Documentation (README, QUICKSTART)
  - HTML title tags
  - All user-facing text

## Technical Changes

### Database Schema
```javascript
// Before
bank: { type: String, enum: ['SSFB', 'CUB', 'ESAF', 'All'] }

// After  
banks: [{ type: String, enum: ['SSFB', 'CUB', 'ESAF', 'All'] }]
```

### API Updates
- `POST /api/auth/register` - Now accepts `banks` array
- `POST /api/auth/login` - Returns `banks` array in user object
- User responses now include `banks` instead of `bank`

### New Features
- Sidebar navigation component in chapter view
- Real-time progress calculation across the application
- Edit modal for courses with state management
- Multiple bank selection with checkboxes

## Migration Notes

If you have existing data, you need to migrate the `bank` field to `banks`:

```javascript
// MongoDB migration script
db.users.updateMany(
  {},
  [
    {
      $set: {
        banks: { $cond: { if: { $isArray: "$bank" }, then: "$bank", else: ["$bank"] } }
      }
    },
    {
      $unset: "bank"
    }
  ]
);
```

Or simply re-run the seed script:
```bash
node backend/seedData.js
```

## Breaking Changes

⚠️ **Important**: The `bank` field has been changed to `banks` (array). 

If you have existing frontend code making API calls, update:
```javascript
// Before
{ bank: 'SSFB' }

// After
{ banks: ['SSFB'] }
```

## Version Compatibility

- Node.js: v16+
- MongoDB: v5+
- React: 18.2.0
- Express: 4.18.2

## Next Release (Planned)

- Module and chapter creation UI in admin panel
- Bulk course assignment
- Export user progress reports
- Course duplication feature
- Rich text editor for chapter content
