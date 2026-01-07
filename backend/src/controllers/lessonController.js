import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Get all lessons for a course
 */
export const getCourseLessons = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: {
            order: 'asc',
          },
          include: userId ? {
            progress: {
              where: {
                userId,
              },
            },
          } : false,
        },
        enrollments: userId ? {
          where: {
            userId,
            status: 'ACTIVE',
          },
        } : false,
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user has access (enrolled or preview)
    if (userId) {
      const isEnrolled = course.enrollments && course.enrollments.length > 0;
      const lessons = course.lessons.map(lesson => {
        if (!isEnrolled && !lesson.isPreview) {
          // Hide content for non-enrolled users
          return {
            ...lesson,
            videoUrl: null,
            content: null,
            attachmentUrl: null,
          };
        }
        return lesson;
      });

      res.json({
        success: true,
        data: {
          ...course,
          lessons,
        },
      });
    } else {
      // Public view - only preview lessons
      const lessons = course.lessons
        .filter(lesson => lesson.isPreview)
        .map(lesson => ({
          ...lesson,
          progress: undefined,
        }));

      res.json({
        success: true,
        data: {
          ...course,
          lessons,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get lesson by ID
 */
export const getLessonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            enrollments: userId ? {
              where: {
                userId,
                status: 'ACTIVE',
              },
            } : false,
          },
        },
        progress: userId ? {
          where: {
            userId,
          },
        } : false,
        quiz: true,
      },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Check access
    if (userId) {
      const isEnrolled = lesson.course.enrollments && lesson.course.enrollments.length > 0;
      if (!isEnrolled && !lesson.isPreview) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course to access this lesson',
        });
      }
    } else if (!lesson.isPreview) {
      return res.status(403).json({
        success: false,
        message: 'Please enroll in the course to access this lesson',
      });
    }

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create lesson (Admin only)
 */
export const createLesson = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      courseId,
      title,
      slug,
      description,
      content,
      videoUrl,
      videoDuration,
      attachmentUrl,
      lessonType,
      order,
      isPreview,
    } = req.body;

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        slug,
        description,
        content,
        videoUrl: req.cloudinary?.url || videoUrl,
        videoDuration: videoDuration ? parseInt(videoDuration) : null,
        attachmentUrl,
        lessonType: lessonType || 'VIDEO',
        order: order || 0,
        isPreview: isPreview || false,
      },
      include: {
        course: true,
      },
    });

    res.status(201).json({
      success: true,
      data: lesson,
      message: 'Lesson created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update lesson (Admin only)
 */
export const updateLesson = async (req, res, next) => {
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
      content,
      videoUrl,
      videoDuration,
      attachmentUrl,
      lessonType,
      order,
      isPreview,
    } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (req.cloudinary?.url || videoUrl) {
      updateData.videoUrl = req.cloudinary?.url || videoUrl;
    }
    if (videoDuration !== undefined) {
      updateData.videoDuration = videoDuration ? parseInt(videoDuration) : null;
    }
    if (attachmentUrl !== undefined) updateData.attachmentUrl = attachmentUrl;
    if (lessonType) updateData.lessonType = lessonType;
    if (order !== undefined) updateData.order = order;
    if (isPreview !== undefined) updateData.isPreview = isPreview;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
      include: {
        course: true,
      },
    });

    res.json({
      success: true,
      data: lesson,
      message: 'Lesson updated successfully',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }
    next(error);
  }
};

/**
 * Delete lesson (Admin only)
 */
export const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.lesson.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }
    next(error);
  }
};


