# Frontend Security Updates

I have updated both `frontend-main` and `frontend-admin` to align with the backend security improvements.

## 🔐 Authentication Implementation

Created `api.ts` in both projects to automatically handle JWT tokens.
- **frontend-main**: `src/services/api.ts` (Uses `localStorage.getItem("token")`)
- **frontend-admin**: `src/services/api.ts` (Uses `localStorage.getItem("adminToken")`)

## 🛠️ Service Refactoring

Refactored the following services to use the authenticated `api` instance instead of raw `axios`. This ensures that all requests to protected endpoints (Orders, Uploads, Admin actions) now include the `Bearer` token.

### Frontend Main (`frontend-main`)
- `orderService.ts`: Protected `createOrder`, `getOrdersByUserId`, and others.
- `userService.ts`: Cleaned up token handling.
- `CloudinaryService.ts`: Now uses `api` and fixed upload endpoint.
- `CloudinaryAudioService.ts`: Now uses `api` and authenticated uploads.
- `cartService.ts`: Standardized to use `api`.

### Frontend Admin (`frontend-admin`)
- `orderService.ts`: Protected all order management calls.
- `scholarService.ts`: Fixed critical bug where upload URL was incorrect (`/upload-image` -> `/upload`) and added auth.
- `platformTestimonialService.ts`: Added auth.
- `reviewService.ts`: Converted from `fetch` to `api` (axios) to support auth headers.

## 🐛 Bug Fixes
- **Frontend Admin Uploads**: Fixed `scholarService.ts` attempting to use non-existent `/api/upload-image`. It now correctly points to `/api/upload`.
- **Backend Uploads**: Updated `backend/src/routes/upload.ts` to use `protectAny`, allowing both Admins and Users to upload files (required for Scholar creation and User profile/audio uploads).

The applications should now be fully functional with the enhanced security rules.
