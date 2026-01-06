import { prisma } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Prevent admin from blocking themselves
  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot block your own account',
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Prevent blocking other admins
  if (user.role === 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Cannot block admin users',
    });
  }

  if (!user.isActive) {
    return res.status(400).json({
      success: false,
      message: 'User is already blocked',
    });
  }

  // Block user and invalidate refresh token
  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      refreshToken: null,
    },
  });

  res.json({
    success: true,
    message: 'User blocked successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isActive: false,
      },
    },
  });
});

export const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  if (user.isActive) {
    return res.status(400).json({
      success: false,
      message: 'User is already active',
    });
  }

  // Unblock user
  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: true,
    },
  });

  res.json({
    success: true,
    message: 'User unblocked successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isActive: true,
      },
    },
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  const where = {
    ...(search && {
      OR: [
        { email: { contains: search } },
        { fullName: { contains: search } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.json({
    success: true,
    data: {
      user,
    },
  });
});

