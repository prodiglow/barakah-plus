# Security Audit Findings

The following security risks and issues were identified in the project.

## 🚨 Critical Vulnerabilities (Immediate Action Required)

### 1. Unprotected Admin Routes
**Location:** `backend/src/routes/adminRoutes.ts`
**Issue:** The admin routes for managing reviews and testimonials are completely exposed. There is no authentication or authorization middleware applied.
**Risk:** Any unauthenticated user can list, approve, or reject reviews and testimonials.
**Remediation:** Create `adminMiddleware.ts` to verify admin tokens and apply it to these routes.

### 2. Unprotected Order Routes
**Location:** `backend/src/routes/orderRoutes.ts`
**Issue:** Major order management routes (`getAllOrders`, `createOrder`, `deleteOrder`) are unprotected.
**Risk:** Data Leakage (anyone can view all orders), Data Loss (anyone can delete orders), and Spam (anyone can create orders).
**Remediation:** Apply `protect` middleware to user-specific routes and `adminProtect` to admin-only routes.

### 3. Unprotected File Uploads/Deletions
**Location:** `backend/src/routes/upload.ts`
**Issue:** The `/upload` and `/delete` endpoints are public.
**Risk:** Malicious users can upload arbitrary files (filling storage) or delete existing images if they guess the `public_id`.
**Remediation:** Protect these routes with authentication middleware.

### 4. Insecure Default Secret
**Location:** `backend/src/controllers/userController.ts`, `backend/src/middleware/userMiddleware.ts`
**Issue:** `process.env.JWT_SECRET || "defaultsecret"`
**Risk:** If the environment variable is not set, the application defaults to "defaultsecret", which is easily guessable, allowing attackers to forge tokens.
**Remediation:** Enforce the presence of `JWT_SECRET` and fail to start if missing, or at least remove the insecure string fallback in production.

## ⚠️ High/Medium Risks

### 5. IDOR (Insecure Direct Object Reference) in User Update
**Location:** `backend/src/controllers/userController.ts` -> `updateUser`
**Issue:** The controller updates a user based on `req.params.id` but does not verify if the logged-in user (`req.user.id`) matches the target ID.
**Risk:** A logged-in user could potentially update another user's profile if they modify the request URL.
**Remediation:** Ensure `req.user.id === req.params.id` in the controller or middleware.

### 6. Duplicate Middleware Code
**Location:** `backend/src/middleware/authMiddleware.ts` vs `backend/src/middleware/userMiddleware.ts`
**Issue:** These files appear to be identical.
**Risk:** Maintenance issue. If one is fixed, the other might remain broken.
**Remediation:** Consolidate into a single `authMiddleware.ts`.

## 📋 Recommended Action Plan

1.  **Create `adminMiddleware.ts`** to handle admin authentication.
2.  **Updates Routes**: Apply `protect` and `adminProtect` middleware to all sensitive routes in `orderRoutes.ts`, `adminRoutes.ts`, and `upload.ts`.
3.  **Fix IDOR**: Add strict ID checking in `userController.ts`.
4.  **Cleanup**: Consolidate middleware and remove "defaultsecret".

**Please review this list and let me know if you want me to proceed with fixing these issues.**
