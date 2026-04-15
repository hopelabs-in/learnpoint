const Module = require('../models/Module');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Create module
// @route   POST /api/courses/:courseId/modules
// @access  Private (Admin only)
exports.createModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    req.body.course = req.params.courseId;

    const module = await Module.create(req.body);

    // Add module to course
    course.modules.push(module._id);
    await course.save();

    res.status(201).json({
      success: true,
      data: module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all modules for a course
// @route   GET /api/courses/:courseId/modules
// @access  Private
exports.getModules = async (req, res) => {
  try {
    const modules = await Module.find({ course: req.params.courseId })
      .populate('chapters')
      .sort('order');

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single module
// @route   GET /api/modules/:id
// @access  Private
exports.getModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('chapters')
      .populate('course');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.status(200).json({
      success: true,
      data: module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Private (Admin only)
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.status(200).json({
      success: true,
      data: module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Private (Admin only)
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Remove module from course
    await Course.findByIdAndUpdate(
      module.course,
      { $pull: { modules: module._id } }
    );

    await module.deleteOne();

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

// @desc    Check if module is completed by user
// @route   GET /api/modules/:id/completion
// @access  Private
exports.checkModuleCompletion = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate('chapters');
    const user = await User.findById(req.user.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const allChaptersCompleted = module.chapters.every(chapter =>
      user.completedChapters.includes(chapter._id)
    );

    if (allChaptersCompleted && !user.completedModules.includes(module._id)) {
      user.completedModules.push(module._id);
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: {
        completed: allChaptersCompleted,
        totalChapters: module.chapters.length,
        completedChapters: module.chapters.filter(chapter =>
          user.completedChapters.includes(chapter._id)
        ).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
