const User = require('../models/User');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('assignedCourses', 'title')
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'assignedCourses',
        populate: {
          path: 'modules',
          populate: {
            path: 'chapters'
          }
        }
      })
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

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

// @desc    Get user's learning progress
// @route   GET /api/users/:id/progress
// @access  Private (Admin or Own Profile)
exports.getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'assignedCourses',
        populate: {
          path: 'modules',
          populate: {
            path: 'chapters'
          }
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const progressData = user.assignedCourses.map(course => {
      const totalChapters = course.modules.reduce((total, module) => {
        return total + module.chapters.length;
      }, 0);

      const completedChapters = course.modules.reduce((total, module) => {
        const completed = module.chapters.filter(chapter =>
          user.completedChapters.includes(chapter._id)
        ).length;
        return total + completed;
      }, 0);

      const progress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

      return {
        courseId: course._id,
        courseTitle: course.title,
        totalChapters,
        completedChapters,
        progress: Math.round(progress),
        isCompleted: user.completedCourses.includes(course._id)
      };
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          department: user.department,
          banks: user.banks
        },
        courses: progressData,
        totalCoursesAssigned: user.assignedCourses.length,
        totalCoursesCompleted: user.completedCourses.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
