# API Endpoints for CyberGrow E-Learning Platform

## **Authentication APIs**

- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/sign-up` - User registration
- **POST** `/api/auth/logout` - User logout
- **POST** `/api/auth/refresh` - Refresh access token
- **POST** `/api/auth/resend-otp` - Send OTP for email verification
- **POST** `/api/auth/verify-otp` - Verify OTP
- **POST** `/api/auth/forgot-password` - Send password reset link
- **POST** `/api/auth/reset-password` - Reset user password

## **Admin Authentication & Control**

- **POST** `/api/admin/login` - Admin login
- **POST** `/api/admin/reset-user-password` - Reset user password by admin

## **Admin Dashboard & Analytics**

- **GET** `/api/admin/dashboard` - Fetch admin dashboard analytics

## **Course Management (Admin)**

- **POST** `/api/admin/courses/upload` - Upload a new course
- **PATCH** `/api/admin/courses/[courseId]/update` - Update course details
- **PATCH** `/api/admin/courses/[courseId]/publish` - Publish/unpublish a course
- **DELETE** `/api/admin/courses/[courseId]` - Delete a course
- **GET** `/api/admin/courses/[courseId]/stats` - Get course statistics

### **Course Sections (Admin)**

- **POST** `/api/admin/courses/[courseId]/sections/add` - Add a new section
- **PATCH** `/api/admin/courses/[courseId]/sections/reorder` - Reorder sections
- **DELETE** `/api/admin/courses/[courseId]/sections/[sectionId]` - Delete a section

### **Course Lectures (Admin)**

- **POST** `/api/admin/courses/[courseId]/sections/[sectionId]/lectures/add` - Add a new lecture
- **PATCH** `/api/admin/courses/[courseId]/sections/[sectionId]/lectures/reorder` - Reorder lectures
- **DELETE** `/api/admin/courses/[courseId]/sections/[sectionId]/lectures/[lectureId]` - Delete a lecture

### **Course Notes (Admin)**

- **POST** `/api/admin/courses/[courseId]/sections/[sectionId]/notes/upload` - Upload notes
- **DELETE** `/api/admin/courses/[courseId]/sections/[sectionId]/notes/delete` - Delete notes

### **Course Reviews (Admin)**

- **DELETE** `/api/admin/courses/[courseId]/reviews/[reviewId]` - Delete a course review

## **User Course Management**

- **GET** `/api/user/courses` - Fetch all available courses
- **GET** `/api/user/courses/[courseId]` - Fetch course details

## **Course Progress Tracking**

- **POST** `/api/user/courses/progress` - Track course progress
- **POST** `/api/user/courses/progress/mark-completed` - Mark a lecture as completed
- **POST** `/api/user/courses/progress/resume` - Resume a course

## **User Enrollments**

- **POST** `/api/user/enrollments` - Enroll in a course
- **GET** `/api/admin/enrollments` - Fetch all enrollments (Admin)
- **POST** `/api/admin/enrollments/revoke` - Revoke enrollment (Admin)

## **Payments**

- **POST** `/api/payments` - Initiate a payment
- **GET** `/api/payments/[paymentId]` - Fetch payment details
- **PATCH** `/api/payments/[paymentId]/status` - Update payment status
- **GET** `/api/admin/payments` - Fetch all payment history (Admin)

## **Refunds**

- **POST** `/api/user/refunds` - Request a refund
- **GET** `/api/admin/refunds` - Fetch all refund requests (Admin)
- **PATCH** `/api/admin/refunds/[refundId]` - Approve/Reject a refund request (Admin)

## **User Profile**

- **GET** `/api/user/me` - Fetch user profile details
