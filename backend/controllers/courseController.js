const Course = require('../models/Course');
const Module = require('../models/Module');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    let query = {};
    
    // If employee, show only assigned courses
    if (req.user.role === 'employee') {
      query._id = { $in: req.user.assignedCourses };
    }

    const courses = await Course.find(query)
      .populate('modules')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'modules',
        populate: {
          path: 'chapters'
        }
      })
      .populate('createdBy', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin only)
exports.createCourse = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin only)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin only)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete all modules and chapters associated with this course
    await Module.deleteMany({ course: req.params.id });
    await course.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Assign course to employees
// @route   POST /api/courses/:id/assign
// @access  Private (Admin only)
exports.assignCourse = async (req, res) => {
  try {
    const { userIds } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Add users to course
    course.assignedTo = [...new Set([...course.assignedTo, ...userIds])];
    await course.save();

    // Add course to users
    await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { assignedCourses: course._id } }
    );

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get course progress for current user
// @route   GET /api/courses/:id/progress
// @access  Private
exports.getCourseProgress = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'modules',
        populate: {
          path: 'chapters'
        }
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const user = await User.findById(req.user.id);
    
    const totalChapters = course.modules.reduce((total, module) => {
      return total + module.chapters.length;
    }, 0);

    const completedChaptersInCourse = course.modules.reduce((total, module) => {
      const completedInModule = module.chapters.filter(chapter => 
        user.completedChapters.includes(chapter._id)
      ).length;
      return total + completedInModule;
    }, 0);

    const progress = totalChapters > 0 ? (completedChaptersInCourse / totalChapters) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalChapters,
        completedChapters: completedChaptersInCourse,
        progress: Math.round(progress)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
