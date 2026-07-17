# Dua Management Walkthrough

I have successfully implemented the Dua Management feature, enabling admins to create, edit, delete, and view Duas.

## Changes Implemented

### Backend
- **Model**: Created `Dua` model in `models/Dua.ts` with support for Arabic text, transliteration, translation, and categorization.
- **Controller**: Implemented `duaController.ts` with full CRUD capabilities.
- **Routes**: Added `duaRoutes.ts` with `protectAdmin` middleware for secure operations.
- **App Integration**: Mounted routes at `/api/duas`.

### Frontend Admin
- **Page**: Created `ManageDuas.tsx` with a responsive table view and a dialog for adding/editing Duas.
    - **Arabic Text Support**: The table now includes a wide "Arabic Text" column (40% width) that displays the full Dua text in a readable font with RTL direction.
- **Service**: Implemented `duaService.ts` to communicate with the backend.
- **Navigation**: Added "Manage Duas" tab to `AdminDashboard.tsx` and updated routing in `App.tsx`.

## How to Verify

1.  **Login as Admin**: Access the admin dashboard.
2.  **Navigate to "Manage Duas"**: Click the new tab at the end of the navigation bar.
3.  **Add a Dua**:
    -   Click "Add New Dua".
    -   Fill in Title, Arabic Text, Translation, etc.
    -   Click "Create".
    -   Verify the new Dua appears in the table with its full Arabic text visible.
4.  **Edit a Dua**:
    -   Click the Edit (pencil) icon on a Dua.
    -   Change some fields.
    -   Click "Update".
    -   Verify changes are reflected.
5.  **Toggle Status**:
    -   Flip the "Status" switch.
    -   Verify the success toast appears.
6.  **Delete a Dua**:
    -   Click the Delete (trash) icon.
    -   Confirm deletion.
    -   Verify the Dua is removed from the list.
