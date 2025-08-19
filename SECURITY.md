# SECURITY.md

## Security Overview

This document describes the cybersecurity measures implemented in the **JobWays** project (see assignment: Secure Job Portal System with RBAC & Document Management). Our primary goal is to ensure data protection, secure authentication, and safe document handling for all user roles (Admin, HR, Employee, Candidate).

---

## Addressed Vulnerabilities

This section outlines major web security threats mitigated in the codebase, following assignment guidelines.

### 1. Cross-Site Scripting (XSS)
- **Prevention:**
  - React is used for frontend UI rendering, escaping all dynamic content by default.
  - User input is sanitized and validated before being stored or re-rendered.
- **Where:** All React components (especially those rendering data from users).

### 2. NoSQL Injection
- **Prevention:**
  - All MongoDB queries use parameterized methods (`findById`, etc.) and never dynamically build query objects from user input.
  - All user input is validated and type-checked on the backend using libraries like Joi or express-validator.
- **Where:** All API endpoints in controller files (e.g., `UserController.js`, `AppModel.js`).

### 3. Cross-Site Request Forgery (CSRF)
- **Prevention:**
  - JWT tokens are set using httpOnly cookies to prevent access from client-side scripts.
  - CSRF protection is enabled via appropriate middleware.
- **Where:** Authentication flow (`auth.js` middleware, session management code).

### 4. Brute Force & Credential Stuffing
- **Prevention:**
  - Passwords are hashed with `bcryptjs` before storage (`UserModel.js`, seed scripts).
  - Rate limiting middleware can be implemented for login endpoints (e.g., express-rate-limit).
- **Where:** User registration and login logic (`UserController.js`).

### 5. Unrestricted File Uploads
- **Prevention:**
  - Allowed file types are restricted to `.pdf`, `.docx`, `.jpg`, and `.png`.
  - Files are checked for valid MIME types and are subject to size limits.
  - Uploads are scanned for viruses (simulated in this version).
- **Where:** Document upload routes/controllers.

### 6. Broken Access Control
- **Prevention:**
  - All routes enforce role-based access checks (`auth.js` middleware, controller role checks).
  - Only Admins and HR can view or upload documents for employees.
  - Employees/candidates can only view or manage their own documents and applications.
- **Where:** Backend API endpoints for jobs, users, and documents.

### 7. Insecure CORS Configuration
- **Prevention:**
  - CORS is set up to allow only trusted origins (configured in the server startup file).
- **Where:** Main server initialization (`index.js` or `app.js`).

### 8. Insecure Session Management
- **Prevention:**
  - JWT tokens are stored as httpOnly cookies.
  - Refresh tokens are rotated and verified securely.
- **Where:** Auth logic (e.g., `auth.js`, `UserController.js`).

### 9. Security Misconfiguration
- **Prevention:**
  - Environment variables are used for secrets (not hard-coded).
  - Helmet or similar middleware is used to set secure HTTP headers.
- **Where:** Server setup (`index.js` or `app.js`).

### 10. Sensitive Data Exposure
- **Prevention:**
  - Passwords and tokens are never returned in API responses.
  - HTTPS is recommended for deployed environments.
- **Where:** All backend API responses, deployment recommendation.

---

## Security Features in Code

- **File:** `UserModel.js`  
  Password hashing with bcrypt, schema validation for all required fields (including avatars and resumes).
- **File:** `controllers/AuthController.js`  
  Handles registration, login, email verification; enforces role-based JWT authentication and session management.
- **File:** `controllers/UserController.js`, `AppModel.js`  
  Validates incoming data, checks role permissions before sensitive operations (CRUD operations on users, jobs, documents).
- **File:** `middlewares/auth.js`  
  Middleware for role-based access control and authentication checks.
- **File:** Document upload scripts/controllers  
  Enforces file type, size, and integrity checks for user uploads.

---
