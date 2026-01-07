---
name: Complete LMS Backend Implementation (AcharyaRajababu.com Features - Updated)
overview: "Build comprehensive Learning Management System backend matching acharyarajababu.com: Course Management (admin-created instructors), Consultation System, Live Classes, Vastu Products E-commerce, Events, Blogs, Testimonials, Gallery, Affiliation Program, Course Filtering, Ongoing Courses tracking, and Cloudinary file uploads."
todos: []
---

# Complete LMS Backend Implementation Plan

## Based on acharyarajababu.com Features

## Current State Analysis

**What's Built:**

- Authentication & Authorization (JWT, OTP verification)
- User Management (Registration, Profile, Admin controls)
- Basic Admin Features (Block/Unblock users)

**What Needs to Be Built:**

### Core Features:

1. **Course Management** - Admin course creation with instructor info (image & details)
2. **Consultation System** - Consultation forms + Student success stories
3. **Live Classes** - Schedule, join, record live sessions
4. **Vastu Products** - E-commerce for products
5. **Events** - Event creation and registration
6. **Blogs** - Blog posts with categories and comments
7. **Testimonials** - Separate testimonials system
8. **Gallery** - Image gallery management
9. **Affiliation Program** - Become affiliate, tracking, commissions
10. **Course Filtering** - Advanced filtering system
11. **Ongoing Courses** - Track ongoing vs completed courses
12. **File Uploads** - Cloudinary integration for all media

## Phase 1: Database Schema Extension

### Update `prisma/schema.prisma`

```prisma
enum Role {
  USER          // Student
  ADMIN
  AFFILIATE     // Affiliate partner
}

enum CourseStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  ONGOING       // Course currently running
}

enum EnrollmentStatus {
  PENDING
  ACTIVE
  COMPLETED
  CANCELLED
}

enum LessonType {
  VIDEO
  TEXT
  PDF
  QUIZ
  ASSIGNMENT
}

enum ConsultationStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
}

enum LiveClassStatus {
  SCHEDULED
  LIVE
  COMPLETED
  CANCELLED
}

enum EventStatus {
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentMethod {
  ESEWA
  MOBILE_BANKING
  VISA_CARD
  MASTERCARD
  OTHER
}

enum CouponType {
  PERCENTAGE
  FIXED_AMOUNT
}

enum CouponStatus {
  ACTIVE
  INACTIVE
  EXPIRED
}

enum BlogStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum AffiliateStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

enum GalleryType {
  IMAGE
  VIDEO
}

// INSTRUCTORS (Managed by Admin, NOT users)
model Instructor {
  id              String      @id @default(uuid())
  name            String      @db.VarChar(255)
  slug            String      @unique @db.VarChar(255)
  image           String?     @db.VarChar(500) // Cloudinary URL
  bio             String?     @db.Text
  designation     String?     @db.VarChar(255) // e.g., "Vastu Expert", "Astrologer"
  specialization  String?     @db.VarChar(500) // Comma-separated
  email           String?     @db.VarChar(255)
  phone           String?     @db.VarChar(50)
  socialLinks     Json?       // {facebook, youtube, instagram, etc.}
  featured        Boolean     @default(false)
  order           Int         @default(0) // Display order
  
  courses         Course[]
  liveClasses     LiveClass[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([slug])
  @@index([featured])
  @@map("instructors")
}

// Categories for courses, blogs, products
model Category {
  id          String   @id @default(uuid())
  name        String   @db.VarChar(255)
  slug        String   @unique @db.VarChar(255)
  description String?  @db.Text
  image       String?  @db.VarChar(500) // Cloudinary URL
  type        String   @db.VarChar(50) // COURSE, BLOG, PRODUCT
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  courses     Course[]
  blogs       Blog[]
  products    Product[]
  
  @@index([slug])
  @@index([type])
  @@map("categories")
}

// Courses
model Course {
  id              String          @id @default(uuid())
  title           String          @db.VarChar(255)
  slug            String          @unique @db.VarChar(255)
  description     String?         @db.Text
  shortDescription String?        @db.VarChar(500)
  thumbnail       String?         @db.VarChar(500) // Cloudinary URL
  price           Decimal         @db.Decimal(10, 2) @default(0)
  isFree          Boolean         @default(false)
  status          CourseStatus    @default(DRAFT)
  level           String?         @db.VarChar(50) // Beginner, Intermediate, Advanced
  duration        Int?            // Total minutes
  language        String          @default("en") @db.VarChar(10)
  featured        Boolean         @default(false)
  isOngoing       Boolean         @default(false) // Track ongoing courses
  startDate       DateTime?       // Course start date (for ongoing tracking)
  endDate         DateTime?       // Course end date
  
  // Filtering fields
  tags            String?         @db.VarChar(500) // Comma-separated tags for filtering
  rating          Decimal?        @db.Decimal(3, 2) // Average rating
  totalRatings    Int             @default(0)
  totalEnrollments Int            @default(0)
  
  // Relations
  instructorId    String
  instructor      Instructor      @relation(fields: [instructorId], references: [id])
  categoryId      String?
  category        Category?       @relation(fields: [categoryId], references: [id])
  
  lessons         Lesson[]
  enrollments     Enrollment[]
  reviews         Review[]
  assignments     Assignment[]
  liveClasses     LiveClass[]
  certificates    Certificate[]
  payments        Payment[]
  affiliateEarnings AffiliateEarning[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([slug])
  @@index([instructorId])
  @@index([categoryId])
  @@index([status])
  @@index([featured])
  @@index([isOngoing])
  @@index([rating])
  @@index([tags]) // For tag-based filtering
  @@map("courses")
}

// Lessons/Content
model Lesson {
  id              String      @id @default(uuid())
  title           String      @db.VarChar(255)
  slug            String      @db.VarChar(255)
  description     String?     @db.Text
  content         String?     @db.Text
  videoUrl        String?     @db.VarChar(500) // Cloudinary video URL
  videoDuration   Int?        // Minutes
  attachmentUrl   String?     @db.VarChar(500) // Cloudinary PDF/document URL
  lessonType      LessonType  @default(VIDEO)
  order           Int         @default(0)
  isPreview       Boolean     @default(false)
  
  courseId        String
  course          Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  progress        LessonProgress[]
  quiz            Quiz?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@unique([courseId, slug])
  @@index([courseId])
  @@map("lessons")
}

// Enrollment System
model Enrollment {
  id              String          @id @default(uuid())
  userId          String
  user            User            @relation("UserEnrollments", fields: [userId], references: [id], onDelete: Cascade)
  courseId        String
  course          Course          @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  status          EnrollmentStatus @default(PENDING)
  progress        Int             @default(0) // Percentage 0-100
  completedAt     DateTime?
  affiliateId     String?         // Track which affiliate referred
  affiliate       User?           @relation("AffiliateEnrollments", fields: [affiliateId], references: [id])
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
  @@index([status])
  @@map("enrollments")
}

// Progress Tracking
model LessonProgress {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation("UserProgress", fields: [userId], references: [id], onDelete: Cascade)
  lessonId        String
  lesson          Lesson      @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  isCompleted     Boolean     @default(false)
  watchTime       Int         @default(0) // Seconds watched
  completedAt     DateTime?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@unique([userId, lessonId])
  @@index([userId])
  @@index([lessonId])
  @@map("lesson_progress")
}

// CONSULTATION SYSTEM
model Consultation {
  id              String              @id @default(uuid())
  name            String              @db.VarChar(255)
  email           String              @db.VarChar(255)
  phone           String              @db.VarChar(50)
  eventId         String?             // Link to event if selected
  event           Event?              @relation(fields: [eventId], references: [id])
  source          String?             @db.VarChar(100) // How did you find us
  message         String?             @db.Text
  status          ConsultationStatus  @default(PENDING)
  notes           String?             @db.Text // Admin notes
  respondedAt     DateTime?
  respondedBy     String?             // Admin user ID
  
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  
  @@index([status])
  @@index([email])
  @@map("consultations")
}

// STUDENT SUCCESS STORIES
model StudentSuccessStory {
  id              String      @id @default(uuid())
  studentName     String      @db.VarChar(255)
  studentImage    String?     @db.VarChar(500) // Cloudinary URL
  courseId        String?
  course          Course      @relation(fields: [courseId], references: [id])
  
  title           String      @db.VarChar(255) // e.g., "Got Job at XYZ"
  story           String      @db.Text
  achievement     String?     @db.VarChar(255) // e.g., "Passed", "Got Job", "Started Business"
  company         String?     @db.VarChar(255) // If got job
  position        String?     @db.VarChar(255) // Job position
  testimonial     String?     @db.Text
  
  isPublished     Boolean     @default(false)
  featured        Boolean     @default(false)
  order           Int         @default(0) // Display order
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([isPublished])
  @@index([featured])
  @@map("student_success_stories")
}

// TESTIMONIALS (Separate from success stories)
model Testimonial {
  id              String      @id @default(uuid())
  name            String      @db.VarChar(255)
  image           String?     @db.VarChar(500) // Cloudinary URL
  designation     String?     @db.VarChar(255) // e.g., "Student", "Course Graduate"
  company         String?     @db.VarChar(255)
  rating          Int         @default(5) // 1-5 stars
  comment         String      @db.Text
  courseId        String?     // Optional: link to specific course
  course          Course?     @relation(fields: [courseId], references: [id])
  
  isPublished     Boolean     @default(false)
  featured        Boolean     @default(false)
  order           Int         @default(0) // Display order
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([isPublished])
  @@index([featured])
  @@map("testimonials")
}

// GALLERY
model Gallery {
  id              String      @id @default(uuid())
  title           String      @db.VarChar(255)
  description     String?     @db.Text
  imageUrl        String      @db.VarChar(500) // Cloudinary URL
  videoUrl        String?     @db.VarChar(500) // Cloudinary URL (for videos)
  type            GalleryType @default(IMAGE)
  category        String?     @db.VarChar(100) // e.g., "Events", "Courses", "Students"
  
  isPublished     Boolean     @default(false)
  featured        Boolean     @default(false)
  order           Int         @default(0) // Display order
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([type])
  @@index([isPublished])
  @@index([featured])
  @@map("gallery")
}

// LIVE CLASSES
model LiveClass {
  id              String          @id @default(uuid())
  title           String          @db.VarChar(255)
  description     String?         @db.Text
  courseId        String?
  course          Course          @relation(fields: [courseId], references: [id])
  
  instructorId    String
  instructor      Instructor      @relation(fields: [instructorId], references: [id])
  
  scheduledAt     DateTime
  duration        Int             // Minutes
  meetingUrl      String?         @db.VarChar(500) // Zoom/Google Meet link
  meetingId       String?         @db.VarChar(255)
  meetingPassword String?         @db.VarChar(100)
  recordingUrl    String?         @db.VarChar(500) // Cloudinary video URL
  status          LiveClassStatus @default(SCHEDULED)
  
  enrollments     LiveClassEnrollment[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([instructorId])
  @@index([scheduledAt])
  @@index([status])
  @@map("live_classes")
}

model LiveClassEnrollment {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation("UserLiveClassEnrollments", fields: [userId], references: [id], onDelete: Cascade)
  liveClassId     String
  liveClass       LiveClass   @relation(fields: [liveClassId], references: [id], onDelete: Cascade)
  
  attended        Boolean     @default(false)
  joinedAt        DateTime?
  
  createdAt       DateTime    @default(now())
  
  @@unique([userId, liveClassId])
  @@index([userId])
  @@index([liveClassId])
  @@map("live_class_enrollments")
}

// VASTU PRODUCTS (E-commerce)
model Product {
  id              String          @id @default(uuid())
  name            String          @db.VarChar(255)
  slug            String          @unique @db.VarChar(255)
  description     String?         @db.Text
  shortDescription String?        @db.VarChar(500)
  images          Json            // Array of Cloudinary URLs
  price           Decimal         @db.Decimal(10, 2)
  comparePrice    Decimal?        @db.Decimal(10, 2) // Original price (for discounts)
  sku             String?         @unique @db.VarChar(100)
  stock           Int             @default(0)
  status          ProductStatus   @default(ACTIVE)
  featured        Boolean         @default(false)
  
  categoryId      String?
  category        Category?       @relation(fields: [categoryId], references: [id])
  
  orderItems      OrderItem[]
  reviews         ProductReview[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([slug])
  @@index([categoryId])
  @@index([status])
  @@index([featured])
  @@map("products")
}

model Cart {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation("UserCart", fields: [userId], references: [id], onDelete: Cascade)
  
  items           CartItem[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@unique([userId])
  @@index([userId])
  @@map("carts")
}

model CartItem {
  id              String      @id @default(uuid())
  cartId          String
  cart            Cart        @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId       String
  product         Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity        Int         @default(1)
  
  createdAt       DateTime    @default(now())
  
  @@unique([cartId, productId])
  @@index([cartId])
  @@map("cart_items")
}

// COUPON/DISCOUNT CODES
model Coupon {
  id              String      @id @default(uuid())
  code            String      @unique @db.VarChar(50)
  description     String?     @db.Text
  couponType      CouponType  @default(PERCENTAGE)
  discountValue   Decimal     @db.Decimal(10, 2) // Percentage or fixed amount
  minPurchase     Decimal?    @db.Decimal(10, 2) // Minimum order amount
  maxDiscount     Decimal?    @db.Decimal(10, 2) // Max discount for percentage coupons
  usageLimit      Int?        // Total usage limit (null = unlimited)
  usedCount       Int         @default(0)
  userLimit       Int?        // Per user usage limit
  validFrom       DateTime
  validUntil      DateTime
  status          CouponStatus @default(ACTIVE)
  
  applicableCourses Json?     // Array of course IDs (null = all courses)
  applicableProducts Json?    // Array of product IDs (null = all products)
  
  usages          CouponUsage[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([code])
  @@index([status])
  @@index([validUntil])
  @@map("coupons")
}

model CouponUsage {
  id              String      @id @default(uuid())
  couponId        String
  coupon          Coupon      @relation(fields: [couponId], references: [id], onDelete: Cascade)
  userId          String
  user            User        @relation("UserCouponUsage", fields: [userId], references: [id], onDelete: Cascade)
  orderId         String?
  order           Order?      @relation(fields: [orderId], references: [id])
  paymentId       String?
  payment         Payment?    @relation(fields: [paymentId], references: [id])
  
  discountAmount  Decimal     @db.Decimal(10, 2)
  
  usedAt          DateTime    @default(now())
  
  @@index([couponId])
  @@index([userId])
  @@index([orderId])
  @@map("coupon_usage")
}

model Order {
  id              String      @id @default(uuid())
  orderNumber     String      @unique @db.VarChar(50)
  userId          String
  user            User        @relation("UserOrders", fields: [userId], references: [id])
  
  items           OrderItem[]
  
  subtotal        Decimal     @db.Decimal(10, 2)
  discount        Decimal     @db.Decimal(10, 2) @default(0) // Coupon discount
  tax             Decimal     @db.Decimal(10, 2) @default(0)
  shipping        Decimal     @db.Decimal(10, 2) @default(0)
  total           Decimal     @db.Decimal(10, 2)
  
  couponId        String?     // Applied coupon
  coupon          Coupon?     @relation(fields: [couponId], references: [id])
  couponUsage     CouponUsage?
  
  shippingAddress Json        // Full address object
  billingAddress  Json?
  
  paymentMethod   PaymentMethod @db.VarChar(50)
  paymentId       String?     @db.VarChar(255) // Payment transaction ID
  status          OrderStatus @default(PENDING)
  
  trackingNumber  String?     @db.VarChar(255)
  shippedAt       DateTime?
  deliveredAt     DateTime?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([userId])
  @@index([orderNumber])
  @@index([status])
  @@map("orders")
}

model OrderItem {
  id              String      @id @default(uuid())
  orderId         String
  order           Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId       String
  product         Product     @relation(fields: [productId], references: [id])
  
  quantity        Int
  price           Decimal     @db.Decimal(10, 2) // Price at time of purchase
  
  @@index([orderId])
  @@map("order_items")
}

// EVENTS
model Event {
  id              String      @id @default(uuid())
  title           String      @db.VarChar(255)
  slug            String      @unique @db.VarChar(255)
  description     String?     @db.Text
  shortDescription String?    @db.VarChar(500)
  image           String?     @db.VarChar(500) // Cloudinary URL
  venue           String?     @db.VarChar(255)
  location        String?     @db.VarChar(500)
  startDate       DateTime
  endDate         DateTime?
  price           Decimal     @db.Decimal(10, 2) @default(0)
  isFree          Boolean     @default(false)
  maxAttendees    Int?
  status          EventStatus @default(UPCOMING)
  featured        Boolean     @default(false)
  
  registrations   EventRegistration[]
  consultations   Consultation[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([slug])
  @@index([startDate])
  @@index([status])
  @@index([featured])
  @@map("events")
}

model EventRegistration {
  id              String      @id @default(uuid())
  userId          String?
  user            User?       @relation("UserEventRegistrations", fields: [userId], references: [id], onDelete: SetNull)
  eventId         String
  event           Event       @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  name            String      @db.VarChar(255)
  email           String      @db.VarChar(255)
  phone           String      @db.VarChar(50)
  
  attended        Boolean     @default(false)
  
  createdAt       DateTime    @default(now())
  
  @@unique([eventId, email])
  @@index([eventId])
  @@index([email])
  @@map("event_registrations")
}

// BLOGS
model Blog {
  id              String      @id @default(uuid())
  title           String      @db.VarChar(255)
  slug            String      @unique @db.VarChar(255)
  excerpt         String?     @db.VarChar(500)
  content         String      @db.Text
  featuredImage   String?     @db.VarChar(500) // Cloudinary URL
  authorId        String      // Admin user ID
  author          User        @relation("AuthorBlogs", fields: [authorId], references: [id])
  
  categoryId      String?
  category        Category?   @relation(fields: [categoryId], references: [id])
  
  status          BlogStatus  @default(DRAFT)
  featured        Boolean     @default(false)
  views           Int         @default(0)
  
  tags            String?     @db.VarChar(500) // Comma-separated
  seoTitle        String?     @db.VarChar(255)
  seoDescription  String?     @db.VarChar(500)
  
  comments        BlogComment[]
  
  publishedAt     DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([slug])
  @@index([authorId])
  @@index([categoryId])
  @@index([status])
  @@index([featured])
  @@index([publishedAt])
  @@map("blogs")
}

model BlogComment {
  id              String      @id @default(uuid())
  blogId          String
  blog            Blog        @relation(fields: [blogId], references: [id], onDelete: Cascade)
  
  userId          String?
  user            User?       @relation("UserBlogComments", fields: [userId], references: [id], onDelete: SetNull)
  name            String      @db.VarChar(255) // If guest comment
  email           String?     @db.VarChar(255) // If guest comment
  
  content         String      @db.Text
  isApproved      Boolean     @default(false)
  parentId        String?     // For nested comments/replies
  parent          BlogComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies         BlogComment[] @relation("CommentReplies")
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([blogId])
  @@index([userId])
  @@index([isApproved])
  @@map("blog_comments")
}

// AFFILIATION PROGRAM
model Affiliate {
  id              String          @id @default(uuid())
  userId          String          @unique
  user            User            @relation("UserAffiliate", fields: [userId], references: [id], onDelete: Cascade)
  
  affiliateCode   String          @unique @db.VarChar(50)
  status          AffiliateStatus @default(PENDING)
  commissionRate  Decimal         @db.Decimal(5, 2) @default(10.00) // Percentage
  totalEarnings   Decimal         @db.Decimal(10, 2) @default(0)
  paidEarnings    Decimal         @db.Decimal(10, 2) @default(0)
  pendingEarnings Decimal         @db.Decimal(10, 2) @default(0)
  
  bankName        String?         @db.VarChar(255)
  accountNumber   String?         @db.VarChar(100)
  ifscCode        String?         @db.VarChar(50)
  panNumber       String?         @db.VarChar(50)
  
  earnings        AffiliateEarning[]
  enrollments     Enrollment[]    @relation("AffiliateEnrollments")
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([affiliateCode])
  @@index([status])
  @@map("affiliates")
}

model AffiliateEarning {
  id              String      @id @default(uuid())
  affiliateId     String
  affiliate       Affiliate   @relation(fields: [affiliateId], references: [id], onDelete: Cascade)
  courseId        String
  course          Course      @relation(fields: [courseId], references: [id])
  enrollmentId    String
  enrollment      Enrollment  @relation(fields: [enrollmentId], references: [id])
  
  amount          Decimal     @db.Decimal(10, 2)
  commissionRate  Decimal     @db.Decimal(5, 2)
  status          String      @default("PENDING") // PENDING, PAID
  paidAt          DateTime?
  
  createdAt       DateTime    @default(now())
  
  @@index([affiliateId])
  @@index([status])
  @@map("affiliate_earnings")
}

// Reviews & Ratings
model Review {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation("UserReviews", fields: [userId], references: [id], onDelete: Cascade)
  courseId        String
  course          Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  rating          Int         // 1-5
  comment         String?     @db.Text
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@unique([userId, courseId])
  @@index([courseId])
  @@map("reviews")
}

model ProductReview {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation("UserProductReviews", fields: [userId], references: [id], onDelete: Cascade)
  productId       String
  product         Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  rating          Int         // 1-5
  comment         String?     @db.Text
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@unique([userId, productId])
  @@index([productId])
  @@map("product_reviews")
}

// Assignments
model Assignment {
  id              String          @id @default(uuid())
  title           String          @db.VarChar(255)
  description     String?         @db.Text
  dueDate         DateTime?
  maxScore        Int             @default(100)
  
  courseId        String
  course          Course          @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  submissions     AssignmentSubmission[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([courseId])
  @@map("assignments")
}

model AssignmentSubmission {
  id              String          @id @default(uuid())
  userId          String
  user            User            @relation("UserSubmissions", fields: [userId], references: [id], onDelete: Cascade)
  assignmentId    String
  assignment      Assignment      @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  
  content         String          @db.Text
  fileUrl         String?         @db.VarChar(500) // Cloudinary URL
  score           Int?
  feedback        String?         @db.Text
  submittedAt     DateTime        @default(now())
  gradedAt        DateTime?
  
  @@unique([userId, assignmentId])
  @@index([userId])
  @@index([assignmentId])
  @@map("assignment_submissions")
}

// Quizzes
model Quiz {
  id              String      @id @default(uuid())
  title           String      @db.VarChar(255)
  description     String?     @db.Text
  timeLimit       Int?        // Minutes
  passingScore    Int         @default(70)
  
  lessonId        String      @unique
  lesson          Lesson      @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  questions       QuizQuestion[]
  attempts        QuizAttempt[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@map("quizzes")
}

model QuizQuestion {
  id              String      @id @default(uuid())
  quizId          String
  quiz            Quiz        @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  question        String      @db.Text
  questionType    String      @default("multiple_choice")
  options         Json?
  correctAnswer   String      @db.Text
  points          Int         @default(1)
  order           Int         @default(0)
  
  createdAt       DateTime    @default(now())
  
  @@index([quizId])
  @@map("quiz_questions")
}

model QuizAttempt {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation("UserQuizAttempts", fields: [userId], references: [id], onDelete: Cascade)
  quizId          String
  quiz            Quiz        @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  answers         Json
  score           Int?
  isPassed        Boolean?
  completedAt     DateTime    @default(now())
  
  @@index([userId])
  @@index([quizId])
  @@map("quiz_attempts")
}

// Certificates
model Certificate {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation("UserCertificates", fields: [userId], references: [id], onDelete: Cascade)
  courseId        String
  course          Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  certificateUrl  String      @db.VarChar(500) // Cloudinary PDF URL
  certificateId   String      @unique @db.VarChar(100)
  
  issuedAt        DateTime    @default(now())
  
  @@unique([userId, courseId])
  @@index([userId])
  @@index([certificateId])
  @@map("certificates")
}

// Payments/Transactions
model Payment {
  id              String          @id @default(uuid())
  userId          String
  user            User            @relation("UserPayments", fields: [userId], references: [id], onDelete: Cascade)
  courseId        String?
  course          Course?         @relation(fields: [courseId], references: [id])
  orderId         String?         // For product orders
  order           Order?          @relation(fields: [orderId], references: [id])
  
  amount          Decimal         @db.Decimal(10, 2)
  discount        Decimal         @db.Decimal(10, 2) @default(0) // Coupon discount
  finalAmount     Decimal         @db.Decimal(10, 2) // Amount after discount
  currency        String          @default("NPR") @db.VarChar(10)
  
  paymentMethod   PaymentMethod   @db.VarChar(50)
  
  // eSewa specific fields
  esewaRefId      String?         @db.VarChar(255)
  esewaProductId  String?         @db.VarChar(255)
  
  // Mobile Banking specific fields
  mobileBankName  String?         @db.VarChar(100) // e.g., "Nepal Investment Bank"
  mobileBankRef   String?         @db.VarChar(255)
  
  // Card specific fields (Visa/Mastercard)
  cardLastFour    String?         @db.VarChar(4)
  cardType        String?         @db.VarChar(50) // VISA, MASTERCARD
  cardholderName  String?         @db.VarChar(255)
  
  transactionId   String?         @unique @db.VarChar(255)
  status          String          @default("PENDING") // PENDING, COMPLETED, FAILED, REFUNDED
  
  couponId        String?         // Applied coupon
  coupon          Coupon?         @relation(fields: [couponId], references: [id])
  couponUsage     CouponUsage?
  
  metadata        Json?           // Additional payment gateway response data
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([transactionId])
  @@index([paymentMethod])
  @@map("payments")
}

// Notifications
model Notification {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation("UserNotifications", fields: [userId], references: [id], onDelete: Cascade)
  
  title           String      @db.VarChar(255)
  message         String      @db.Text
  type            String      @default("INFO")
  isRead          Boolean     @default(false)
  link            String?     @db.VarChar(500)
  
  createdAt       DateTime    @default(now())
  
  @@index([userId])
  @@index([isRead])
  @@map("notifications")
}

// Update User model (NO instructor relations)
model User {
  id                    String    @id @default(uuid())
  email                 String    @unique @db.VarChar(255)
  password              String    @db.VarChar(255)
  fullName              String    @db.VarChar(255)
  profileImage          String?   @db.VarChar(500) // Cloudinary URL
  phone                 String?   @db.VarChar(50)
  role                  Role      @default(USER)
  isEmailVerified       Boolean   @default(false)
  isActive              Boolean   @default(true)
  refreshToken          String?   @db.Text
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // Relations (NO instructor-related)
  otps                  Otp[]
  enrollments           Enrollment[]          @relation("UserEnrollments")
  progress              LessonProgress[]      @relation("UserProgress")
  reviews               Review[]              @relation("UserReviews")
  submissions           AssignmentSubmission[] @relation("UserSubmissions")
  quizAttempts          QuizAttempt[]         @relation("UserQuizAttempts")
  certificates          Certificate[]         @relation("UserCertificates")
  payments              Payment[]             @relation("UserPayments")
  notifications         Notification[]        @relation("UserNotifications")
  affiliate             Affiliate?            @relation("UserAffiliate")
  affiliateEnrollments  Enrollment[]          @relation("AffiliateEnrollments")
  liveClassEnrollments  LiveClassEnrollment[] @relation("UserLiveClassEnrollments")
  eventRegistrations    EventRegistration[]   @relation("UserEventRegistrations")
  blogs                 Blog[]                @relation("AuthorBlogs")
  blogComments          BlogComment[]         @relation("UserBlogComments")
  productReviews        ProductReview[]       @relation("UserProductReviews")
  cart                  Cart?                 @relation("UserCart")
  orders                Order[]               @relation("UserOrders")
  couponUsages          CouponUsage[]         @relation("UserCouponUsage")

  @@index([email])
  @@map("users")
}

// Keep existing Otp model
model Otp {
  id                    String    @id @default(uuid())
  userId                String
  otp                   String    @db.VarChar(6)
  type                  OtpType
  expiresAt             DateTime
  isUsed                Boolean   @default(false)
  createdAt             DateTime  @default(now())

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([otp, type, isUsed])
  @@map("otps")
}
```

## Phase 2: Cloudinary Integration

### Setup Cloudinary Service

**Create `src/services/cloudinaryService.js`:**

- Upload images (thumbnails, product images, blog images, gallery, instructor images)
- Upload videos (course videos, live class recordings)
- Upload documents (PDFs, assignments)
- Image optimization and transformations
- Video compression
- Generate thumbnails from videos
- Delete files from Cloudinary

**Configuration:**

- Add Cloudinary credentials to `.env`
- Install `cloudinary` and `multer` packages
- Create upload middleware with size/type validation

## Phase 3: Controllers to Create

### Core LMS Controllers

- `src/controllers/courseController.js` - Full CRUD, admin course creation, advanced filtering
- `src/controllers/lessonController.js` - Lesson management
- `src/controllers/enrollmentController.js` - Enrollment management
- `src/controllers/progressController.js` - Progress tracking
- `src/controllers/categoryController.js` - Category management

### Instructor Management (Admin Only)

- `src/controllers/instructorController.js` - CRUD for instructors (admin manages, NOT users)

### Consultation System

- `src/controllers/consultationController.js` - Consultation form submission, admin management
- `src/controllers/studentSuccessController.js` - Student success stories CRUD (admin)

### Testimonials

- `src/controllers/testimonialController.js` - Testimonials CRUD (admin)

### Gallery

- `src/controllers/galleryController.js` - Gallery management (admin)

### Live Classes

- `src/controllers/liveClassController.js` - Schedule, manage, join live classes
- `src/controllers/liveClassEnrollmentController.js` - Enroll in live classes

### E-commerce (Vastu Products)

- `src/controllers/productController.js` - Product CRUD
- `src/controllers/cartController.js` - Shopping cart management
- `src/controllers/orderController.js` - Order processing

### Events

- `src/controllers/eventController.js` - Event CRUD, registration

### Blogs

- `src/controllers/blogController.js` - Blog CRUD, publishing
- `src/controllers/blogCommentController.js` - Comment management

### Affiliation Program

- `src/controllers/affiliateController.js` - Become affiliate, manage affiliates
- `src/controllers/affiliateEarningController.js` - Track earnings, commissions

### Payment & Coupon Controllers

- `src/controllers/paymentController.js` - Payment processing (eSewa, Mobile Banking, Visa Card)
- `src/controllers/couponController.js` - Coupon code management (admin CRUD, validation, application)

### Supporting Controllers

- `src/controllers/assignmentController.js`
- `src/controllers/quizController.js`
- `src/controllers/certificateController.js`
- `src/controllers/reviewController.js`
- `src/controllers/notificationController.js`
- `src/controllers/uploadController.js` - Cloudinary upload handler

## Phase 4: Routes to Create

**Create route files:**

- `src/routes/courseRoutes.js` - With filtering endpoints
- `src/routes/lessonRoutes.js`
- `src/routes/enrollmentRoutes.js`
- `src/routes/progressRoutes.js`
- `src/routes/categoryRoutes.js`
- `src/routes/instructorRoutes.js` - Admin only
- `src/routes/consultationRoutes.js`
- `src/routes/studentSuccessRoutes.js` - Admin only
- `src/routes/testimonialRoutes.js` - Admin CRUD, public read
- `src/routes/galleryRoutes.js` - Admin CRUD, public read
- `src/routes/liveClassRoutes.js`
- `src/routes/productRoutes.js`
- `src/routes/cartRoutes.js`
- `src/routes/orderRoutes.js`
- `src/routes/eventRoutes.js`
- `src/routes/blogRoutes.js`
- `src/routes/blogCommentRoutes.js`
- `src/routes/affiliateRoutes.js`
- `src/routes/assignmentRoutes.js`
- `src/routes/quizRoutes.js`
- `src/routes/certificateRoutes.js`
- `src/routes/paymentRoutes.js`
- `src/routes/couponRoutes.js` - Coupon management and validation
- `src/routes/reviewRoutes.js`
- `src/routes/notificationRoutes.js`
- `src/routes/uploadRoutes.js`

## Phase 5: Services to Create

- `src/services/cloudinaryService.js` - Cloudinary integration (images, videos, documents)
- `src/services/paymentService.js` - Payment gateway integration (eSewa, Mobile Banking, Visa Card)
- `src/services/esewaService.js` - eSewa payment integration
- `src/services/cardPaymentService.js` - Visa/Mastercard payment integration
- `src/services/mobileBankingService.js` - Mobile banking integration
- `src/services/couponService.js` - Coupon validation, calculation, application
- `src/services/certificateService.js` - PDF certificate generation
- `src/services/notificationService.js` - Email and in-app notifications
- `src/services/progressService.js` - Progress calculation
- `src/services/affiliateService.js` - Commission calculation, tracking
- `src/services/orderService.js` - Order processing, inventory management
- `src/services/courseFilterService.js` - Advanced course filtering logic

## Phase 6: Middleware to Create

- `src/middleware/affiliate.js` - Verify affiliate role
- `src/middleware/enrollment.js` - Verify enrollment
- `src/middleware/upload.js` - File upload handling (Cloudinary)
- `src/middleware/courseAccess.js` - Verify course access
- `src/middleware/cloudinaryUpload.js` - Cloudinary-specific upload middleware

**REMOVED:** `instructor.js` middleware (instructors are not users)

## Phase 7: Validators

**Update `src/utils/validators.js` with:**

- Course validation (with filtering fields)
- Lesson validation
- Instructor validation
- Consultation form validation
- Testimonial validation
- Gallery validation
- Product validation
- Event validation
- Blog validation
- Affiliate application validation
- Order validation
- All other entity validations

## Implementation Priority Order

1. **Database Schema** - Update Prisma schema with all models
2. **Cloudinary Setup** - File upload service
3. **Instructor Management** - Admin CRUD for instructors (image, details)
4. **Core Course System** - Courses, Lessons, Categories (with instructor link)
5. **Course Filtering** - Advanced filtering by category, level, price, rating, tags, ongoing
6. **Consultation System** - Forms + Student success stories
7. **Testimonials** - Testimonial management
8. **Gallery** - Gallery image/video management
9. **Enrollment & Progress** - Student enrollment tracking
10. **Products E-commerce** - Products, Cart, Orders
11. **Events** - Event management and registration
12. **Live Classes** - Schedule and manage live sessions
13. **Blogs** - Blog posts and comments
14. **Affiliation Program** - Affiliate system and tracking
15. **Coupon System** - Coupon code creation and management
16. **Payment Integration** - eSewa, Mobile Banking, Visa Card payments
17. **Supporting Features** - Assignments, Quizzes, Certificates
18. **Notifications** - Communication system

## Key Features Detail

### Instructor Management (Admin Only)

- Admin creates/manages instructors
- Add instructor name, image (Cloudinary), bio, designation, specialization
- Social links (Facebook, YouTube, Instagram)
- Featured instructor flag
- Display order
- Instructors linked to courses (not users)

### Course Filtering System

- Filter by category
- Filter by level (Beginner, Intermediate, Advanced)
- Filter by price range
- Filter by rating (min rating)
- Filter by tags
- Filter by ongoing status (isOngoing)
- Filter by featured
- Sort by: newest, oldest, price (low-high, high-low), rating, popularity
- Search by title/description
- Pagination

### Ongoing Courses Tracking

- `isOngoing` flag on Course
- `startDate` and `endDate` fields
- Auto-update based on dates (can be manual too)
- Separate endpoint: `GET /api/courses/ongoing`
- Filter courses by ongoing status

### Consultation System

- **Consultation Form**: Name, email, phone, event selection, source, message
- **Admin Management**: View, approve, reject, add notes, mark completed
- **Student Success Stories**: Admin can add students who:
  - Passed courses
  - Got jobs (with company/position)
  - Started businesses
  - With photos (Cloudinary), testimonials, achievements
  - Featured/published status

### Testimonials System

- Separate from student success stories
- Admin can add testimonials
- Fields: name, image (Cloudinary), designation, company, rating (1-5), comment
- Optional link to course
- Featured/published status
- Public endpoint to get published testimonials

### Gallery System

- Admin can upload images/videos to gallery
- Categories: Events, Courses, Students, General
- Cloudinary URLs for images/videos
- Featured/published status
- Display order
- Public endpoint to get published gallery items

### Admin Course Creation

- Create courses with all details
- Select instructor (from instructor list, not users)
- Upload thumbnails (Cloudinary)
- Add lessons with videos/content
- Upload video files (Cloudinary)
- Manage course status (Draft → Published → Archived)
- Set ongoing status
- Add tags for filtering
- Set pricing and enrollment

### Live Classes

- Schedule live classes
- Select instructor (from instructor list)
- Link to courses (optional)
- Set meeting URL (Zoom/Google Meet)
- Enroll students
- Record and store recordings (Cloudinary)
- Track attendance

### Vastu Products E-commerce

- Product catalog with images (Cloudinary)
- Shopping cart
- Checkout process
- Order management
- Inventory tracking
- Order status updates

### Events

- Create events with details
- Event registration
- Link to consultation forms
- Track attendees

### Blogs

- Create and publish blogs
- Featured images (Cloudinary)
- Categories and tags
- Comments system
- SEO fields

### Payment System

- **Payment Methods**:
  - eSewa integration (Nepal's popular payment gateway)
  - Mobile Banking (Nepal banks)
  - Visa Card (via Stripe/Khalti/Razorpay)
  - Mastercard (via Stripe/Khalti/Razorpay)

- **Payment Flow**:
  - Initiate payment with selected method
  - Handle payment gateway callbacks/webhooks
  - Verify payment status
  - Auto-enroll on successful payment
  - Refund handling

- **Coupon/Discount Codes**:
  - Admin creates coupon codes
  - Percentage or fixed amount discounts
  - Usage limits (total and per user)
  - Validity dates
  - Minimum purchase requirements
  - Maximum discount limits
  - Applicable to specific courses/products or all
  - Coupon validation before payment
  - Track coupon usage

### Affiliation Program

- Apply to become affiliate
- Admin approval system
- Unique affiliate codes
- Track referrals
- Commission calculation
- Earnings management
- Payment to affiliates

## File Structure

```
backend/src/
├── controllers/
│   ├── courseController.js          (with filtering)
│   ├── lessonController.js
│   ├── enrollmentController.js
│   ├── progressController.js
│   ├── categoryController.js
│   ├── instructorController.js      (admin CRUD, NOT user-based)
│   ├── consultationController.js
│   ├── studentSuccessController.js
│   ├── testimonialController.js     (NEW)
│   ├── galleryController.js         (NEW)
│   ├── liveClassController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── eventController.js
│   ├── blogController.js
│   ├── blogCommentController.js
│   ├── affiliateController.js
│   ├── assignmentController.js
│   ├── quizController.js
│   ├── certificateController.js
│   ├── paymentController.js
│   ├── reviewController.js
│   ├── notificationController.js
│   └── uploadController.js
├── routes/
│   ├── courseRoutes.js              (with /filter endpoint)
│   ├── lessonRoutes.js
│   ├── enrollmentRoutes.js
│   ├── progressRoutes.js
│   ├── categoryRoutes.js
│   ├── instructorRoutes.js          (admin only)
│   ├── consultationRoutes.js
│   ├── studentSuccessRoutes.js      (admin CRUD, public read)
│   ├── testimonialRoutes.js         (NEW - admin CRUD, public read)
│   ├── galleryRoutes.js             (NEW - admin CRUD, public read)
│   ├── liveClassRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── eventRoutes.js
│   ├── blogRoutes.js
│   ├── blogCommentRoutes.js
│   ├── affiliateRoutes.js
│   ├── assignmentRoutes.js
│   ├── quizRoutes.js
│   ├── certificateRoutes.js
│   ├── paymentRoutes.js
│   ├── reviewRoutes.js
│   ├── notificationRoutes.js
│   └── uploadRoutes.js
├── services/
│   ├── cloudinaryService.js
│   ├── paymentService.js
│   ├── certificateService.js
│   ├── notificationService.js
│   ├── progressService.js
│   ├── affiliateService.js
│   ├── orderService.js
│   └── courseFilterService.js       (NEW - filtering logic)
├── middleware/
│   ├── affiliate.js
│   ├── enrollment.js
│   ├── upload.js
│   ├── courseAccess.js
│   └── cloudinaryUpload.js
└── utils/
    └── validators.js (comprehensive validations)
```

## Environment Variables to Add

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment Gateway - eSewa
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key
ESEWA_ENVIRONMENT=sandbox # or production

# Payment Gateway - Mobile Banking
MOBILE_BANKING_ENABLED=true
# Add specific mobile banking provider credentials as needed

# Payment Gateway - Card Payments (Visa/Mastercard)
# Option 1: Stripe (supports Visa/Mastercard)
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable

# Option 2: Khalti (Nepal-based, supports cards)
KHALTI_SECRET_KEY=your_khalti_secret
KHALTI_PUBLIC_KEY=your_khalti_public_key

# Option 3: Razorpay (supports international cards)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## API Endpoints Overview

### Courses

- `GET /api/courses` - List all (with filtering)
- `GET /api/courses/filter` - Advanced filtering
- `GET /api/courses/ongoing` - Ongoing courses only
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create (admin)
- `PUT /api/courses/:id` - Update (admin)
- `DELETE /api/courses/:id` - Delete (admin)

### Coupons

- `GET /api/coupons` - List all active coupons (public)
- `GET /api/coupons/admin` - List all coupons (admin)
- `GET /api/coupons/:id` - Get coupon details
- `POST /api/coupons/validate` - Validate coupon code
- `POST /api/coupons` - Create coupon (admin)
- `PUT /api/coupons/:id` - Update coupon (admin)
- `DELETE /api/coupons/:id` - Delete coupon (admin)

### Payments

- `POST /api/payments/initiate` - Initiate payment (eSewa, Mobile Banking, Card)
- `POST /api/payments/esewa/verify` - Verify eSewa payment
- `POST /api/payments/mobile-banking/verify` - Verify mobile banking payment
- `POST /api/payments/card/verify` - Verify card payment
- `POST /api/payments/webhook/esewa` - eSewa webhook handler
- `POST /api/payments/webhook/stripe` - Stripe webhook handler (if using)
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments/:id/refund` - Process refund (admin)

### Instructors (Admin Only)

- `GET /api/instructors` - List all
- `GET /api/instructors/:id` - Get details
- `POST /api/instructors` - Create (admin)
- `PUT /api/instructors/:id` - Update (admin)
- `DELETE /api/instructors/:id` - Delete (admin)

### Testimonials

- `GET /api/testimonials` - Get published testimonials
- `POST /api/testimonials` - Create (admin)
- `PUT /api/testimonials/:id` - Update (admin)
- `DELETE /api/testimonials/:id` - Delete (admin)

### Gallery

- `GET /api/gallery` - Get published gallery items
- `POST /api/gallery` - Upload (admin)
- `PUT /api/gallery/:id` - Update (admin)
- `DELETE /api/gallery/:id` - Delete (admin)

### Consultations

- `POST /api/consultations` - Submit consultation form (public)
- `GET /api/consultations` - List all (admin)
- `PUT /api/consultations/:id` - Update status (admin)

### Student Success Stories

- `GET /api/student-success` - Get published stories
- `POST /api/student-success` - Create (admin)
- `PUT /api/student-success/:id` - Update (admin)
- `DELETE /api/student-success/:id` - Delete (admin)

## Testing Requirements

- Unit tests for all services
- Integration tests for controllers
- API endpoint testing (update Postman collection)
- File upload testing (Cloudinary)
- Payment webhook testing
- Affiliate tracking testing
- Course filtering testing
- Ongoing courses logic testing

## Documentation Updates

- Complete API documentation
- Update Postman collection with all endpoints
- File upload flow documentation (Cloudinary)
- Payment integration guide
- Affiliate program documentation
- Admin panel features documentation
- Course filtering documentation
- Instructor management guide
- Payment integration guide (eSewa, Mobile Banking, Cards)
- Coupon system documentation

## Course Filtering Query Parameters

Example: `GET /api/courses/filter?category=vastu&level=beginner&minPrice=0&maxPrice=1000&minRating=4&tags=consultation&isOngoing=true&sortBy=rating&order=desc&page=1&limit=10`

**Parameters:**

- `category` - Category slug or ID
- `level` - Beginner, Intermediate, Advanced
- `minPrice`, `maxPrice` - Price range
- `minRating` - Minimum rating (1-5)
- `tags` - Comma-separated tags
- `isOngoing` - true/false
- `featured` - true/false
- `instructor` - Instructor ID
- `search` - Search in title/description
- `sortBy` - newest, oldest, price, rating, popularity, enrollments
- `order` - asc, desc
- `page` - Page number
- `limit` - Items per page

## Payment Flow Details

### Payment Initiation Flow

**Sequence:**

1. User selects course/product and payment method
2. User optionally applies coupon code
3. Frontend sends payment request to backend
4. Backend validates coupon (if provided)
5. Backend calculates final amount with discount
6. Backend initiates payment with selected gateway
7. Payment gateway returns payment URL/credentials
8. User redirected to payment gateway
9. User completes payment
10. Payment gateway sends webhook/callback
11. Backend verifies payment
12. Backend updates payment status
13. Backend creates enrollment/order
14. User receives confirmation

### Payment Methods Implementation

**1. eSewa Integration**

- Generate payment URL with merchant ID, product details, amount
- Include success/failure callback URLs
- User redirected to eSewa portal
- eSewa sends POST request to callback URL with transaction details
- Verify transaction using eSewa verification API
- Update payment status on successful verification

**2. Mobile Banking**

- Generate payment request with bank account details
- Provide reference number to user
- User transfers via mobile banking app
- Admin verifies payment manually or via bank API (if available)
- Update payment status after verification

**3. Visa/Mastercard (via Stripe/Khalti/Razorpay)**

- Create payment intent/session
- Handle secure card tokenization
- Support 3D Secure authentication
- Process payment through gateway
- Verify webhook signature
- Update payment status

### Coupon Validation Process

**Validation Steps:**

1. Check if coupon code exists
2. Verify coupon is active (status = ACTIVE)
3. Check validity dates (current date within validFrom and validUntil)
4. Verify usage limit not reached (usedCount < usageLimit)
5. Verify user hasn't exceeded per-user limit
6. Check minimum purchase requirement (if applicable)
7. Verify coupon is applicable to selected course/product
8. Calculate discount amount:

   - Percentage: (amount * discountValue) / 100, capped at maxDiscount
   - Fixed: discountValue

9. Apply discount to final amount

### Coupon Features Summary

- **Types**: Percentage or Fixed Amount
- **Usage Limits**: Total uses and per-user uses
- **Validity**: Start date, end date, status
- **Conditions**: Minimum purchase, maximum discount
- **Applicability**: All items or specific courses/products
- **Tracking**: Usage history per user and order

### Payment Status Management

- **PENDING**: Payment initiated, awaiting completion
- **COMPLETED**: Payment successful, enrollment/order confirmed
- **FAILED**: Payment failed or cancelled by user
- **REFUNDED**: Payment refunded (admin action)

### Refund Process

1. Admin initiates refund
2. Verify payment was successful
3. Process refund through payment gateway
4. Update payment status to REFUNDED
5. Reverse enrollment/order if applicable
6. Notify user of refund