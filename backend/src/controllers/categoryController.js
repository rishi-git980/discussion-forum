import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    console.log('Fetching categories...');
    const categories = await Category.find();
    console.log('Found categories:', categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      slug: cat.slug
    })));
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/id/:id or /api/categories/slug/:slug
// @access  Public
export const getCategory = async (req, res) => {
  try {
    let category;
    if (req.params.id) {
      // Try to find category by ID
      category = await Category.findById(req.params.id);
    } else if (req.params.slug) {
      // Try to find category by slug
      category = await Category.findOne({ slug: req.params.slug });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error in getCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
export const createCategory = async (req, res) => {
  try {
    console.log('Creating category with data:', req.body);
    const category = await Category.create(req.body);
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error in createCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error in updateCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
}; 