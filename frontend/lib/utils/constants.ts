export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    UPDATE_PAYMENT_PREFERENCE: '/auth/profile/payment-preference',
  },
  // Admin
  ADMIN: {
    USERS: '/admin/users',
    USER_BY_ID: (id: string) => `/admin/users/${id}`,
    BLOCK_USER: '/admin/users/block',
    UNBLOCK_USER: '/admin/users/unblock',
  },
  // Courses
  COURSES: {
    LIST: '/courses',
    FILTER: '/courses/filter',
    ONGOING: '/courses/ongoing',
    BY_ID: (id: string) => `/courses/${id}`,
  },
  // Enrollments
  ENROLLMENTS: {
    LIST: '/enrollments',
    CREATE: '/enrollments',
    BY_ID: (id: string) => `/enrollments/${id}`,
    PROGRESS: (id: string) => `/enrollments/${id}/progress`,
  },
  // Payments
  PAYMENTS: {
    CREATE: '/payments',
    VERIFY: '/payments/verify',
    HISTORY: '/payments/history',
    BY_ID: (id: string) => `/payments/${id}`,
  },
  // Payment Analytics
  PAYMENT_ANALYTICS: {
    ANALYTICS: '/payment-analytics',
    TRENDS: '/payment-analytics/trends',
    TOP_METHODS: '/payment-analytics/top-methods',
  },
  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart',
    REMOVE: (id: string) => `/cart/${id}`,
    CLEAR: '/cart',
    APPLY_COUPON: '/cart/apply-coupon',
  },
  // Coupons
  COUPONS: {
    VALIDATE: '/coupons/validate',
    ACTIVE: '/coupons/active',
    LIST: '/coupons',
    BY_ID: (id: string) => `/coupons/${id}`,
  },
  // Categories
  CATEGORIES: {
    LIST: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
  },
  // Instructors
  INSTRUCTORS: {
    LIST: '/instructors',
    BY_ID: (id: string) => `/instructors/${id}`,
  },
  // Blog
  BLOG: {
    LIST: '/blogs',
    BY_ID: (id: string) => `/blogs/${id}`,
    COMMENTS: (id: string) => `/blogs/${id}/comments`,
  },
  // Gallery
  GALLERY: {
    LIST: '/gallery',
    BY_ID: (id: string) => `/gallery/${id}`,
  },
  // Testimonials
  TESTIMONIALS: {
    LIST: '/testimonials',
    BY_ID: (id: string) => `/testimonials/${id}`,
  },
  // Consultations
  CONSULTATIONS: {
    CREATE: '/consultations',
    LIST: '/consultations',
    BY_ID: (id: string) => `/consultations/${id}`,
  },
  // Contact
  CONTACT: {
    CREATE: '/contact',
    LIST: '/contact',
    BY_ID: (id: string) => `/contact/${id}`,
  },
  // Newsletter
  NEWSLETTER: {
    SUBSCRIBE: '/newsletter/subscribe',
    LIST: '/newsletter',
  },
  // Wishlist
  WISHLIST: {
    LIST: '/wishlist',
    ADD: '/wishlist',
    REMOVE: (id: string) => `/wishlist/${id}`,
  },
  // Products
  PRODUCTS: {
    LIST: '/products',
    BY_ID: (id: string) => `/products/${id}`,
  },
  // Orders
  ORDERS: {
    LIST: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
  },
  // Live Classes
  LIVE_CLASSES: {
    LIST: '/live-classes',
    BY_ID: (id: string) => `/live-classes/${id}`,
  },
  // Events
  EVENTS: {
    LIST: '/events',
    BY_ID: (id: string) => `/events/${id}`,
  },
  // FAQs
  FAQS: {
    LIST: '/faqs',
    BY_ID: (id: string) => `/faqs/${id}`,
  },
  // Certificates
  CERTIFICATES: {
    LIST: '/certificates',
    BY_ID: (id: string) => `/certificates/${id}`,
  },
  // Progress
  PROGRESS: {
    LIST: '/progress',
    BY_ID: (id: string) => `/progress/${id}`,
  },
  // Lessons
  LESSONS: {
    LIST: '/lessons',
    BY_ID: (id: string) => `/lessons/${id}`,
  },
  // Quizzes
  QUIZZES: {
    LIST: '/quizzes',
    BY_ID: (id: string) => `/quizzes/${id}`,
    SUBMIT: (id: string) => `/quizzes/${id}/submit`,
  },
  // Assignments
  ASSIGNMENTS: {
    LIST: '/assignments',
    BY_ID: (id: string) => `/assignments/${id}`,
    SUBMIT: (id: string) => `/assignments/${id}/submit`,
  },
  // Reviews
  REVIEWS: {
    LIST: '/reviews',
    CREATE: '/reviews',
    BY_ID: (id: string) => `/reviews/${id}`,
  },
  // Student Success
  STUDENT_SUCCESS: {
    LIST: '/student-success',
    BY_ID: (id: string) => `/student-success/${id}`,
  },
  // Affiliates
  AFFILIATES: {
    LIST: '/affiliates',
    BY_ID: (id: string) => `/affiliates/${id}`,
  },
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
  },
  // Audit Logs
  AUDIT_LOGS: {
    LIST: '/audit-logs',
  },
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  COURSES: '/courses',
  CONSULTATION: '/consultation',
  LIVE_CLASSES: '/live-classes',
  VASTU_PRODUCT: '/vastu-product',
  EVENTS: '/events',
  BLOG: '/blog',
  BLOGS: '/blog',
  GALLERY: '/gallery',
  CONTACT: '/contact',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  AFFILIATE: '/affiliate',
};

