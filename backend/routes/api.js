const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Controllers
const {
  register,
  login,
  getMe
} = require('../controllers/authController');

const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  assignCourse,
  getCourseProgress
} = require('../controllers/courseController');

const {
  createModule,
  getModules,
  getModule,
  updateModule,
  deleteModule,
  checkModuleCompletion
} = require('../controllers/moduleController');

const {
  createChapter,
  getChapters,
  getChapter,
  updateChapter,
  deleteChapter,
  completeChapter,
  uncompleteChapter
} = require('../controllers/chapterController');

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserProgress
} = require('../controllers/userController');

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);

// Course routes
router.route('/courses')
  .get(protect, getCourses)
  .post(protect, authorize('admin'), createCourse);

router.route('/courses/:id')
  .get(protect, getCourse)
  .put(protect, authorize('admin'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

router.post('/courses/:id/assign', protect, authorize('admin'), assignCourse);
router.get('/courses/:id/progress', protect, getCourseProgress);

// Module routes
router.route('/courses/:courseId/modules')
  .get(protect, getModules)
  .post(protect, authorize('admin'), createModule);

router.route('/modules/:id')
  .get(protect, getModule)
  .put(protect, authorize('admin'), updateModule)
  .delete(protect, authorize('admin'), deleteModule);

router.get('/modules/:id/completion', protect, checkModuleCompletion);

// Chapter routes
router.route('/modules/:moduleId/chapters')
  .get(protect, getChapters)
  .post(protect, authorize('admin'), createChapter);

router.route('/chapters/:id')
  .get(protect, getChapter)
  .put(protect, authorize('admin'), updateChapter)
  .delete(protect, authorize('admin'), deleteChapter);

router.post('/chapters/:id/complete', protect, completeChapter);
router.post('/chapters/:id/uncomplete', protect, uncompleteChapter);

// User routes (Admin only)
router.route('/users')
  .get(protect, authorize('admin'), getUsers);

router.route('/users/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.get('/users/:id/progress', protect, getUserProgress);

module.exports = router;
