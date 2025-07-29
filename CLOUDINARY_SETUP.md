# Cloudinary Setup for Profile Picture Upload

## Overview
The EditProfile component uses Cloudinary for image uploads. You need to configure your Cloudinary credentials to enable profile picture uploads.

## Setup Steps

### 1. Get Cloudinary Credentials
1. Sign up or log in to [Cloudinary](https://cloudinary.com/)
2. Go to your Dashboard
3. Note down your:
   - Cloud Name
   - Upload Preset (create one if needed)

### 2. Create an Upload Preset
1. In Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `whispr-profiles` (or any name you prefer)
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `whispr-profiles` (optional, for organization)
   - **Transformation**: Set max width/height if desired (e.g., 400x400)
   - **Format**: Auto or specific format like JPG/PNG
5. Save the preset

### 3. Update the Code
Open `src/pages/EditProfile.tsx` and update these constants:

```typescript
const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset'; // Replace with your actual preset name
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name'; // Replace with your actual cloud name
```

Replace:
- `your_upload_preset` with your actual upload preset name
- `your_cloud_name` with your actual Cloudinary cloud name

### 4. Environment Variables (Optional but Recommended)
For better security and flexibility, you can use environment variables:

1. Add to your `.env` file:
```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

2. Update the code to use environment variables:
```typescript
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your_fallback_preset';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_fallback_cloud_name';
```

## Features Implemented

### Edit Profile Page (`/edit-profile`)
- **Profile Picture Upload**: Click camera icon to upload new profile picture
- **Form Fields**: Name, Username, Email, Bio
- **Validation**: Required fields, file type/size validation
- **Auto-save**: Updates profile and refreshes user data
- **Navigation**: Back to profile page after successful update

### Profile Page Updates
- **Edit Profile Button**: Shows for own profile (replaces Follow button)
- **Navigates to**: `/edit-profile` route

### API Integration
- Uses existing `api.updateProfile()` method
- Integrates with AuthContext's `refreshUser()` method
- Handles errors and success states

## File Upload Validation
- **File Type**: Only image files allowed
- **File Size**: Maximum 5MB
- **User Feedback**: Toast notifications for success/error states

## Security Notes
- Uses unsigned upload presets (safe for client-side)
- Images are stored in organized folders
- File validation prevents malicious uploads
- Error handling for failed uploads

## Testing
1. Navigate to your profile page
2. Click "Edit Profile" button
3. Upload a new profile picture
4. Update other fields as needed
5. Click "Save Changes"
6. Verify the profile updates correctly
