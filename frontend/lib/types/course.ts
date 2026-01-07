export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Instructor {
  id: string;
  fullName: string;
  email: string;
  bio?: string;
  avatar?: string;
  expertise?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  price: number;
  isFree: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration?: number;
  language: string;
  featured: boolean;
  isOngoing: boolean;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  instructorId: string;
  categoryId: string;
  instructor?: Instructor;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  course?: Course;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  maxAttempts?: number;
  passingScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  description: string;
  dueDate?: string;
  maxScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

