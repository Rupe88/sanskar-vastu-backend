import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Get all instructors
 */
export const getAllInstructors = async (req, res, next) => {
  try {
    const { featured } = req.query;
    
    const where = {};
    if (featured === 'true') {
      where.featured = true;
    }

    const instructors = await prisma.instructor.findMany({
      where,
      include: {
        _count: {
          select: {
            courses: true,
            liveClasses: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({
      success: true,
      data: instructors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get instructor by ID or slug
 */
export const getInstructorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const instructor = await prisma.instructor.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        courses: {
          where: {
            status: 'PUBLISHED',
          },
          take: 10,
        },
        liveClasses: {
          where: {
            status: {
              in: ['SCHEDULED', 'LIVE'],
            },
          },
          take: 10,
        },
      },
    });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found',
      });
    }

    res.json({
      success: true,
      data: instructor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create instructor (Admin only)
 */
export const createInstructor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      name,
      slug,
      image,
      bio,
      designation,
      specialization,
      email,
      phone,
      socialLinks,
      featured,
      order,
    } = req.body;

    const instructor = await prisma.instructor.create({
      data: {
        name,
        slug,
        image: req.cloudinary?.url || image,
        bio,
        designation,
        specialization,
        email,
        phone,
        socialLinks: socialLinks ? JSON.parse(socialLinks) : null,
        featured: featured || false,
        order: order || 0,
      },
    });

    res.status(201).json({
      success: true,
      data: instructor,
      message: 'Instructor created successfully',
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Instructor with this slug already exists',
      });
    }
    next(error);
  }
};

/**
 * Update instructor (Admin only)
 */
export const updateInstructor = async (req, res, next) => {
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
      name,
      slug,
      image,
      bio,
      designation,
      specialization,
      email,
      phone,
      socialLinks,
      featured,
      order,
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (req.cloudinary?.url || image) {
      updateData.image = req.cloudinary?.url || image;
    }
    if (bio !== undefined) updateData.bio = bio;
    if (designation !== undefined) updateData.designation = designation;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (socialLinks !== undefined) {
      updateData.socialLinks = typeof socialLinks === 'string' 
        ? JSON.parse(socialLinks) 
        : socialLinks;
    }
    if (featured !== undefined) updateData.featured = featured;
    if (order !== undefined) updateData.order = order;

    const instructor = await prisma.instructor.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: instructor,
      message: 'Instructor updated successfully',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found',
      });
    }
    next(error);
  }
};

/**
 * Delete instructor (Admin only)
 */
export const deleteInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if instructor has courses
    const courseCount = await prisma.course.count({
      where: { instructorId: id },
    });

    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete instructor with associated courses',
      });
    }

    await prisma.instructor.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Instructor deleted successfully',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found',
      });
    }
    next(error);
  }
};


