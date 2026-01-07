import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Get all courses with filtering
 */
export const getAllCourses = async (req, res, next) => {
  try {
    const {
      status,
      featured,
      isOngoing,
      instructorId,
      categoryId,
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) where.status = status;
    if (featured === 'true') where.featured = true;
    if (isOngoing === 'true') where.isOngoing = true;
    if (instructorId) where.instructorId = instructorId;
    if (categoryId) where.categoryId = categoryId;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: true,
          category: true,
          _count: {
            select: {
              enrollments: true,
              lessons: true,
              reviews: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.course.count({ where }),
    ]);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Filter courses with advanced options
 */
export const filterCourses = async (req, res, next) => {
  try {
    const {
      category,
      level,
      minPrice,
      maxPrice,
      minRating,
      tags,
      isOngoing,
      featured,
      instructor,
      search,
      sortBy = 'newest',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      status: 'PUBLISHED',
    };

    // Category filter
    if (category) {
      const categoryRecord = await prisma.category.findFirst({
        where: {
          OR: [
            { id: category },
            { slug: category },
          ],
        },
      });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      }
    }

    // Level filter
    if (level) {
      where.level = level;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (minRating) {
      where.rating = {
        gte: parseFloat(minRating),
      };
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      where.tags = {
        contains: tagArray.join(','),
      };
    }

    // Ongoing filter
    if (isOngoing === 'true') {
      where.isOngoing = true;
    }

    // Featured filter
    if (featured === 'true') {
      where.featured = true;
    }

    // Instructor filter
    if (instructor) {
      where.instructorId = instructor;
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Sort options
    let orderBy = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: order };
        break;
      case 'oldest':
        orderBy = { createdAt: order === 'desc' ? 'asc' : 'desc' };
        break;
      case 'price':
        orderBy = { price: order };
        break;
      case 'rating':
        orderBy = { rating: order };
        break;
      case 'popularity':
      case 'enrollments':
        orderBy = { totalEnrollments: order };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: true,
          category: true,
          _count: {
            select: {
              enrollments: true,
              lessons: true,
              reviews: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy,
      }),
      prisma.course.count({ where }),
    ]);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ongoing courses
 */
export const getOngoingCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: {
          status: 'PUBLISHED',
          isOngoing: true,
        },
        include: {
          instructor: true,
          category: true,
          _count: {
            select: {
              enrollments: true,
              lessons: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          startDate: 'desc',
        },
      }),
      prisma.course.count({
        where: {
          status: 'PUBLISHED',
          isOngoing: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get course by ID or slug
 */
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        instructor: true,
        category: true,
        lessons: {
          orderBy: {
            order: 'asc',
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profileImage: true,
              },
            },
          },
          take: 10,
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create course (Admin only)
 */
export const createCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      title,
      slug,
      description,
      shortDescription,
      thumbnail,
      price,
      isFree,
      status,
      level,
      duration,
      language,
      featured,
      isOngoing,
      startDate,
      endDate,
      tags,
      instructorId,
      categoryId,
    } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        shortDescription,
        thumbnail: req.cloudinary?.url || thumbnail,
        price: price ? parseFloat(price) : 0,
        isFree: isFree || false,
        status: status || 'DRAFT',
        level,
        duration: duration ? parseInt(duration) : null,
        language: language || 'en',
        featured: featured || false,
        isOngoing: isOngoing || false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        tags,
        instructorId,
        categoryId,
      },
      include: {
        instructor: true,
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully',
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Course with this slug already exists',
      });
    }
    next(error);
  }
};

/**
 * Update course (Admin only)
 */
export const updateCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const {
      title,
      slug,
      description,
      shortDescription,
      thumbnail,
      price,
      isFree,
      status,
      level,
      duration,
      language,
      featured,
      isOngoing,
      startDate,
      endDate,
      tags,
      instructorId,
      categoryId,
    } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (req.cloudinary?.url || thumbnail) {
      updateData.thumbnail = req.cloudinary?.url || thumbnail;
    }
    if (price !== undefined) updateData.price = parseFloat(price);
    if (isFree !== undefined) updateData.isFree = isFree;
    if (status) updateData.status = status;
    if (level !== undefined) updateData.level = level;
    if (duration !== undefined) updateData.duration = duration ? parseInt(duration) : null;
    if (language) updateData.language = language;
    if (featured !== undefined) updateData.featured = featured;
    if (isOngoing !== undefined) updateData.isOngoing = isOngoing;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (tags !== undefined) updateData.tags = tags;
    if (instructorId) updateData.instructorId = instructorId;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        instructor: true,
        category: true,
      },
    });

    res.json({
      success: true,
      data: course,
      message: 'Course updated successfully',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
    next(error);
  }
};

/**
 * Delete course (Admin only)
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.course.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
    next(error);
  }
};


