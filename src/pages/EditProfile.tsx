// src/pages/EditProfile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/context/AuthContext.tsx]
import FormInput from '../components/FormInput'; // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/components/FormInput.tsx]
import { UploadCloud, User as UserIcon } from 'lucide-react';
import api, { SERVER_BASE_URL } from '../lib/api'; // <-- Import SERVER_BASE_URL [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/lib/api.ts]
import SwipeCard from '../components/SwipeCard'; // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/components/SwipeCard.tsx]
import { UserProfile } from '../services/user.service'; // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/services/user.service.ts]

const EditProfile: React.FC = () => {
  // Use user, loading state, and a function to refetch user data from context
  const { user, loading: authLoading, fetchCurrentUser } = useAuth(); // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/context/AuthContext.tsx]

  // Initialize state for form fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  // State for file handling
  const [file, setFile] = useState<File | null>(null);
  // State holds the relative path (/uploads/...) or a temporary blob: URL
  const [previewPathOrBlob, setPreviewPathOrBlob] = useState<string | null>(null);

  // State for submission status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper to construct the full image URL for display
  const getFullImageUrl = (relativePathOrBlobUrl: string | null): string | null => {
    if (!relativePathOrBlobUrl) { // Handle null case
      return null;
    }
    // If it's a blob URL, use it directly
    if (relativePathOrBlobUrl.startsWith('blob:')) {
      return relativePathOrBlobUrl;
    }
    // If it's already an absolute URL (less likely here but good practice)
    if (relativePathOrBlobUrl.startsWith('http:') || relativePathOrBlobUrl.startsWith('https:')) {
      return relativePathOrBlobUrl;
    }
    // If it's a relative path from the backend, prepend the server URL [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/lib/api.ts]
    return `${SERVER_BASE_URL}${relativePathOrBlobUrl}`;
  };

  // Populate form when user data is available
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      // Store only the relative path from the user object
      setPreviewPathOrBlob(user.profile_picture_url || null); // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/pages/EditProfile.tsx]
    }
  }, [user]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/backend/middleware/upload.middleware.js]
        setError('File is too large. Please select a file under 5MB.');
        return;
      }
      setFile(selectedFile);
      // Generate and store the temporary blob URL for immediate preview
      const blobUrl = URL.createObjectURL(selectedFile);
      setPreviewPathOrBlob(blobUrl); // <-- Update state with blob URL
      setError('');
      setSuccess('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('User not loaded.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    let textUpdateSuccess = false;
    let uploadAttempted = !!file;
    let uploadSuccess = !uploadAttempted;

    try {
      // 1. Update text fields
      const updatedData = { name, bio };
      await api.put(`/users/profile/${user.id}`, updatedData); // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/backend/routes/user.routes.js]
      textUpdateSuccess = true;

      // 2. Upload file if present
      if (file) {
        const formData = new FormData();
        formData.append('profilePicture', file); // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/backend/middleware/upload.middleware.js]
        const uploadResponse = await api.post(`/users/profile/${user.id}/upload`, formData, { // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/backend/routes/user.routes.js]
           headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Update preview state with the actual relative path from backend response
        if (uploadResponse.data && uploadResponse.data.imageUrl) { // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/backend/controllers/user.controller.js]
            setPreviewPathOrBlob(uploadResponse.data.imageUrl);
        }
        uploadSuccess = true;
        setFile(null); // Clear file input state
      }

      setSuccess('Profile updated successfully!');
      if (fetchCurrentUser) { // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/context/AuthContext.tsx]
        await fetchCurrentUser(); // Refetch user data
      }

    } catch (err: any) {
        console.error('❌ Profile update failed:', err);
        const apiError = err.response?.data?.error || 'Failed to update profile. Please try again.';
        if (!textUpdateSuccess) { setError(`Failed to update profile details: ${apiError}`); }
        else if (uploadAttempted && !uploadSuccess) { setError(`Profile details updated, but failed to upload picture: ${apiError}`); }
        else { setError(apiError); }
    } finally {
      setLoading(false);
    }
  };

  // Construct the full URL *for display* using the helper function
  const displayImageUrl = getFullImageUrl(previewPathOrBlob);

  // Prepare data for the SwipeCard preview
  const userCardProfile: UserProfile | null = user ? {
    id: user.id,
    name: name,
    age: user.age,
    bio: bio,
    email: user.email,
    imageUrl: displayImageUrl || 'https://via.placeholder.com/400?text=No+Image', // Use full URL for card [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/components/SwipeCard.tsx]
    profile_picture_url: previewPathOrBlob || user.profile_picture_url // Keep relative path here
  } : null;

  // Show loading state while AuthContext fetches user initially
  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading profile...</div>; // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/components/ProtectedRoute.tsx]
  }

  // --- JSX Rendering ---
  return (
    <main className="max-w-4xl mx-auto py-8 px-4 pb-20 md:pt-16 md:pb-10 grid md:grid-cols-2 gap-8 items-start"> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
      {/* Column 1: Edit Form */}
      <div className="order-2 md:order-1">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Profile</h1> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-6"> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4"> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
            <label className="block text-sm font-medium text-gray-700 mb-1 w-full text-center"> Profile Picture </label> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
            <div className="w-32 h-32 rounded-full border-4 border-pink-100 flex items-center justify-center bg-gray-100 overflow-hidden"> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
              {/* === Use the full displayImageUrl for the src === */}
              {displayImageUrl ? (
                <img
                  src={displayImageUrl} // <-- CORRECTED: Use the full URL
                  alt="Profile Preview"
                  className="w-full h-full object-cover" // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css]
                />
              ) : (
                <UserIcon className="text-gray-400" size={48} /> // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css]
              )}
            </div>
            {/* Upload button and input */}
            <label htmlFor="profilePicture" className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
                <UploadCloud size={16} />
                {/* Check the state holding the path/blob */}
                <span>{previewPathOrBlob ? 'Change Picture' : 'Upload Picture'}</span>
            </label>
            <input type="file" id="profilePicture" name="profilePicture" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} /> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
             <p className="text-xs text-gray-500 text-center"> PNG, JPG, WEBP. 5MB max. </p> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
          </div>

          {/* Name Input */}
          <FormInput label="Full Name" type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter your full name"/> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/components/FormInput.tsx] */}

          {/* Age Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"> Age </label> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
            <p className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl"> {user?.age || 'Not set'} </p> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
          </div>

          {/* Bio Textarea */}
           <div>
             <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1"> Bio </label> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
             <textarea id="bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition resize-none" placeholder="Tell us about yourself..."/> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
           </div>

          {/* Error/Success Messages */}
          {error && ( <div className="text-red-600 text-sm">{error}</div> )} {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
          {success && ( <div className="text-green-600 text-sm">{success}</div> )} {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}

          {/* Submit Button */}
          <button type="submit" disabled={loading || authLoading} className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50"> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

       {/* Column 2: Profile Card Preview */}
       <div className="order-1 md:order-2 md:sticky md:top-24"> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
         <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left">Profile Preview</h2> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
         <div className="relative w-full aspect-[3/4] max-w-sm mx-auto md:max-w-none md:w-[360px] md:h-[520px]"> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/pages/Dashboard.tsx, uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
           {/* SwipeCard now receives the correctly prefixed imageUrl */}
           {userCardProfile ? (
             <SwipeCard user={userCardProfile} /> // [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/components/SwipeCard.tsx]
           ) : (
             <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center"> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
               <p className="text-gray-500">Loading preview...</p> {/* [cite: uploaded:bl4ckkl1st3d/dating-app/dating-app-08cee35a11f62fa2814a01a3341fe4272e9db8c9/src/index.css] */}
             </div>
           )}
         </div>
       </div>
    </main>
  );
};

export default EditProfile;