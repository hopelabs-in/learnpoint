const Chapter = require('../models/Chapter');
const Module = require('../models/Module');
const User = require('../models/User');

// @desc    Create chapter
// @route   POST /api/modules/:moduleId/chapters
// @access  Private (Admin only)
exports.createChapter = async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    req.body.module = req.params.moduleId;

    const chapter = await Chapter.create(req.body);

    // Add chapter to module
    module.chapters.push(chapter._id);
    await module.save();

    res.status(201).json({
      success: true,
      data: chapter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all chapters for a module
// @route   GET /api/modules/:moduleId/chapters
// @access  Private
exports.getChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find({ module: req.params.moduleId })
      .sort('order');

    res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single chapter
// @route   GET /api/chapters/:id
// @access  Private
exports.getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
      .populate('module');

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Check if user has completed this chapter
    const user = await User.findById(req.user.id);
    const isCompleted = user.completedChapters.includes(chapter._id);

    res.status(200).json({
      success: true,
      data: {
        ...chapter.toObject(),
        isCompleted
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update chapter
// @route   PUT /api/chapters/:id
// @access  Private (Admin only)
exports.updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    res.status(200).json({
      success: true,
      data: chapter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete chapter
// @route   DELETE /api/chapters/:id
// @access  Private (Admin only)
exports.deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Remove chapter from module
    await Module.findByIdAndUpdate(
      chapter.module,
      { $pull: { chapters: chapter._id } }
    );

    await chapter.deleteOne();

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

// @desc    Mark chapter as complete
// @route   POST /api/chapters/:id/complete
// @access  Private
exports.completeChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    const user = await User.findById(req.user.id);

    // Check if already completed
    if (user.completedChapters.includes(chapter._id)) {
      return res.status(400).json({
        success: false,
        message: 'Chapter already completed'
      });
    }

    // Add to user's completed chapters
    user.completedChapters.push(chapter._id);

    // Add to chapter's completedBy array
    chapter.completedBy.push({
      user: user._id,
      completedAt: new Date()
    });

    await user.save();
    await chapter.save();

    // Check if all chapters in the module are completed
    const module = await Module.findById(chapter.module).populate('chapters');
    const allChaptersCompleted = module.chapters.every(ch =>
      user.completedChapters.includes(ch._id)
    );

    if (allChaptersCompleted && !user.completedModules.includes(module._id)) {
      user.completedModules.push(module._id);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Chapter marked as complete',
      data: {
        chapterId: chapter._id,
        moduleCompleted: allChaptersCompleted
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Unmark chapter as complete
// @route   POST /api/chapters/:id/uncomplete
// @access  Private
exports.uncompleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    const user = await User.findById(req.user.id);

    // Remove from user's completed chapters
    user.completedChapters = user.completedChapters.filter(
      id => id.toString() !== chapter._id.toString()
    );

    // Remove from chapter's completedBy array
    chapter.completedBy = chapter.completedBy.filter(
      item => item.user.toString() !== user._id.toString()
    );

    await user.save();
    await chapter.save();

    res.status(200).json({
      success: true,
      message: 'Chapter unmarked as complete'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
