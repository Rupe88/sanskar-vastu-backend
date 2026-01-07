import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Get all categories
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    
    const where = {};
    if (type) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            courses: true,
            blogs: true,
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID or slug
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        parent: true,
        children: true,
        courses: {
          where: {
            status: 'PUBLISHED',
          },
          take: 10,
        },
        blogs: {
          where: {
            status: 'PUBLISHED',
          },
          take: 10,
        },
        products: {
          where: {
            status: 'ACTIVE',
          },
          take: 10,
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create category (Admin only)
 */
export const createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, slug, description, image, type, parentId } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        type,
        parentId,
      },
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Category with this slug already exists',
      });
    }
    next(error);
  }
};

/**
 * Update category (Admin only)
 */
export const updateCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { name, slug, description, image, type, parentId } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        type,
        parentId,
      },
    });

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    next(error);
  }
};

/**
 * Delete category (Admin only)
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    next(error);
  }
};


